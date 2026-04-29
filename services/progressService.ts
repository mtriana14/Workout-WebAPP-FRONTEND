import { getStoredAuthToken } from "@/app/lib/api";

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

export interface SaveProgressPayload {
  entry_date: string;
  weight: number | null;
  workouts_completed: number;
  calories_burned: number;
  goal_completed: boolean;
  notes?: string;
}

export const progressService = {
  getByClient: async (userId: number) => {
    const token = getStoredAuthToken();
    if (!token) throw new Error("Authentication token missing. Please log in again.");

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000/api";
    
    // 1. Fetch aggregate totals, raw logs (for notes), and user profile (for weight) concurrently
    const [aggRes, logsRes, userRes] = await Promise.all([
      fetch(`${API_BASE_URL}/logs/aggregate?period=week`, {
        headers: { "Authorization": `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/getusers?user_id=${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
    ]);

    if (!aggRes.ok) throw new Error("Failed to fetch progress summary.");

    const rawData = await aggRes.json();
    const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };
    const userData = userRes.ok ? await userRes.json() : [];

    // 2. Extract Current Weight from the profile
    let currentWeight = null;
    if (userData.length > 0) {
      const userRow = userData[0];
      currentWeight = Array.isArray(userRow) ? userRow[9] : userRow.weight;
    }

    // 3. Extract Notes & Goal Status from raw logs and group them by date
    const detailsByDate: Record<string, { notes: string[], goalMet: boolean }> = {};
    
    if (logsData.logs) {
      logsData.logs.forEach((log: any) => {
        // Standardize the date format to YYYY-MM-DD
        const dateKey = log.log_date.split("T")[0].split(" ")[0]; 
        
        if (!detailsByDate[dateKey]) {
          detailsByDate[dateKey] = { notes: [], goalMet: false };
        }
        
        if (log.notes) {
          if (log.notes.includes("[Goal Met]")) {
            detailsByDate[dateKey].goalMet = true;
            const cleanNote = log.notes.replace("[Goal Met]", "").trim();
            if (cleanNote) detailsByDate[dateKey].notes.push(cleanNote);
          } else {
            detailsByDate[dateKey].notes.push(log.notes);
          }
        }
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    // 4. Map the Aggregate 'daily' buckets and inject the notes and weight
    const mappedEntries: ProgressEntry[] = (rawData.daily || []).map((day: any, index: number) => {
      const dateKey = day.date.split("T")[0];
      const details = detailsByDate[dateKey] || { notes: [], goalMet: false };
      
      return {
        entry_id: index,
        user_id: userId,
        entry_date: dateKey,
        // Backend doesn't track historical weight, so we assign the current weight to today
        weight: dateKey === today ? currentWeight : null, 
        workouts_completed: day.strength_sessions + day.cardio_sessions,
        calories_burned: day.calories,
        goal_completed: details.goalMet, 
        // If multiple logs have notes on the same day, combine them
        notes: details.notes.length > 0 ? details.notes.join(" | ") : null,
        created_at: day.date,
        updated_at: day.date,
      };
    }).reverse();

    // 5. Translate totals to summary
    const mappedSummary: ProgressSummary = {
      total_workouts: (rawData.totals?.strength_sessions || 0) + (rawData.totals?.cardio_sessions || 0),
      current_streak: rawData.totals?.active_days || 0,
      weekly_calories: rawData.totals?.total_calories || 0,
      goals_met_percentage: 0,
      latest_weight: currentWeight,
      weight_change: null,
      entries_count: rawData.daily?.length || 0,
    };

    return {
      entries: mappedEntries,
      summary: mappedSummary,
    };
  },

  saveEntry: async (userId: number, payload: SaveProgressPayload) => {
    const token = getStoredAuthToken();
    if (!token) throw new Error("Authentication token missing. Please log in again.");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000/api";

    const requests: Promise<any>[] = [];

    // 1. SAVE CALORIES & NOTES
    // The backend requires either calories or steps to log this route. 
    // If we only have notes, we send step_count: 0 to satisfy the backend validation.
    if (payload.calories_burned > 0 || payload.notes || payload.goal_completed) {
      let finalNotes = payload.notes || "";
      if (payload.goal_completed) {
        finalNotes = finalNotes ? `[Goal Met] ${finalNotes}` : "[Goal Met]";
      }

      const logReq = fetch(`${API_BASE_URL}/logs/steps-calories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          log_date: payload.entry_date,
          calorie_intake: payload.calories_burned > 0 ? payload.calories_burned : null,
          step_count: payload.calories_burned <= 0 ? 0 : null, // Fallback to satisfy backend
          notes: finalNotes || null
        })
      });
      requests.push(logReq);
    }

    // 2. SAVE WEIGHT
    // We utilize the dual-route fallback strategy from your api.ts file
    if (payload.weight !== null && payload.weight > 0) {
      const weightReq = fetch(`${API_BASE_URL}/auth/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ weight: payload.weight })
      }).then((res) => {
        if (!res.ok) {
          // Fallback to the customers route if auth/update returns 404
          return fetch(`${API_BASE_URL}/customers/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ weight: payload.weight })
          });
        }
        return res;
      });
      requests.push(weightReq);
    }

    // Execute all necessary saves concurrently
    const responses = await Promise.all(requests);
    
    // Check if any requests failed
    for (const res of responses) {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save some progress data.");
      }
    }

    // 3. REFRESH THE PAGE DATA
    // Pull the fresh aggregate data to update the UI
    const refreshedData = await progressService.getByClient(userId);

    return {
      message: "Progress successfully saved!",
      entry: refreshedData.entries[0] || null, 
      summary: refreshedData.summary
    };
  },
};