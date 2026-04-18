import { createContext, useContext, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { useMe, useLogout } from "../api/useAuth";
import type { AuthUser } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER: AuthUser = {
  id: 0,
  name: Cookies.get("user_name") ?? "Creator",
  email: "demo",
  is_active: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const isDemoUser = Cookies.get("login_type") === "demo";
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  // Persist user_name cookie so UserWidget can display it instantly on next load
  useEffect(() => {
    if (user?.name) {
      Cookies.set("user_name", user.name, { expires: 7 });
    }
  }, [user?.name]);

  // For demo logins there is no DB user — provide a synthetic user object
  const effectiveUser = isDemoUser ? DEMO_USER : user;
  const effectiveLoading = isDemoUser ? false : isLoading;
  const isAuthenticated = isDemoUser || !!user;

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        isLoading: effectiveLoading,
        isAuthenticated,
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
