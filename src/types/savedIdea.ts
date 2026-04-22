export interface SavedIdea {
  id: number;
  title: string;
  hook: string | null;
  angle: string | null;
  format: string | null;
  reasoning: string | null;
  source_prompt: string | null;
  source_project_id: number | null;
  created_at: string;
}

export interface SavedIdeaCreate {
  title: string;
  hook?: string | null;
  angle?: string | null;
  format?: string | null;
  reasoning?: string | null;
  source_prompt?: string | null;
  source_project_id?: number | null;
}
