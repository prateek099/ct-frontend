import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type { SavedIdea, SavedIdeaCreate } from "../types/savedIdea";

const IDEAS_KEY = ["saved-ideas"] as const;

export function useSavedIdeas(opts: { limit?: number; offset?: number } = {}) {
  const params: Record<string, number> = {};
  if (opts.limit != null) params.limit = opts.limit;
  if (opts.offset != null) params.offset = opts.offset;

  return useQuery<SavedIdea[]>({
    queryKey: [...IDEAS_KEY, opts],
    queryFn: async () => {
      const { data } = await client.get<SavedIdea[]>("/ideas/", { params });
      return data;
    },
  });
}

export function useSaveIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SavedIdeaCreate) => {
      const { data } = await client.post<SavedIdea>("/ideas/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: IDEAS_KEY }),
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/ideas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: IDEAS_KEY }),
  });
}
