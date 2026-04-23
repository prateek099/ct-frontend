// SignupPage.tsx

import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useRegister, useLogin, useGoogleUrl } from "../api/useAuth";
import Icon from "../components/shared/Icon";
import { getApiErrorMessage } from "../types/api";

const FEATURES = [
  { icon: "lightbulb", text: "Hook-scored video ideas ranked by trend lift" },
  { icon: "pencil", text: "AI script writer with live quality review" },
  { icon: "tag", text: "CTR-predicted title generator" },
  { icon: "align", text: "SEO description + hashtags in one click" },
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const register = useRegister();
  const login = useLogin();
  const { data: googleData } = useGoogleUrl();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Register the user
      await register.mutateAsync({ name, email, password });
      // 2. Automatically log them in
      await login.mutateAsync({ email, password });
      window.location.replace("/");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create account."));
    }
  };

  const isPending = register.isPending || login.isPending;

  return (
    <div className="login-page">
      {/* Enhanced Left Panel - Consistent with LoginPage */}
      <div
        className="login-panel"
        style={{
          background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 30% 40%, rgba(255,77,46,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Floating particles */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "15%",
            width: 200,
            height: 200,
            background:
              "radial-gradient(circle, rgba(255,77,46,0.03) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "30%",
            left: "10%",
            width: 250,
            height: 250,
            background:
              "radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="brand" style={{ padding: 0, marginBottom: 32 }}>
            <div
              className="brand-mark"
              style={{
                boxShadow: "0 0 0 3px rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(135deg, var(--accent) 0%, #ff6b4a 100%)",
                transition: "transform 0.3s ease",
                animation: "pulseGlow 3s ease-in-out infinite",
              }}
            />
            <div>
              <div
                className="brand-name"
                style={{
                  color: "white",
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                Creator OS
              </div>
              <div
                className="brand-tag"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                for YouTube
              </div>
            </div>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 38,
              fontWeight: 400,
              lineHeight: 1.15,
              color: "white",
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            Your AI-powered
            <br />
            <em
              style={{
                color: "var(--accent)",
                fontStyle: "italic",
                background: "linear-gradient(135deg, #ff4d2e 0%, #ff8a6e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              YouTube studio.
            </em>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 15,
              lineHeight: 1.7,
              margin: 0,
              maxWidth: "90%",
            }}
          >
            From idea to published — one workspace, 19 tools, zero
            tab-switching.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
            zIndex: 1,
          }}
        >
          {FEATURES.map((f, index) => (
            <div
              key={f.icon}
              className="row"
              style={{
                gap: 16,
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  flexShrink: 0,
                  background:
                    "linear-gradient(135deg, rgba(255,77,46,0.2) 0%, rgba(255,77,46,0.1) 100%)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--accent)",
                  border: "1px solid rgba(255,77,46,0.15)",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(255,77,46,0.1)",
                }}
              >
                <Icon name={f.icon} size={18} />
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.5,
                  fontWeight: 400,
                  transition: "color 0.2s ease",
                }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            margin: 0,
            position: "relative",
            zIndex: 1,
            letterSpacing: "0.02em",
          }}
        >
          © {new Date().getFullYear()} Creator Tools · All rights reserved
        </p>
      </div>

      {/* Enhanced Right Form Side - Consistent with LoginPage */}
      <div
        className="login-form-side"
        style={{
          background: "#0d1117",
          position: "relative",
        }}
      >
        <div
          className="login-form"
          style={{
            maxWidth: 420,
            width: "100%",
            animation: "fadeIn 0.6s ease-out",
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <h2
              className="h2"
              style={{
                marginBottom: 8,
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "white",
              }}
            >
              Create your account
            </h2>
            <p
              className="muted small"
              style={{
                marginBottom: 0,
                fontSize: 15,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Start your Creator OS workspace
            </p>
          </div>

          {error && (
            <div
              className="error-banner"
              style={{
                background:
                  "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.1) 100%)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 24,
                color: "#fca5a5",
                fontSize: 14,
                animation: "shake 0.5s ease-out",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label
                className="field-label"
                htmlFor="name"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.02em",
                }}
              >
                Full Name
              </label>
              <div
                style={{
                  position: "relative",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  id="name"
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  autoFocus
                  autoComplete="name"
                  placeholder="Jane Doe"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border:
                      focusedField === "name"
                        ? "1.5px solid var(--accent)"
                        : "1.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label
                className="field-label"
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.02em",
                }}
              >
                Email address
              </label>
              <div
                style={{
                  position: "relative",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  id="email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="email"
                  placeholder="your@email.com"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border:
                      focusedField === "email"
                        ? "1.5px solid var(--accent)"
                        : "1.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label
                className="field-label"
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.02em",
                }}
              >
                Password
              </label>
              <div className="input-wrap" style={{ position: "relative" }}>
                <input
                  id="password"
                  className="input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 48px 14px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border:
                      focusedField === "password"
                        ? "1.5px solid var(--accent)"
                        : "1.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
                  }
                >
                  <Icon name={showPw ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn primary"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 8,
                padding: "14px",
                background: "linear-gradient(135deg, #ff4d2e 0%, #ff6b4a 100%)",
                border: "none",
                borderRadius: 12,
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(255,77,46,0.3)",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                if (!isPending) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(255,77,46,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(255,77,46,0.3)";
              }}
            >
              {isPending ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span
                    className="spinner"
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Creating account…
                </span>
              ) : (
                "Create account →"
              )}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "28px 0",
                color: "rgba(255,255,255,0.3)",
                fontSize: 13,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <span
                style={{
                  padding: "0 16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: 11,
                }}
              >
                Or continue with
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <button
              type="button"
              className="btn secondary"
              style={{
                width: "100%",
                justifyContent: "center",
                background: "white",
                color: "#0d1117",
                padding: "14px",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onClick={() => {
                if (googleData?.url) window.location.href = googleData.url;
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              <Icon name="youtube" size={20} style={{ color: "#EA4335" }} />
              Continue with Google
            </button>

            <p
              style={{
                textAlign: "center",
                marginTop: 28,
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "var(--accent)",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  borderBottom: "1.5px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(255,255,255,0.08); }
          50% { box-shadow: 0 0 0 6px rgba(255,77,46,0.15); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
