import { createContext, useContext, ReactNode } from "react";
import { useMe, useLogout } from "../api/useAuth";
import type { AuthUser } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
