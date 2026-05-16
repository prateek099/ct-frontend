import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/shared/Icon";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminLogin } from "../api/useAdminAuth";
import { getApiErrorMessage } from "../types/api";

/**
 * Admin login — standalone page outside the AdminShell.
 *
 * Visually distinct from the user-facing LoginPage so an admin opening
 * the wrong door is obvious. Plain email + password; no Google OAuth,
 * no signup link. Bootstrap admin is seeded server-side from env.
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const { isAuthenticated, isLoading } = useAdminAuth();
  const login = useAdminLogin();

  // Already signed in? Bounce to admin home (or the route they were
  // redirected from).
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, next]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ email, password });
      // Hard reload so AdminAuthContext re-reads cookies + /admin/auth/me lands fresh.
      window.location.replace(next);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Invalid admin credentials."));
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--night, #0e0b09)",
        color: "white",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,91,60,0.10), transparent 40%), " +
            "radial-gradient(circle at 82% 92%, rgba(37,99,235,0.10), transparent 45%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          background: "var(--night-2, rgba(255,255,255,0.04))",
          border: "1px solid var(--night-line, rgba(255,255,255,0.08))",
          borderRadius: 14,
          padding: 36,
          boxShadow: "0 32px 80px -16px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <svg width={32} height={32} viewBox="0 0 32 32" aria-hidden>
              <rect width="32" height="32" rx="8" fill="var(--coral, #ff5b3c)" />
              <path d="M12 10.2l9 5.8-9 5.8z" fill="#fff" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, textAlign: "left" }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
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
            </div>
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Sign in to admin
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
            }}
          >
            Admin credentials are managed separately from the user app. Use the email + password seeded for the admin role.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: "rgba(255,91,60,0.10)",
              border: "1px solid rgba(255,91,60,0.35)",
              color: "rgba(255,200,180,1)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon name="x" size={14} />
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
              Admin email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoFocus
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.25)",
                color: "white",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.25)",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: 6,
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                <Icon name={showPw ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            style={{
              marginTop: 4,
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background:
                "linear-gradient(180deg, var(--coral, #ff5b3c) 0%, var(--accent, #2563eb) 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              cursor: login.isPending ? "not-allowed" : "pointer",
              opacity: login.isPending ? 0.7 : 1,
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {login.isPending ? "Signing in…" : "Sign in"}
            <Icon name="arrowRight" size={14} />
          </button>
        </form>

        <div style={{ marginTop: 22, textAlign: "center" }}>
          <a
            href="/"
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="arrowLeft" size={12} />
            Back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
