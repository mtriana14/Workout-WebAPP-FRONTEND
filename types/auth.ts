export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  user_id?: number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  message: string;
  token:   string;
  user:    AuthUser;
}

export interface LoginCredentials {
  email:    string;
  password: string;
}
