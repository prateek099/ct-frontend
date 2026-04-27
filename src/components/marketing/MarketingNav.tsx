import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavItem { label: string; href: string; }

const NAV: NavItem[] = [
  { label: "Product",       href: "/#product" },
  { label: "Tools",         href: "/#tools" },
  { label: "How it works",  href: "/#how" },
  { label: "Creators",      href: "/#proof" },
  { label: "Pricing",       href: "/pricing" },
  { label: "FAQ",           href: "/#faq" },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  // In-page anchors stay as <a>; route links use react-router <Link>
  if (href.startsWith("/#")) return <a href={href}>{children}</a>;
  return <Link to={href}>{children}</Link>;
}

export default function MarketingNav() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="nav">
      <div className="wrap nav-row">
        <Link to="/" className="brand">
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

        <div className="nav-links">
          {NAV.map((n) => (
            <NavLink key={n.label} href={n.href}>{n.label}</NavLink>
          ))}
        </div>

        <div className="nav-cta">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-dark">
              Open workspace{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/signup" className="btn btn-dark">Start free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
