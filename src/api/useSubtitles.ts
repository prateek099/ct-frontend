import { useMutation } from "@tanstack/react-query";
import client from "./client";
import type { SubtitlesResponse } from "../types/subtitle";

export interface FetchSubtitlesPayload {
  url: string;
  language?: string | null;
}

export function useFetchSubtitles() {
  return useMutation({
    mutationFn: async (payload: FetchSubtitlesPayload) => {
      const { data } = await client.post<SubtitlesResponse>(
        "/yt/subtitles",
        payload,
      );
      return data;
    },
  });
}
