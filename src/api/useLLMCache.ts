import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type {
  LLMCacheDetail,
  LLMCacheListQuery,
  LLMCacheRow,
} from "../types/llmCache";

const LLM_CACHE_KEY = ["admin", "llm-cache"] as const;

export function useLLMCacheList(params: LLMCacheListQuery = {}) {
  const { limit = 100, offset = 0, endpoint, model, search } = params;
  return useQuery<LLMCacheRow[]>({
    queryKey: [
      ...LLM_CACHE_KEY,
      limit,
      offset,
      endpoint ?? null,
      model ?? null,
      search ?? null,
    ],
    queryFn: async () => {
      const { data } = await client.get<LLMCacheRow[]>("/admin/llm-cache/", {
        params: {
          limit,
          offset,
          ...(endpoint ? { endpoint } : {}),
          ...(model ? { model } : {}),
          ...(search ? { search } : {}),
        },
      });
      return data;
    },
  });
}

export function useLLMCacheDetail(id: number | null) {
  return useQuery<LLMCacheDetail>({
    queryKey: [...LLM_CACHE_KEY, "detail", id],
    enabled: id != null,
    queryFn: async () => {
      const { data } = await client.get<LLMCacheDetail>(`/admin/llm-cache/${id}`);
      return data;
    },
  });
}

export function useDeleteLLMCacheEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/admin/llm-cache/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LLM_CACHE_KEY });
    },
  });
}
