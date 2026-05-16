import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../shared/Icon";
import { useAdminAuth } from "../../context/AdminAuthContext";

/**
 * AdminShell — layout chrome for /admin/* routes.
 *
 * Deliberately distinct from the user-facing AppShell:
 *   - dark top bar branded as "Creator OS · Admin"
 *   - vertical nav listing every admin section
 *   - explicit "Back to workspace" link so an admin can switch contexts fast
 *
 * Mounted via main.tsx — every /admin/* route is wrapped in <AdminRoute>
 * (auth gate) and then this shell (presentation).
 */

interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
  description?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", path: "/admin", icon: "home", description: "Overview + quick links" },
  { label: "Prompts", path: "/admin/prompts", icon: "cog", description: "System & user prompt overrides per AI tool" },
  { label: "Users", path: "/admin/users", icon: "users", description: "Registered users" },
  { label: "LLM usage", path: "/admin/llm-usage", icon: "chart", description: "Token spend per user / endpoint" },
  { label: "Auth events", path: "/admin/auth-events", icon: "shield", description: "Login / refresh / password reset audit log" },
  { label: "Client errors", path: "/admin/client-errors", icon: "bell", description: "Frontend crashes captured in-app" },
  { label: "System", path: "/admin/system", icon: "sliders", description: "Runtime config + connectivity snapshot" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = admin?.name ?? "Admin";
  const displayEmail = admin?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          height: 56,
          flex: "0 0 56px",
          background: "var(--night, #0e0b09)",
          color: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 16,
          borderBottom: "1px solid var(--night-line, rgba(255,255,255,0.08))",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <Link
          to="/admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: "white",
            textDecoration: "none",
          }}
          aria-label="Admin home"
        >
          <svg width={26} height={26} viewBox="0 0 32 32" aria-hidden>
            <rect width="32" height="32" rx="8" fill="var(--coral, #ff5b3c)" />
            <path d="M12 10.2l9 5.8-9 5.8z" fill="#fff" />
          </svg>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>
              Creator OS
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--coral, #ff5b3c)",
              }}
            >
              Admin
            </span>
          </span>
        </Link>

        <nav
          style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6 }}
        >
          {ADMIN_NAV.map((item) => {
            const active = item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: active ? "white" : "rgba(255,255,255,0.65)",
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background .12s, color .12s",
                }}
              >
                <Icon name={item.icon} size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => navigate("/dashboard")}
          title="Back to workspace"
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.8)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
          }}
        >
          <Icon name="arrowLeft" size={12} />
          Workspace
        </button>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            title={displayEmail}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--coral, #ff5b3c), var(--accent, #2563eb))",
              color: "white",
              fontWeight: 700,
              fontSize: 11,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {initials}
          </span>
          {displayEmail && (
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--font-mono, monospace)",
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayEmail}
            </span>
          )}
          <button
            onClick={logout}
            title="Sign out"
            style={{
              padding: "7px 10px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.75)",
              fontSize: 12,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
            }}
          >
            <Icon name="logout" size={12} />
            Sign out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main
        style={{
          flex: 1,
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          padding: "28px 24px 64px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
