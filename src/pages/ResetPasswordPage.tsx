import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useResetPassword } from "../api/useAuth";
import { getApiErrorMessage } from "../types/api";
import Icon from "../components/shared/Icon";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  
  const resetPassword = useResetPassword();

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, new_password: password });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to reset password."));
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
            {submitted ? "Password reset!" : "Set new password"}
          </h2>
          <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.5 }}>
            {submitted 
              ? "Your password has been successfully updated. You can now sign in with your new credentials."
              : "Choose a strong password that you haven't used before."}
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
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Icon name="x" size={14} />
            {error}
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
                  New password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "14px",
                      paddingRight: "40px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: "var(--r-md)",
                      color: "white", fontSize: 15, outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    tabIndex={-1}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      padding: 6, color: "rgba(255,255,255,0.6)",
                      background: "transparent", border: "none", cursor: "pointer",
                    }}
                  >
                    <Icon name={showPw ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
                  Confirm new password
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "var(--r-md)",
                    color: "white", fontSize: 15, outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetPassword.isPending || !token}
              style={{
                width: "100%", padding: "14px",
                borderRadius: "var(--r-md)", border: "none",
                background: "linear-gradient(180deg, var(--accent) 0%, var(--coral) 100%)",
                color: "white", fontWeight: 600, fontSize: 15,
                boxShadow: "var(--sh-cta)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                cursor: (resetPassword.isPending || !token) ? "not-allowed" : "pointer",
                opacity: (resetPassword.isPending || !token) ? 0.7 : 1,
                transition: "transform .15s",
              }}
            >
              {resetPassword.isPending ? "Updating..." : "Update Password"}
              <Icon name="check" size={16} />
            </button>
          </form>
        ) : (
          <Link to="/login" style={{
            width: "100%", padding: "14px",
            borderRadius: "var(--r-md)", border: "none",
            background: "linear-gradient(180deg, var(--accent) 0%, var(--coral) 100%)",
            color: "white", fontWeight: 600, fontSize: 15,
            textDecoration: "none", textAlign: "center",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "var(--sh-cta)",
          }}>
            Sign in now
            <Icon name="arrowRight" size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
