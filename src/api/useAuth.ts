import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type { AuthUser, LoginRequest, RegisterRequest, TokenResponse } from "../types/auth";

export const AUTH_ME_KEY = ["auth", "me"];

export function useMe() {
  return useQuery<AuthUser>({
    queryKey: AUTH_ME_KEY,
    queryFn: async () => {
      const { data } = await client.get<AuthUser>("/auth/me");
      return data;
    },
    retry: false,
    enabled: !!localStorage.getItem("access_token"),
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
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
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

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    queryClient.clear();
    window.location.href = "/login";
  };
}
