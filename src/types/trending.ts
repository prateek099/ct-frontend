export interface TrendingVideo {
  id: string;
  title: string;
  channel_name: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string;
  duration_seconds: number;
  thumbnail_url: string;
}

export interface TrendingResponse {
  region: string;
  category_id: string | null;
  fetched_at: string;
  cached: boolean;
  videos: TrendingVideo[];
}
