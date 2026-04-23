import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type { Project, ProjectCreate, ProjectUpdate } from "../types/project";

const PROJECTS_KEY = ["projects"] as const;

interface ListOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

export function useProjects(opts: ListOptions = {}) {
  const params: Record<string, string | number> = {};
  if (opts.status) params.status = opts.status;
  if (opts.limit != null) params.limit = opts.limit;
  if (opts.offset != null) params.offset = opts.offset;

  return useQuery<Project[]>({
    queryKey: [...PROJECTS_KEY, opts],
    queryFn: async () => {
      const { data } = await client.get<Project[]>("/projects/", { params });
      return data;
    },
  });
}

export function useProject(id: number | null | undefined) {
  return useQuery<Project>({
    queryKey: [...PROJECTS_KEY, "detail", id],
    enabled: id != null,
    queryFn: async () => {
      const { data } = await client.get<Project>(`/projects/${id}`);
      return data;
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProjectCreate) => {
      const { data } = await client.post<Project>("/projects/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ProjectUpdate & { id: number }) => {
      const { data } = await client.patch<Project>(`/projects/${id}`, payload);
      return data;
    },
    onSuccess: (proj) => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      qc.setQueryData([...PROJECTS_KEY, "detail", proj.id], proj);
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/projects/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function usePublishProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await client.post<Project>(`/projects/${id}/publish`);
      return data;
    },
    onSuccess: (proj) => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      qc.setQueryData([...PROJECTS_KEY, "detail", proj.id], proj);
    },
  });
}
