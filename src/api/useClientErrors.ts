import { useMutation, useQuery } from "@tanstack/react-query";
import client from "./client";
import type { ClientErrorReport, ClientErrorRow } from "../types/clientError";

const CLIENT_ERRORS_KEY = ["client-errors"] as const;

/**
 * Capped to 4000 chars by the backend Pydantic schema; truncate here so a
 * runaway error message doesn't 422 and silently drop the report.
 */
const MAX_MESSAGE = 4000;
const MAX_STACK = 20000;
const MAX_URL = 2048;
const MAX_UA = 512;

function truncate(s: string | null | undefined, max: number): string | null {
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

/**
 * Fire-and-forget POST to /client-errors. Never throws — error reporters
 * that throw cause cascading failures. The whole point of this path is to
 * be the *last* thing that can break.
 */
export async function reportClientError(input: {
  message: string;
  stack?: string;
  source: "error" | "unhandledrejection";
  buildVersion?: string;
}): Promise<void> {
  try {
    const body: ClientErrorReport = {
      message: truncate(input.message, MAX_MESSAGE) ?? "(no message)",
      stack: truncate(input.stack, MAX_STACK),
      url: truncate(typeof window !== "undefined" ? window.location.href : null, MAX_URL),
      user_agent: truncate(
        typeof navigator !== "undefined" ? navigator.userAgent : null,
        MAX_UA,
      ),
      build_version: input.buildVersion ?? null,
      source: input.source,
    };
    await client.post("/client-errors/", body);
  } catch {
    // Deliberately swallowed. If the reporter itself errors we have no
    // backstop — surfacing it would loop us back through the same
    // unhandledrejection handler.
  }
}

export function useReportClientError() {
  return useMutation({
    mutationFn: reportClientError,
  });
}

export function useClientErrors(params: { limit?: number; offset?: number } = {}) {
  const { limit = 100, offset = 0 } = params;
  return useQuery<ClientErrorRow[]>({
    queryKey: [...CLIENT_ERRORS_KEY, limit, offset],
    queryFn: async () => {
      const { data } = await client.get<ClientErrorRow[]>("/client-errors/", {
        params: { limit, offset },
      });
      return data;
    },
  });
}
