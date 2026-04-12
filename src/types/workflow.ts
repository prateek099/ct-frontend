export interface VideoSummary {
  id: string;
  title: string;
  description: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration_seconds: number;
  published_at: string;
}

export interface ChannelData {
  channel_id: string;
  channel_name: string;
  handle: string;
  description: string;
  subscriber_count: number;
  total_views: number;
  video_count: number;
  thumbnail_url: string;
  recent_videos: VideoSummary[];
  average_duration_seconds: number;
}

export interface VideoIdea {
  title: string;
  hook: string;
  angle: string;
  format: string;
  reasoning: string;
}

export interface ScriptSection {
  name: string;
  content: string;
}

export interface ScriptData {
  word_count: number;
  estimated_duration_seconds: number;
  sections: ScriptSection[];
  full_script: string;
}

export interface GeneratedScript {
  title: string;
  flavor: string;
  script: ScriptData;
}

export interface TitleItem {
  title: string;
  style: string;
  ctr_angle: string;
  search_intent: string;
  seo_keywords: string[];
  reasoning: string;
}

export interface SeoData {
  title: string;
  description: string;
  description_word_count: number;
  hashtags: string[];
  tags: string;
  tags_char_count: number;
  primary_keyword: string;
  secondary_keywords: string[];
}
