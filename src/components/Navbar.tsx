import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 2rem",
        background: "#2d3748",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Creator Tools</span>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.9rem", color: "#a0aec0" }}>
            {user.name} ({user.email})
          </span>
          <button
            onClick={logout}
            style={{
              background: "#e53e3e",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.35rem 0.85rem",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
