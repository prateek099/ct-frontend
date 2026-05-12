import { useQuery } from "@tanstack/react-query";
import client from "./client";
import type { AuthEventRow, AuthEventsQuery } from "../types/authEvent";

const AUTH_EVENTS_KEY = ["auth-events"] as const;

export function useAuthEvents(params: AuthEventsQuery = {}) {
  const { limit = 100, offset = 0, user_id, event_type, success } = params;
  return useQuery<AuthEventRow[]>({
    queryKey: [...AUTH_EVENTS_KEY, limit, offset, user_id ?? null, event_type ?? null, success ?? null],
    queryFn: async () => {
      const { data } = await client.get<AuthEventRow[]>("/auth-events/", {
        params: {
          limit,
          offset,
          ...(user_id !== undefined ? { user_id } : {}),
          ...(event_type !== undefined ? { event_type } : {}),
          ...(success !== undefined ? { success } : {}),
        },
      });
      return data;
    },
  });
}
