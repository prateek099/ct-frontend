import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

interface Props {
  children: React.ReactNode;
}

/**
 * Gates an admin route. Uses the SEPARATE admin session (admin_users table)
 * — not the user `is_admin` flag. Unauthenticated admins go to /admin/login,
 * NOT /login (which is the user app's entry).
 */
export default function AdminRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-subtle, #888)",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          fontSize: 14,
        }}
      >
        Checking admin session…
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve where the admin was trying to go so we can bounce them back
    // after a successful login.
    const next = location.pathname + location.search;
    return <Navigate to={`/admin/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}
