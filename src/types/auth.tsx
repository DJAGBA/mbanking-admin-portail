export interface LoginRequest {
  username: string;
  password: string;
}
// LoginResponse
export interface LoginResponse {
  status: {
    code: number;
    message: string;
  };
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
}