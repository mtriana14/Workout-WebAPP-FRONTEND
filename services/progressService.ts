import { apiClient } from "@/lib/api";

export interface ProgressEntry {
  entry_id: number;
  user_id: number;
  entry_date: string;
  weight: number | null;
  workouts_completed: number;
  calories_burned: number;
  goal_completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressSummary {
  total_workouts: number;
  current_streak: number;
  weekly_calories: number;
  goals_met_percentage: number;
  latest_weight: number | null;
  weight_change: number | null;
  entries_count: number;
}

interface ProgressResponse {
  entries: ProgressEntry[];
  summary: ProgressSummary;
}

interface SaveProgressResponse {
  message: string;
  entry: ProgressEntry;
  summary: ProgressSummary;
}

export interface SaveProgressPayload {
  entry_date: string;
  weight: number | null;
  workouts_completed: number;
  calories_burned: number;
  goal_completed: boolean;
  notes?: string;
}

type ActivityType = "strength" | "cardio" | "steps" | "calories";

interface ActivityLog {
  log_id: number;
  user_id: number;
  activity_type: ActivityType;
  log_date: string | null;
  notes: string | null;
  created_at: string | null;
  sets_completed?: number | null;
  reps_completed?: number | null;
  duration_minutes?: number | null;
  calorie_intake?: number | null;
}

interface LogsResponse {
  total: number;
  logs: ActivityLog[];
}

interface AggregateDaily {
  date: string;
  strength_sessions?: number;
  cardio_sessions?: number;
  calories?: number;
}

interface AggregateResponse {
  totals?: {
    strength_sessions?: number;
    cardio_sessions?: number;
    total_calories?: number;
    active_days?: number;
  };
  daily?: AggregateDaily[];
}

interface StepsCaloriesResponse {
  message: string;
  log: ActivityLog;
}

const PROGRESS_STORAGE_PREFIX = "herahealth.progress.";
const GOAL_MARKER = "[Goal Met]";

function storageKey(userId: number) {
  return `${PROGRESS_STORAGE_PREFIX}${userId}`;
}

function getLocalEntries(userId: number): ProgressEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey(userId));
    return rawValue ? (JSON.parse(rawValue) as ProgressEntry[]) : [];
  } catch {
    return [];
  }
}

function setLocalEntries(userId: number, entries: ProgressEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey(userId), JSON.stringify(entries));
}

function entryFromPayload(userId: number, payload: SaveProgressPayload): ProgressEntry {
  const timestamp = new Date().toISOString();
  return {
    entry_id: Date.now(),
    user_id: userId,
    entry_date: payload.entry_date,
    weight: payload.weight,
    workouts_completed: Number(payload.workouts_completed || 0),
    calories_burned: Number(payload.calories_burned || 0),
    goal_completed: Boolean(payload.goal_completed),
    notes: payload.notes?.trim() || null,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function upsertLocalEntry(userId: number, entry: ProgressEntry) {
  const existingEntries = getLocalEntries(userId);
  const withoutSameDate = existingEntries.filter((item) => item.entry_date !== entry.entry_date);
  const entries = [entry, ...withoutSameDate].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  setLocalEntries(userId, entries);
  return entries;
}

function mergeEntries(apiEntries: ProgressEntry[], localEntries: ProgressEntry[]) {
  const entriesByDate = new Map<string, ProgressEntry>();

  for (const entry of apiEntries) {
    entriesByDate.set(entry.entry_date, entry);
  }

  for (const entry of localEntries) {
    entriesByDate.set(entry.entry_date, entry);
  }

  return Array.from(entriesByDate.values()).sort((a, b) => b.entry_date.localeCompare(a.entry_date));
}

function normalizeDate(value: string | null) {
  return value?.split("T")[0].split(" ")[0] ?? "";
}

function detailsFromLogs(logs: ActivityLog[]) {
  const detailsByDate: Record<string, { notes: string[]; goalMet: boolean }> = {};

  for (const log of logs) {
    const dateKey = normalizeDate(log.log_date);
    if (!dateKey) {
      continue;
    }

    detailsByDate[dateKey] ??= { notes: [], goalMet: false };

    if (!log.notes) {
      continue;
    }

    if (log.notes.includes(GOAL_MARKER)) {
      detailsByDate[dateKey].goalMet = true;
      const cleanNote = log.notes.replace(GOAL_MARKER, "").trim();
      if (cleanNote) {
        detailsByDate[dateKey].notes.push(cleanNote);
      }
      continue;
    }

    detailsByDate[dateKey].notes.push(log.notes);
  }

  return detailsByDate;
}

function entriesFromAggregate(userId: number, aggregate: AggregateResponse, logs: ActivityLog[]) {
  const detailsByDate = detailsFromLogs(logs);

  return (aggregate.daily ?? [])
    .map((day, index) => {
      const dateKey = normalizeDate(day.date);
      const details = detailsByDate[dateKey] ?? { notes: [], goalMet: false };

      return {
        entry_id: index,
        user_id: userId,
        entry_date: dateKey,
        weight: null,
        workouts_completed: Number(day.strength_sessions ?? 0) + Number(day.cardio_sessions ?? 0),
        calories_burned: Number(day.calories ?? 0),
        goal_completed: details.goalMet,
        notes: details.notes.length > 0 ? details.notes.join(" | ") : null,
        created_at: day.date,
        updated_at: day.date,
      } satisfies ProgressEntry;
    })
    .filter((entry) => entry.entry_date)
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date));
}

