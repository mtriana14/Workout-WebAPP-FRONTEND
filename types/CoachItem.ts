export interface CoachItem {
  id:             number;
  user_id:        number;
  name:           string;
  email:          string;
  specialization: string;
  status:         "approved" | "pending" | "rejected";
  created_at:     string;
  verified_at:    string | null;
}

export interface CoachesResponse {
  coaches: CoachItem[];
}