export interface SubtitleEntry {
  start: number;
  duration: number;
  text: string;
}

export interface SubtitlesResponse {
  video_id: string;
  language: string;
  entries: SubtitleEntry[];
  srt: string;
  vtt: string;
}
