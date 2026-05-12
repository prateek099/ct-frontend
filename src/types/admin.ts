export interface SystemInfo {
  app: {
    name: string;
    environment: string;
    debug: boolean;
  };
  logging: {
    level: string;
    format: string;
  };
  auth: {
    jwt_algorithm: string;
    access_ttl_minutes: number;
    refresh_ttl_days: number;
  };
  openai: {
    configured: boolean;
    default_model: string;
    token_budget_per_user_daily: number;
    token_budget_demo_daily: number;
    token_budget_window_hours: number;
  };
  youtube: { configured: boolean };
  google_oauth: { configured: boolean };
  smtp: { configured: boolean; from_email: string | null };
  cors: { origins: string[] };
  cache: { idempotency_ttl_hours: number };
  database: { status: "ok" | "error" };
}

export type LLMUsageGroupBy = "user" | "endpoint";

export interface LLMUsageRow {
  key: string;
  user_id: number | null;
  total_calls: number;
  total_tokens: number;
  cache_hits: number;
  cost_estimate_usd: number;
}

export interface LLMUsageResponse {
  days: number;
  group_by: LLMUsageGroupBy;
  rows: LLMUsageRow[];
  totals: {
    total_calls: number;
    total_tokens: number;
    cache_hits: number;
    cost_estimate_usd: number;
  };
}
