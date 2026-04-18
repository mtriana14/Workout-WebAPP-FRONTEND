export interface UserItem {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  role:       "client" | "coach" | "admin";
  is_active:  boolean;
  created_at: string;
}