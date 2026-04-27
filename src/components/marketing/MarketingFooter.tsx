import { useState } from "react";
import { Link } from "react-router-dom";

const PRODUCT = [
  { label: "Workspace",  to: "/products" },
  { label: "Pipeline",   to: "/features" },
  { label: "Tools",      to: "/products" },
  { label: "Pricing",    to: "/pricing" },
  { label: "Changelog",  to: "/blog" },
];

const COMPANY = [
  { label: "About",      to: "/about" },
  { label: "Careers",    to: "/about" },
  { label: "Blog",       to: "/blog" },
  { label: "Press",      to: "/contact" },
  { label: "Contact",    to: "/contact" },
];

export default function MarketingFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="foot-col">
            <Link to="/" className="brand" style={{ marginBottom: 14 }}>
              <div className="brand-mark">
                <svg width={14} height={14} viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 2.5v9l8-4.5z" />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span className="brand-name">Creator OS</span>
                <span className="brand-sub">For YouTube</span>
              </div>
            </Link>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55, maxWidth: 280 }}>
              The workspace solo YouTubers use to ship one more video a week — from idea to published.
            </p>
          </div>

          <div className="foot-col">
            <h5>Product</h5>
            {PRODUCT.map((l) => (
              <Link key={l.label} to={l.to}>{l.label}</Link>
            ))}
          </div>

          <div className="foot-col">
            <h5>Company</h5>
            {COMPANY.map((l) => (
              <Link key={l.label} to={l.to}>{l.label}</Link>
            ))}
          </div>

          <form className="foot-col foot-news" onSubmit={onSubscribe}>
            <h5>The Tuesday memo</h5>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
              One creator workflow breakdown each Tuesday. No spam.
            </p>
            <input
              type="email"
              placeholder="you@yourchannel.tv"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-dark" style={{ width: "100%" }}>
              {subscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Creator OS Inc.</span>
          <span className="mono">Made by creators, for creators.</span>
        </div>
      </div>
    </footer>
  );
}
