export type ClientErrorSource = "error" | "unhandledrejection";

export interface ClientErrorReport {
  message: string;
  stack?: string | null;
  url?: string | null;
  user_agent?: string | null;
  build_version?: string | null;
  source: ClientErrorSource;
}

export interface ClientErrorRow {
  id: number;
  user_id: number | null;
  message: string;
  stack: string | null;
  url: string | null;
  user_agent: string | null;
  build_version: string | null;
  source: ClientErrorSource;
  created_at: string;
}
