import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import MarketingShell from "../../components/marketing/MarketingShell";

interface Props {
  eyebrow: string;
  title: ReactNode;
  blurb: string;
  bullets?: string[];
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
}

const ARROW = (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
  </svg>
);

export default function MarketingPlaceholder({
  eyebrow,
  title,
  blurb,
  bullets = [],
  primaryCta = { label: "Start free — connect YouTube", to: "/signup" },
  secondaryCta = { label: "Back to home", to: "/" },
}: Props) {
  const isMail = primaryCta.to.startsWith("mailto:");
  return (
    <MarketingShell>
      <section style={{ padding: "96px 0 60px" }}>
        <div className="wrap" style={{ maxWidth: 920, textAlign: "center" }}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 style={{
            margin: "14px 0 0",
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: "-.03em",
            lineHeight: 1.02,
            color: "var(--ink)",
          }}>
            {title}
          </h1>
          <p style={{
            margin: "22px auto 0",
            fontSize: 17,
            color: "var(--ink-2)",
            lineHeight: 1.55,
            maxWidth: 620,
          }}>
            {blurb}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            {isMail ? (
              <a href={primaryCta.to} className="btn btn-primary btn-lg">
                {primaryCta.label} {ARROW}
              </a>
            ) : (
              <Link to={primaryCta.to} className="btn btn-primary btn-lg">
                {primaryCta.label} {ARROW}
              </Link>
            )}
            <Link to={secondaryCta.to} className="btn btn-line btn-lg">
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {bullets.length > 0 && (
        <section style={{ padding: "20px 0 60px" }}>
          <div className="wrap" style={{ maxWidth: 1080 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
            }}>
              {bullets.map((b) => (
                <div key={b} style={{
                  padding: 22,
                  borderRadius: 14,
                  background: "var(--paper)",
                  border: "1px solid var(--hair)",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "var(--coral-soft)",
                    color: "var(--coral)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flex: "0 0 28px",
                  }}>
                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 8.5 2.5 2.5L12 5.5" />
                    </svg>
                  </span>
                  <span style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: "20px 0 80px" }}>
        <div className="wrap" style={{ maxWidth: 920 }}>
          <div style={{
            padding: "32px 28px",
            borderRadius: 18,
            background: "var(--canvas-2)",
            border: "1px dashed var(--hair)",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 13.5,
          }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--coral)", fontWeight: 600 }}>
              ★ Coming soon
            </span>
            <div style={{ marginTop: 8, color: "var(--ink-2)" }}>
              This page is a placeholder — full content shipping soon.{" "}
              <Link to="/contact" style={{ color: "var(--coral)", fontWeight: 600 }}>Get in touch</Link> for a preview.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
