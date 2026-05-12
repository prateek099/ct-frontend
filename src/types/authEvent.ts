export type AuthEventType =
  | "register_success"
  | "register_failed"
  | "login_success"
  | "login_failed"
  | "google_success"
  | "google_failed"
  | "refresh_success"
  | "refresh_failed"
  | "logout"
  | "password_reset_request"
  | "password_reset_success"
  | "password_reset_failed"
  | "workflow_login_success"
  | "workflow_login_failed";

export interface AuthEventRow {
  id: number;
  user_id: number | null;
  event_type: AuthEventType | string;
  provider: string | null;
  ip: string | null;
  user_agent: string | null;
  success: boolean;
  detail: string | null;
  created_at: string;
}

export interface AuthEventsQuery {
  limit?: number;
  offset?: number;
  user_id?: number;
  event_type?: AuthEventType | string;
  success?: boolean;
}
