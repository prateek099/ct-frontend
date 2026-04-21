import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";

// Routes that have their own dedicated nav/header with logout — widget not needed there
const ROUTES_WITH_OWN_NAV = new Set(["/", "/users"]);

export default function UserWidget() {
  const { user, isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated || ROUTES_WITH_OWN_NAV.has(pathname)) return null;

  const displayName = user?.name ?? Cookies.get("user_name") ?? "";

  return (
    <div
      style={{
        position: "fixed",
        top: "0.85rem",
        right: "1.25rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        background: "rgba(17, 24, 39, 0.88)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "2rem",
        padding: "0.35rem 0.5rem 0.35rem 1rem",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
        fontFamily: "sans-serif",
      }}
    >
      {displayName && (
        <span
          style={{
            color: "#cbd5e1",
            fontSize: "0.8rem",
            fontWeight: 500,
            letterSpacing: "0.01em",
            maxWidth: "140px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
        </span>
      )}
      <button
        onClick={logout}
        style={{
          background: "#dc2626",
          color: "#fff",
          border: "none",
          borderRadius: "1.5rem",
          padding: "0.3rem 0.85rem",
          cursor: "pointer",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
      >
        Logout
      </button>
    </div>
  );
}
