export type PromptTool = "ideas" | "script" | "title" | "seo";

export interface PromptOverride {
  id: number;
  tool: PromptTool;
  system_prompt: string | null;
  user_prompt_template: string | null;
  updated_by_user_id: number | null;
  updated_at: string;
}

export interface PromptOverrideUpdate {
  system_prompt?: string | null;
  user_prompt_template?: string | null;
}

export interface PromptOverrideHistoryEntry {
  id: number;
  tool: PromptTool;
  system_prompt: string | null;
  user_prompt_template: string | null;
  updated_by_user_id: number | null;
  updated_at: string;
}

export const TOOL_META: Record<PromptTool, { label: string; code: string }> = {
  ideas: { label: "Video Idea Generator", code: "T1" },
  script: { label: "Script Writer", code: "T2" },
  title: { label: "Title Generator", code: "T3" },
  seo: { label: "SEO Description", code: "T4" },
};
