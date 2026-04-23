import type { ChannelData, VideoIdea, GeneratedScript, TitleItem, SeoData } from "./workflow";

export type ProjectStatus = "draft" | "saved" | "published" | "archived";

// The JSON blobs in a Project are versioned-at-write snapshots of what the
// workflow generated. We keep them structurally wide so older projects still
// load cleanly if the workflow shape evolves.
export interface ProjectIdeaJson {
  channel?: ChannelData | null;
  prompt?: string;
  ideas?: VideoIdea[];
  selectedIdea?: VideoIdea | null;
}

export interface ProjectScriptJson {
  script?: GeneratedScript | null;
}

export interface ProjectTitleJson {
  suggestedTitles?: TitleItem[];
  selectedTitle?: TitleItem | null;
}

export interface ProjectSeoJson {
  seo?: SeoData | null;
}

export interface Project {
  id: number;
  user_id: number;
  title: string | null;
  status: ProjectStatus;
  channel_id: number | null;
  idea_json: ProjectIdeaJson | null;
  script_json: ProjectScriptJson | null;
  title_json: ProjectTitleJson | null;
  seo_json: ProjectSeoJson | null;
  thumbnail_json: Record<string, unknown> | null;
  slug: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title?: string | null;
  status?: ProjectStatus;
  channel_id?: number | null;
  idea_json?: ProjectIdeaJson | null;
  script_json?: ProjectScriptJson | null;
  title_json?: ProjectTitleJson | null;
  seo_json?: ProjectSeoJson | null;
  thumbnail_json?: Record<string, unknown> | null;
  slug?: string | null;
}

export type ProjectUpdate = Partial<ProjectCreate>;
