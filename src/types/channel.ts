import type { VideoSummary } from "./workflow";

export interface SavedChannel {
  id: number;
  youtube_channel_id: string;
  channel_name: string;
  handle: string | null;
  description: string | null;
  subscriber_count: number | null;
  total_views: number | null;
  video_count: number | null;
  thumbnail_url: string | null;
  recent_videos: VideoSummary[];
  average_duration_seconds: number | null;
  last_refreshed_at: string;
  created_at: string;
}
