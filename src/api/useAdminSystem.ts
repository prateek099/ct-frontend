import { useQuery } from "@tanstack/react-query";
import client from "./client";
import type { LLMUsageGroupBy, LLMUsageResponse, SystemInfo } from "../types/admin";

const SYSTEM_INFO_KEY = ["admin", "system-info"] as const;
const LLM_USAGE_KEY = ["admin", "llm-usage"] as const;

export function useSystemInfo() {
  return useQuery<SystemInfo>({
    queryKey: SYSTEM_INFO_KEY,
    queryFn: async () => {
      const { data } = await client.get<SystemInfo>("/admin/system-info");
      return data;
    },
    // Prateek: snapshot doesn't change unless an env var flipped — let the user
    // press Refresh explicitly rather than re-fetching every focus.
    staleTime: 60_000,
  });
}

export function useLLMUsage(params: { days?: number; group_by?: LLMUsageGroupBy } = {}) {
  const { days = 7, group_by = "user" } = params;
  return useQuery<LLMUsageResponse>({
    queryKey: [...LLM_USAGE_KEY, days, group_by],
    queryFn: async () => {
      const { data } = await client.get<LLMUsageResponse>("/admin/llm-usage", {
        params: { days, group_by },
      });
      return data;
    },
  });
}