function buildSummary(entries: ProgressEntry[], aggregate?: AggregateResponse): ProgressSummary {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);

  const activeDates = new Set(
    entries
      .filter((entry) => entry.goal_completed || entry.workouts_completed > 0)
      .map((entry) => entry.entry_date),
  );

  let currentStreak = 0;
  const cursor = new Date(today);
  while (activeDates.has(cursor.toISOString().slice(0, 10))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const weightEntries = entries.filter((entry) => entry.weight !== null);
  const latestWeight = weightEntries[0]?.weight ?? null;
  const previousWeight = weightEntries[1]?.weight ?? null;
  const goalsMet = entries.filter((entry) => entry.goal_completed).length;

  return {
    total_workouts:
      aggregate?.totals
        ? Number(aggregate.totals.strength_sessions ?? 0) + Number(aggregate.totals.cardio_sessions ?? 0)
        : entries.reduce((total, entry) => total + entry.workouts_completed, 0),
    current_streak: aggregate?.totals?.active_days ?? currentStreak,
    weekly_calories:
      aggregate?.totals?.total_calories ??
      entries.reduce((total, entry) => {
        const entryDate = new Date(`${entry.entry_date}T00:00:00`);
        return entryDate >= weekStart && entryDate <= today ? total + entry.calories_burned : total;
      }, 0),
    goals_met_percentage: entries.length ? Math.round((goalsMet / entries.length) * 100) : 0,
    latest_weight: latestWeight,
    weight_change:
      latestWeight !== null && previousWeight !== null
        ? Number((latestWeight - previousWeight).toFixed(1))
        : null,
    entries_count: entries.length,
  };
}

function logToEntry(userId: number, log: ActivityLog, payload: SaveProgressPayload): ProgressEntry {
  return {
    ...entryFromPayload(userId, payload),
    entry_id: log.log_id,
    created_at: log.created_at ?? new Date().toISOString(),
    updated_at: log.created_at ?? new Date().toISOString(),
  };
}

export const progressService = {
  getByClient: async (userId: number): Promise<ProgressResponse> => {
    const localEntries = getLocalEntries(userId);

    try {
      const [aggregate, logs] = await Promise.all([
        apiClient<AggregateResponse>("logs/aggregate?period=week"),
        apiClient<LogsResponse>("logs").catch(() => ({ total: 0, logs: [] })),
      ]);
      const apiEntries = entriesFromAggregate(userId, aggregate, logs.logs);
      const entries = mergeEntries(apiEntries, localEntries);
      return {
        entries,
        summary: buildSummary(entries, aggregate),
      };
    } catch {
      return {
        entries: localEntries,
        summary: buildSummary(localEntries),
      };
    }
  },

  saveEntry: async (userId: number, payload: SaveProgressPayload): Promise<SaveProgressResponse> => {
    let entry = entryFromPayload(userId, payload);
    let message = "Progress saved locally";

    try {
      const notes = payload.goal_completed
        ? `${GOAL_MARKER}${payload.notes ? ` ${payload.notes}` : ""}`
        : payload.notes || null;
      const response = await apiClient<StepsCaloriesResponse>("logs/steps-calories", {
        method: "POST",
        body: {
          log_date: payload.entry_date,
          calorie_intake: payload.calories_burned,
          step_count: payload.calories_burned > 0 ? null : 0,
          notes,
        },
      });
      entry = logToEntry(userId, response.log, payload);
      message = response.message;
    } catch {
      // Hosted activity logs can return 500. Keep the user's progress usable locally.
    }

    const entries = upsertLocalEntry(userId, entry);

    return {
      message,
      entry,
      summary: buildSummary(entries),
    };
  },
};
