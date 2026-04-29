import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, 
  Users,
  UserSquare2, 
  Dumbbell, 
  CreditCard, 
  Calendar, 
  Contact2, 
  ClipboardList, 
  MessageCircle,
  Search, 
  Settings,
  Activity, 
  Utensils, 
  TrendingUp,
  Bell,
  User,
  DollarSign,
  Images,
  ReceiptText,
  Star,
  CalendarDays
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon; // <-- Removed `| string`
  href: string;
  active: boolean;
}

export const ROLE_REDIRECTS: Record<string, string> = {
  coach: "/dashboards/coach",
  admin: "/dashboards/admin",
  client: "/dashboards/client",
  user: "/dashboards/client",
};

export const NAV_ITEMS_ADMIN: NavItem[] = [
  { label: "Dashboard",   icon: LayoutDashboard, href: "/dashboards/admin",           active: false },
  { label: "Users",       icon: Users,           href: "/dashboards/admin/users",     active: false },
  { label: "Coaches",     icon: UserSquare2,     href: "/dashboards/admin/coaches",   active: false },
  { label: "Exercise DB", icon: Dumbbell,        href: "/dashboards/admin/exercises", active: false },
  { label: "Payments",    icon: CreditCard,      href: "/dashboards/admin/payments",  active: false },
];

export const NAV_ITEMS_COACH: NavItem[] = [
  { label: "Dashboard",    icon: LayoutDashboard, href: "/dashboards/coach",              active: false },
  { label: "My Clients",   icon: Contact2,        href: "/dashboards/coach/clients",       active: false },
  { label: "Requests",     icon: ClipboardList,   href: "/dashboards/coach/requests",      active: false },
  { label: "Availability", icon: Calendar,        href: "/dashboards/coach/availability",  active: false },
  { label: "Workout Plans", icon: Activity,       href: "/dashboards/coach/workouts",      active: false },
  { label: "Meal Plans",    icon: Utensils,       href: "/dashboards/coach/meals",         active: false },
  { label: "Schedule",      icon: Bell,           href: "/dashboards/coach/schedule",      active: false },
  { label: "Coach Revenue", icon: DollarSign,     href: "/dashboards/coach/revenue",       active: false },
  { label: "Chat",          icon: MessageCircle,  href: "/dashboards/coach/chat",          active: false },
  { label: "Profile",       icon: User,           href: "/dashboards/coach/profile",       active: false },
  { label: "Settings",      icon: Settings,       href: "/dashboards/coach/settings",      active: false },
];

export const NAV_ITEMS_CLIENT: NavItem[] = [
  { label: "Dashboard",    icon: LayoutDashboard, href: "/dashboards/client",          active: false },
  { label: "Find Coaches", icon: Search,          href: "/dashboards/client/coaches",   active: false },
  { label: "My Workouts",  icon: Activity,        href: "/dashboards/client/workouts",  active: false },
  { label: "My Meals",     icon: Utensils,        href: "/dashboards/client/meals",     active: false },
  { label: "Weekly Calendar", icon: CalendarDays, href: "/weekly-calendar",             active: false },
  { label: "Progress",     icon: TrendingUp,      href: "/dashboards/client/progress",  active: false },
  { label: "Progress Photos", icon: Images,       href: "/dashboards/client/progress/photos", active: false },
  { label: "My Invoices",  icon: ReceiptText,     href: "/my-invoices",                 active: false },
  { label: "Leave Review", icon: Star,            href: "/leave-a-review",              active: false },
];
