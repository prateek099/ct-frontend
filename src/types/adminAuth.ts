export interface AdminUser {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminTokenResponse {
  name: string;
  email: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
}
