import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type { SavedChannel } from "../types/channel";

const CHANNELS_KEY = ["channels"] as const;

export function useChannels() {
  return useQuery<SavedChannel[]>({
    queryKey: CHANNELS_KEY,
    queryFn: async () => {
      const { data } = await client.get<SavedChannel[]>("/channels/");
      return data;
    },
  });
}

export function useCreateChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      const { data } = await client.post<SavedChannel>("/channels/", { url });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CHANNELS_KEY }),
  });
}

export function useRefreshChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await client.post<SavedChannel>(
        `/channels/${id}/refresh`,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CHANNELS_KEY }),
  });
}

export function useDeleteChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/channels/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CHANNELS_KEY }),
  });
}
