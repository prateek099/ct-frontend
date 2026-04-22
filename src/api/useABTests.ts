import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type { ABTest, ABTestCreate, ABTestUpdate } from "../types/abTest";

const KEY = ["ab-tests"] as const;

export interface ABTestFilter {
  project_id?: number;
  status?: string;
}

export function useABTests(filter: ABTestFilter = {}) {
  const params: Record<string, string> = {};
  if (filter.project_id != null) params.project_id = String(filter.project_id);
  if (filter.status) params.status = filter.status;

  return useQuery<ABTest[]>({
    queryKey: [...KEY, filter],
    queryFn: async () => {
      const { data } = await client.get<ABTest[]>("/ab-tests/", { params });
      return data;
    },
  });
}

export function useCreateABTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ABTestCreate) => {
      const { data } = await client.post<ABTest>("/ab-tests/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateABTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: ABTestUpdate & { id: number }) => {
      const { data } = await client.patch<ABTest>(
        `/ab-tests/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteABTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/ab-tests/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
