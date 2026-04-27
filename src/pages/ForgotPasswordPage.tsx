import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../api/useAuth";
import { getApiErrorMessage } from "../types/api";
import Icon from "../components/shared/Icon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await forgotPassword.mutateAsync({ email });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Failed to send reset link.");
      setError(msg);
      if (msg.toLowerCase().includes("sign up first")) {
        window.alert(msg);
      }
    }
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--night)", color: "white",
      overflow: "hidden", fontFamily: "var(--font-sans)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      {/* Background Gradients */}
      <div style={{
        position: "absolute", inset: 0,
        background:
          "radial-gradient(circle at 18% 18%, rgba(255,90,54,0.15), transparent 50%), " +
          "radial-gradient(circle at 82% 92%, rgba(107,75,255,0.15), transparent 55%), " +
          "var(--night)",
        zIndex: 0
      }} />
      
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 420, padding: 40,
        background: "var(--night-2)",
        border: "1px solid var(--night-line)",
        borderRadius: "var(--r-lg)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
      }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <svg width={32} height={32} viewBox="0 0 32 32" aria-hidden>
              <rect width="32" height="32" rx="8" fill="var(--coral)" />
              <path d="M12 10.2l9 5.8-9 5.8z" fill="#fff" />
            </svg>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Creator OS</span>
          </div>
          
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {submitted ? "Check your email" : "Forgot password?"}
          </h2>
          <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.5 }}>
            {submitted 
              ? `We've sent a password reset link to ${email}. Please check your inbox.`
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#fca5a5",
            borderRadius: "var(--r-md)",
            padding: "12px 16px",
            fontSize: 13,
            marginBottom: 24,
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="x" size={14} />
              <span style={{ flex: 1 }}>{error}</span>
            </div>
            {error.includes("sign up") && (
              <Link 
                to="/signup" 
                style={{ 
                  color: "white", 
                  fontWeight: 600, 
                  textDecoration: "underline",
                  fontSize: 12,
                  marginLeft: 24
                }}
              >
                Go to Sign up →
              </Link>
            )}
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "var(--r-md)",
                  color: "white", fontSize: 15, outline: "none",
                  transition: "border-color .15s, background .15s",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={forgotPassword.isPending}
              style={{
                width: "100%", padding: "14px",
                borderRadius: "var(--r-md)", border: "none",
                background: "linear-gradient(180deg, var(--accent) 0%, var(--coral) 100%)",
                color: "white", fontWeight: 600, fontSize: 15,
                boxShadow: "var(--sh-cta)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                cursor: forgotPassword.isPending ? "not-allowed" : "pointer",
                opacity: forgotPassword.isPending ? 0.7 : 1,
                transition: "transform .15s",
              }}
            >
              {forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
              <Icon name="arrowRight" size={16} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSubmitted(false)}
            style={{
              width: "100%", padding: "14px",
              borderRadius: "var(--r-md)", border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent", color: "white", fontWeight: 600, fontSize: 15,
              cursor: "pointer",
              transition: "background .15s",
            }}
          >
            Try another email
          </button>
        )}

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link to="/login" style={{ 
            fontSize: 14, color: "rgba(255,255,255,0.45)", 
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 
          }}>
            <Icon name="arrowRight" size={14} style={{ transform: "rotate(180deg)" }} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
