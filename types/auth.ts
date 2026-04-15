export interface AuthUser {
  id:    number;
  name:  string;
  email: string;
  role:  string;
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