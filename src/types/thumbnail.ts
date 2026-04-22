export interface ThumbnailSet {
  default: string;
  medium: string;
  high: string;
  standard: string;
  maxres: string;
}

export interface ThumbnailResponse {
  video_id: string;
  title: string;
  channel_name: string;
  thumbnails: ThumbnailSet;
}
