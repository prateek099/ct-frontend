import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import type { User, UserCreate } from "../types/user";

const USERS_KEY = ["users"];

export function useUsers() {
  return useQuery<User[]>({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const { data } = await client.get<User[]>("/users/");
      return data;
    },
  });
}

export function useUser(id: number) {
  return useQuery<User>({
    queryKey: [...USERS_KEY, id],
    queryFn: async () => {
      const { data } = await client.get<User>(`/users/${id}`);
      return data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UserCreate) => {
      const { data } = await client.post<User>("/users/", payload);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
