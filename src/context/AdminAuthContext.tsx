import { createContext, useContext, ReactNode } from "react";
import { useAdminLogout, useAdminMe, hasAdminSessionSignal } from "../api/useAdminAuth";
import type { AdminUser } from "../types/adminAuth";

interface AdminAuthContextValue {
  admin: AdminUser | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const presence = hasAdminSessionSignal();
  const { data: admin, isLoading } = useAdminMe();
  const logout = useAdminLogout();

  // `presence` is the synchronous "did we set the session cookie?" check.
  // `admin` is the async /admin/auth/me result. Both must agree for the
  // session to be considered live — protects against a stale cookie when
  // the server has already revoked the httpOnly token.
  const isAuthenticated = presence && !!admin;

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading: presence ? isLoading : false,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return ctx;
}
