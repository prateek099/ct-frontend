import { useQuery } from "@tanstack/react-query";
import client from "./client";
import type { TrendingResponse } from "../types/trending";

const KEY = ["trending"] as const;

export interface TrendingFilter {
  region: string;
  category?: string | null;
  max?: number;
}

export function useTrending(filter: TrendingFilter) {
  const params: Record<string, string> = { region: filter.region };
  if (filter.category) params.category = filter.category;
  if (filter.max) params.max = String(filter.max);

  return useQuery<TrendingResponse>({
    queryKey: [...KEY, filter],
    queryFn: async () => {
      const { data } = await client.get<TrendingResponse>("/trending/", {
        params,
      });
      return data;
    },
  });
}
