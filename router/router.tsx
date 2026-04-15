export interface NavItem {
  label: string;
  icon: string; // Aquí guardamos el nombre del componente
  href: string;
  active: boolean;
}

// Nombres de componentes de la biblioteca Lucide (o similares)
const ICON_DASHBOARD = "LayoutDashboard";
const ICON_USERS = "Users";
const ICON_COACH = "UserSquare2";
const ICON_EXERCISE = "Dumbbell";
const ICON_PAYMENT = "CreditCard";
const ICON_NOTIFICATION = "Bell";
const ICON_CALENDAR = "Calendar";
const ICON_CLIENTS = "Contact2";
const ICON_REQUESTS = "ClipboardList";
const ICON_SEARCH = "Search";
const ICON_WORKOUT = "Activity";
const ICON_MEAL = "Utensils";
const ICON_PROGRESS = "TrendingUp";

export const ROLE_REDIRECTS: Record<string, string> = {
  coach: "/dashboards/coach",
  admin: "/dashboards/admin",
  client: "/dashboards/client",
  user: "/dashboards/client",
};

export const NAV_ITEMS_ADMIN: NavItem[] = [
  { label: "Dashboard",   icon: ICON_DASHBOARD, href: "/dashboards/admin",           active: false },
  { label: "Users",       icon: ICON_USERS,     href: "/dashboards/admin/users",     active: false },
  { label: "Coaches",     icon: ICON_COACH,     href: "/dashboards/admin/coaches",   active: false },
  { label: "Exercise DB", icon: ICON_EXERCISE,  href: "/dashboards/admin/exercises", active: false },
  { label: "Payments",    icon: ICON_PAYMENT,   href: "/dashboards/admin/payments",  active: false },
];

export const NAV_ITEMS_COACH: NavItem[] = [
  { label: "Dashboard",    icon: ICON_DASHBOARD, href: "/dashboards/coach",              active: false },
  { label: "My Clients",   icon: ICON_CLIENTS,   href: "/dashboards/coach/clients",       active: false },
  { label: "Requests",     icon: ICON_REQUESTS,  href: "/dashboards/coach/requests",      active: false },
  { label: "Availability", icon: ICON_CALENDAR,  href: "/dashboards/coach/availability",  active: false },
];

export const NAV_ITEMS_CLIENT: NavItem[] = [
  { label: "Dashboard",    icon: ICON_DASHBOARD, href: "/dashboards/client",          active: false },
  { label: "Find Coaches", icon: ICON_SEARCH,    href: "/dashboards/client/coaches",   active: false },
  { label: "My Workouts",  icon: ICON_WORKOUT,   href: "/dashboards/client/workouts",  active: false },
  { label: "My Meals",     icon: ICON_MEAL,      href: "/dashboards/client/meals",     active: false },
  { label: "Progress",     icon: ICON_PROGRESS,  href: "/dashboards/client/progress",  active: false },
];