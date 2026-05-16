import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import client from "./client";
import type {
  AdminLoginRequest,
  AdminTokenResponse,
  AdminUser,
} from "../types/adminAuth";

export const ADMIN_ME_KEY = ["admin", "me"] as const;

/**
 * `admin_session` is a JS-readable presence cookie set on successful admin
 * login and cleared on logout. The actual auth tokens (admin_access_token /
 * admin_refresh_token) are httpOnly and cannot be read from JS. We use this
 * cookie purely as the "did the admin log in?" signal — analogous to
 * `user_name` for the regular user session.
 */
const ADMIN_SESSION_COOKIE = "admin_session";

function setAdminSessionPresence(name: string): void {
  Cookies.set(ADMIN_SESSION_COOKIE, name, { expires: 7 });
}

function clearAdminSessionPresence(): void {
  Cookies.remove(ADMIN_SESSION_COOKIE);
}

export function hasAdminSessionSignal(): boolean {
  return !!Cookies.get(ADMIN_SESSION_COOKIE);
}

export function useAdminMe() {
  return useQuery<AdminUser>({
    queryKey: ADMIN_ME_KEY,
    queryFn: async () => {
      const { data } = await client.get<AdminUser>("/admin/auth/me");
      return data;
    },
    retry: false,
    // Prateek: only fire when we already think we have an admin session.
    // Saves a 401 round-trip on every page load for non-admins.
    enabled: hasAdminSessionSignal(),
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminLoginRequest) => {
      const { data } = await client.post<AdminTokenResponse>("/admin/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      // Backend sets httpOnly admin_access_token + admin_refresh_token cookies.
      // The JS-readable session cookie below is just a presence signal.
      setAdminSessionPresence(data.name || data.email);
      queryClient.invalidateQueries({ queryKey: ADMIN_ME_KEY });
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return async () => {
    try {
      await client.post("/admin/auth/logout");
    } catch {
      // Server-side cookie clear failed (network etc.) — the redirect
      // below still tears down the client state.
    }
    clearAdminSessionPresence();
    queryClient.removeQueries({ queryKey: ADMIN_ME_KEY });
    window.location.href = "/admin/login";
  };
}

/** Used by the 401-interceptor in client.ts to wipe stale admin signal. */
export function dropAdminSessionPresence(): void {
  clearAdminSessionPresence();
}
