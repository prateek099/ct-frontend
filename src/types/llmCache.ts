export interface LLMCacheRow {
  id: number;
  cache_key: string;
  endpoint: string;
  model: string;
  total_tokens: number | null;
  hit_count: number;
  created_at: string;
  last_hit_at: string;
}

export interface LLMCacheDetail {
  id: number;
  cache_key: string;
  endpoint: string;
  model: string;
  system_prompt: string | null;
  user_prompt: string;
  response_body: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  hit_count: number;
  created_at: string;
  last_hit_at: string;
}

export interface LLMCacheListQuery {
  limit?: number;
  offset?: number;
  endpoint?: string;
  model?: string;
  search?: string;
}
