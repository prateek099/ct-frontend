import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import client from "./client";
import type { AuthUser, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, TokenResponse, WorkflowLoginRequest } from "../types/auth";

export const AUTH_ME_KEY = ["auth", "me"];

/**
 * The access/refresh tokens live in httpOnly cookies the backend sets on
 * /auth/login. JS can't read them, so we use the non-sensitive `user_name`
 * cookie (set on every successful login) as the "is logged in" presence
 * signal — avoids firing /auth/me on every marketing-page load.
 */
function hasSessionSignal(): boolean {
  return !!Cookies.get("user_name");
}

export function useMe() {
  return useQuery<AuthUser>({
    queryKey: AUTH_ME_KEY,
    queryFn: async () => {
      const { data } = await client.get<AuthUser>("/auth/me");
      return data;
    },
    retry: false,
    // Skip /auth/me entirely for demo users — they have no DB record
    enabled:
      hasSessionSignal() &&
      Cookies.get("login_type") !== "demo",
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await client.post<TokenResponse>("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => {
      // Backend sets httpOnly access_token / refresh_token cookies — we only
      // remember the display name so the UI can render before /auth/me lands.
      if (data.name) Cookies.set("user_name", data.name, { expires: 7 });
      queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
    },
  });
}

export function useWorkflowLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WorkflowLoginRequest) => {
      const { data } = await client.post<TokenResponse>("/login", payload);
      return data;
    },
    onSuccess: (data) => {
      Cookies.set("login_type", "demo", { expires: 7 });
      if (data.name) Cookies.set("user_name", data.name, { expires: 7 });
      queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const { data } = await client.post<AuthUser>("/auth/register", payload);
      return data;
    },
  });
}

export function useGoogleUrl() {
  return useQuery<{ url: string }>({
    queryKey: ["auth", "google", "url"],
    queryFn: async () => {
      const { data } = await client.get<{ url: string }>("/auth/google/url");
      return data;
    },
    staleTime: Infinity,
  });
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await client.post<TokenResponse>("/auth/google", { code });
      return data;
    },
    onSuccess: (data) => {
      if (data.name) Cookies.set("user_name", data.name, { expires: 7 });
      queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return async () => {
    // Best-effort: clear server-side httpOnly cookies. If this errors (e.g.
    // backend unreachable) we still tear down the client state and redirect
    // — the user has asked to leave, don't strand them on an error screen.
    try {
      await client.post("/auth/logout");
    } catch {
      // Swallow — the redirect below is the important part.
    }
    Cookies.remove("login_type");
    Cookies.remove("user_name");
    queryClient.clear();
    window.location.href = "/login";
  };
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordRequest) => {
      const { data } = await client.post<{ message: string }>("/auth/forgot-password", payload);
      return data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordRequest) => {
      const { data } = await client.post<{ message: string }>("/auth/reset-password", payload);
      return data;
    },
  });
}
