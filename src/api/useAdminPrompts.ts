import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type {
  PromptOverride,
  PromptOverrideHistoryEntry,
  PromptOverrideUpdate,
  PromptTool,
} from "../types/adminPrompt";

const PROMPTS_KEY = ["admin-prompts"] as const;

export function useAdminPrompts() {
  return useQuery<PromptOverride[]>({
    queryKey: PROMPTS_KEY,
    queryFn: async () => {
      const { data } = await client.get<PromptOverride[]>("/admin/prompts/");
      return data;
    },
  });
}

export function useAdminPromptHistory(tool: PromptTool | null) {
  return useQuery<PromptOverrideHistoryEntry[]>({
    queryKey: [...PROMPTS_KEY, "history", tool],
    enabled: tool != null,
    queryFn: async () => {
      const { data } = await client.get<PromptOverrideHistoryEntry[]>(
        `/admin/prompts/${tool}/history`,
      );
      return data;
    },
  });
}

export function usePutAdminPrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tool,
      ...payload
    }: PromptOverrideUpdate & { tool: PromptTool }) => {
      const { data } = await client.put<PromptOverride>(
        `/admin/prompts/${tool}`,
        payload,
      );
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: PROMPTS_KEY });
      qc.invalidateQueries({
        queryKey: [...PROMPTS_KEY, "history", vars.tool],
      });
    },
  });
}
