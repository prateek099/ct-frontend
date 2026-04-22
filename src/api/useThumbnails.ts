import { useMutation } from "@tanstack/react-query";
import client from "./client";
import type { ThumbnailResponse } from "../types/thumbnail";

export function useFetchThumbnails() {
  return useMutation({
    mutationFn: async (url: string) => {
      const { data } = await client.post<ThumbnailResponse>(
        "/yt/thumbnails",
        { url },
      );
      return data;
    },
  });
}
