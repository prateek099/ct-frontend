import { useState, FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useLogin, useRegister } from "../api/useAuth";

type Mode = "login" | "register";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: 6,
  border: "1px solid #cbd5e0",
  fontSize: "0.95rem",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem",
  background: "#3182ce",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: "0.5rem",
};

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const login = useLogin();
  const register = useRegister();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
      } else {
        await register.mutateAsync({ name, email, password });
        // Auto-login after register
        await login.mutateAsync({ email, password });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.error?.detail;
      setError(typeof detail === "string" ? detail : "Something went wrong. Please try again.");
    }
  };

  const isLoading = login.isPending || register.isPending;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7fafc",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "2.5rem 2rem",
          width: "100%",
          maxWidth: 400,
        }}
      >
        {/* Header */}
        <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem", fontFamily: "sans-serif" }}>
          Creator Tools
        </h1>
        <p style={{ margin: "0 0 1.5rem", color: "#718096", fontFamily: "sans-serif" }}>
          {mode === "login" ? "Sign in to your account" : "Create a new account"}
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #feb2b2",
              borderRadius: 6,
              padding: "0.6rem 0.75rem",
              color: "#c53030",
              marginBottom: "1rem",
              fontFamily: "sans-serif",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", fontFamily: "sans-serif" }}>
                Full Name
              </label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", fontFamily: "sans-serif" }}>
              Email
            </label>
            <input
              style={inputStyle}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", fontFamily: "sans-serif" }}>
              Password
            </label>
            <input
              style={inputStyle}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button style={btnStyle} type="submit" disabled={isLoading}>
            {isLoading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={{ marginTop: "1.25rem", textAlign: "center", fontFamily: "sans-serif", fontSize: "0.9rem" }}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => { setMode("register"); setError(""); }}
                style={{ background: "none", border: "none", color: "#3182ce", cursor: "pointer", fontSize: "0.9rem" }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                style={{ background: "none", border: "none", color: "#3182ce", cursor: "pointer", fontSize: "0.9rem" }}
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
