export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  name?: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  is_admin?: boolean;
}

export interface WorkflowLoginRequest {
  username: string; // base64-encoded
  password: string; // base64-encoded
}
