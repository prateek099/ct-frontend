import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type {
  CalendarEvent,
  CalendarEventCreate,
  CalendarEventUpdate,
} from "../types/calendar";

const KEY = ["calendar"] as const;

export interface CalendarRange {
  from?: string;
  to?: string;
}

export function useCalendarEvents(range: CalendarRange = {}) {
  const params: Record<string, string> = {};
  if (range.from) params.from = range.from;
  if (range.to) params.to = range.to;

  return useQuery<CalendarEvent[]>({
    queryKey: [...KEY, range],
    queryFn: async () => {
      const { data } = await client.get<CalendarEvent[]>("/calendar/", {
        params,
      });
      return data;
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CalendarEventCreate) => {
      const { data } = await client.post<CalendarEvent>("/calendar/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: CalendarEventUpdate & { id: number }) => {
      const { data } = await client.patch<CalendarEvent>(
        `/calendar/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/calendar/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
