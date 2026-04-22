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

export interface TopVideo {
  id: string;
  title: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration_seconds: number;
  published_at: string;
}

export interface ChannelStats {
  channel_id: number;
  channel_name: string;
  subscriber_count: number | null;
  total_views: number | null;
  video_count: number | null;
  average_duration_seconds: number | null;
  sample_size: number;
  recent_views_sum: number;
  recent_likes_sum: number;
  recent_comments_sum: number;
  average_views_per_video: number;
  engagement_rate: number;
  videos_per_week: number;
  top_videos: TopVideo[];
  last_refreshed_at: string;
}
