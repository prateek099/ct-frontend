// Sidebar — narrow icon rail with hover flyouts + ⌘K command palette.
// 6 grouped buttons (Create / Improve / Research / Plan / Publish / Utilities) +
// Home + Search + Projects + Avatar.

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../shared/Icon";
import { useAuth } from "../../context/AuthContext";

interface NavTool {
  code: string;
  name: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}
interface NavGroup {
  id: string;
  label: string;
  blurb: string;
  color: string;
  tools: NavTool[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "create", label: "Create", blurb: "Build the next video", color: "var(--coral)",
    tools: [
      { code: "T1",  name: "Video Ideas",     path: "/idea",       icon: "lightbulb" },
      { code: "T2",  name: "Script Writer",   path: "/script",     icon: "pencil"    },
      { code: "T3",  name: "Title Generator", path: "/title",      icon: "tag"       },
      { code: "T4",  name: "Description",     path: "/description", icon: "align"     },
      { code: "T5",  name: "Thumbnail Lab",   path: "/thumbnail",  icon: "image"     },
      { code: "T11", name: "AI Voiceover",    path: "/voiceover",  icon: "mic"       },
      { code: "T13", name: "Video Generator", path: "/video",      icon: "film"      },
    ],
  },
  {
    id: "improve", label: "Improve", blurb: "Polish & adapt", color: "#6B4BFF",
    tools: [
      { code: "T12", name: "Review Script", path: "/review",    icon: "sparkles" },
      { code: "T14", name: "Repurpose",     path: "/repurpose", icon: "split"    },
    ],
  },
  {
    id: "research", label: "Research", blurb: "Spot what's working", color: "#19C37D",
    tools: [
      { code: "T7", name: "Trending Finder", path: "/trending", icon: "trend" },
      { code: "T8", name: "Channel Stats",   path: "/stats",    icon: "chart" },
    ],
  },
  {
    id: "plan", label: "Plan", blurb: "Schedule your week", color: "#F4A724",
    tools: [
      { code: "T10", name: "Content Calendar", path: "/calendar", icon: "calendar" },
    ],
  },
  {
    id: "publish", label: "Publish", blurb: "Take it live", color: "#FF477E",
    tools: [
      { code: "T15", name: "Link in Bio", path: "/linkinbio", icon: "link" },
      { code: "T16", name: "My Shop",     path: "/shop",      icon: "bag"  },
    ],
  },
  {
    id: "utilities", label: "Utilities", blurb: "Helpers & admin", color: "#A39E93",
    tools: [
      { code: "T17", name: "Thumbnail Downloader", path: "/thumbnail-downloader", icon: "download" },
      { code: "T18", name: "Subtitles Downloader", path: "/subtitles-downloader", icon: "download" },
      { code: "T19", name: "Copyright Checker",    path: "/copyright",            icon: "shield"   },
      { code: "T9",  name: "Prompt Admin",         path: "/admin",                icon: "cog", adminOnly: true },
    ],
  },
];

interface SidebarProps {
  onOpenProjects?: () => void;
  projectsOpen?: boolean;
  projectsCount?: number;
}

export default function Sidebar({ onOpenProjects, projectsOpen = false, projectsCount = 0 }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [showCmd, setShowCmd] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const visibleGroups = useMemo(
    () => NAV_GROUPS.map(g => ({ ...g, tools: g.tools.filter(t => !t.adminOnly || user?.is_admin) })),
    [user?.is_admin]
  );

  // ⌘K / Ctrl-K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCmd(s => !s);
      }
      if (e.key === "Escape") setShowCmd(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const onHome = location.pathname === "/";
  const initials = (user?.name ?? "C").split(" ").map(s => s[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside
      onMouseLeave={() => setHoverGroup(null)}
      style={{
        width: 76, flex: "0 0 76px",
        background: "var(--night)", color: "white",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "16px 0", borderRight: "1px solid var(--night-line)",
        position: "sticky", top: 0, height: "100vh",
        zIndex: 5,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 20 }}>
        <svg width={34} height={34} viewBox="0 0 32 32" aria-hidden>
          <rect width="32" height="32" rx="8" fill="var(--coral)" />
          <path d="M12 10.2l9 5.8-9 5.8z" fill="#fff" />
        </svg>
      </div>

      {/* Search → command palette */}
      <button
        onClick={() => setShowCmd(true)}
        title="Search · ⌘K"
        style={{
          width: 44, height: 44, borderRadius: 12, marginBottom: 8, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <Icon name="search" size={18} />
      </button>

      {/* Home */}
      <RailButton icon="home" label="Home" active={onHome} onClick={() => navigate("/")} />

      <Divider />

      {/* Groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        {visibleGroups.map(g => (
          <GroupButton
            key={g.id}
            group={g}
            currentPath={location.pathname}
            isOpen={hoverGroup === g.id}
            onOpen={() => setHoverGroup(g.id)}
            onClose={() => setHoverGroup(null)}
            onPick={(path) => { navigate(path); setHoverGroup(null); }}
          />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Projects toggle */}
      {onOpenProjects && (
        <button
          onClick={onOpenProjects}
          title="Saved projects"
          style={{
            width: 44, height: 44, borderRadius: 12, marginBottom: 10,
            background: projectsOpen ? "var(--coral)" : "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: projectsOpen ? "white" : "rgba(255,255,255,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", cursor: "pointer",
          }}
        >
          <Icon name="grid" size={18} />
          {projectsCount > 0 && (
            <span style={{
              position: "absolute", top: -3, right: -3, minWidth: 18, height: 18,
              borderRadius: 99, background: "var(--mint-bright)", color: "var(--night)",
              fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid var(--night)", padding: "0 4px",
            }}>{projectsCount}</span>
          )}
        </button>
      )}

      {/* Avatar w/ logout popover */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowAvatarMenu(s => !s)}
          title={user?.name ?? "Account"}
          style={{
            width: 36, height: 36, borderRadius: "50%", border: "none",
            background: "linear-gradient(135deg, #FF5A36, #FF477E)",
            color: "white", fontWeight: 700, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >{initials}</button>
        {showAvatarMenu && (
          <AvatarMenu user={user} onClose={() => setShowAvatarMenu(false)} onLogout={logout} />
        )}
      </div>

      {showCmd && (
        <CommandPalette
          groups={visibleGroups}
          onClose={() => setShowCmd(false)}
          onPick={(path) => { setShowCmd(false); navigate(path); }}
        />
      )}
    </aside>
  );
}

function Divider() {
  return <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.08)", margin: "10px 0" }} />;
}

function RailButton({ icon, label, active, onClick }: {
  icon: string; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 44, height: 44, borderRadius: 12, marginBottom: 4, border: "none",
        background: active ? "var(--coral)" : "transparent",
        color: active ? "white" : "rgba(255,255,255,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background .12s", cursor: "pointer",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

function GroupButton({ group, currentPath, isOpen, onOpen, onClose, onPick }: {
  group: NavGroup; currentPath: string;
  isOpen: boolean; onOpen: () => void; onClose: () => void;
  onPick: (path: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const hasActive = group.tools.some(t => t.path === currentPath);
  const main = group.tools[0];

  useEffect(() => {
    if (isOpen && ref.current) setTop(ref.current.getBoundingClientRect().top);
  }, [isOpen]);

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}
      onMouseEnter={onOpen}
    >
      <button
        onClick={() => onPick(main.path)}
        title={group.label}
        style={{
          width: 44, height: 44, borderRadius: 12, border: "none",
          background: hasActive ? group.color : isOpen ? "rgba(255,255,255,0.06)" : "transparent",
          color: hasActive ? "white" : "rgba(255,255,255,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", transition: "background .12s", cursor: "pointer",
        }}
      >
        <Icon name={main.icon} size={18} />
        <span style={{
          position: "absolute", bottom: 4, right: 4,
          width: 5, height: 5, borderRadius: 99,
          background: hasActive ? "white" : group.color,
          opacity: hasActive ? 0.85 : 0.9,
        }} />
      </button>
      <div style={{
        fontSize: 9, marginTop: 2, fontWeight: 600,
        color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", textTransform: "uppercase",
      }}>{group.label}</div>

      {isOpen && (
        <div
          onMouseLeave={onClose}
          style={{
            position: "fixed", top, left: 76, minWidth: 240,
            background: "var(--night-2)", color: "white",
            border: "1px solid var(--night-line)",
            borderRadius: "var(--r-lg)",
            padding: 8,
            boxShadow: "0 24px 60px -12px rgba(0,0,0,0.6)",
            animation: "fadeUp .14s ease-out",
            zIndex: 50,
          }}
        >
          <div style={{
            padding: "8px 12px 12px", borderBottom: "1px solid var(--night-line)", marginBottom: 6,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              color: group.color, textTransform: "uppercase",
            }}>{group.label}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
              {group.blurb}
            </div>
          </div>
          {group.tools.map(t => {
            const active = currentPath === t.path;
            return (
              <button
                key={t.code}
                onClick={() => onPick(t.path)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, border: "none",
                  display: "flex", alignItems: "center", gap: 10,
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  color: "rgba(255,255,255,0.92)", fontSize: 13, fontWeight: 500, textAlign: "left",
                  cursor: "pointer", fontFamily: "inherit",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = active ? "rgba(255,255,255,0.08)" : "transparent")}
              >
                <span style={{ color: group.color, display: "inline-flex" }}>
                  <Icon name={t.icon} size={16} />
                </span>
                <span style={{ flex: 1 }}>{t.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)",
                }}>{t.code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CommandPalette({ groups, onClose, onPick }: {
  groups: NavGroup[]; onClose: () => void; onPick: (path: string) => void;
}) {
  const [q, setQ] = useState("");
  const all = useMemo(
    () => groups.flatMap(g => g.tools.map(t => ({ ...t, group: g.label, color: g.color }))),
    [groups]
  );
  const filtered = q
    ? all.filter(t => t.name.toLowerCase().includes(q.toLowerCase()) || t.code.toLowerCase().includes(q.toLowerCase()))
    : all;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(14,11,9,0.6)", backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "12vh",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 580, maxWidth: "90vw",
          background: "var(--night-2)",
          border: "1px solid var(--night-line)",
          borderRadius: "var(--r-lg)",
          boxShadow: "0 32px 80px -16px rgba(0,0,0,0.7)",
          overflow: "hidden",
          animation: "fadeUp .15s ease",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: 14, borderBottom: "1px solid var(--night-line)",
        }}>
          <span style={{ color: "rgba(255,255,255,0.4)", display: "inline-flex" }}>
            <Icon name="search" size={18} />
          </span>
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Jump to a tool, project, or action…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "white", fontSize: 15, fontFamily: "inherit",
            }}
          />
          <kbd style={{
            fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)",
          }}>esc</kbd>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto", padding: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
              No matches.
            </div>
          ) : filtered.map(t => (
            <button
              key={t.code}
              onClick={() => onPick(t.path)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10, border: "none",
                display: "flex", alignItems: "center", gap: 12,
                color: "white", textAlign: "left", background: "transparent",
                cursor: "pointer", fontFamily: "inherit",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: t.color, display: "inline-flex", width: 24 }}>
                <Icon name={t.icon} size={18} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t.group}</div>
              </div>
              <span style={{
                fontSize: 10, fontFamily: "var(--font-mono)",
                color: "rgba(255,255,255,0.4)",
              }}>{t.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AvatarMenu({ user, onClose, onLogout }: {
  user: { name?: string; email?: string } | null | undefined;
  onClose: () => void;
  onLogout: () => void;
}) {
  useEffect(() => {
    const off = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-avatar-menu]")) onClose();
    };
    window.addEventListener("mousedown", off);
    return () => window.removeEventListener("mousedown", off);
  }, [onClose]);
  return (
    <div data-avatar-menu style={{
      position: "fixed", left: 70, bottom: 14,
      minWidth: 220, padding: 10,
      background: "var(--night-2)", color: "white",
      border: "1px solid var(--night-line)",
      borderRadius: "var(--r-lg)",
      boxShadow: "0 24px 60px -12px rgba(0,0,0,0.6)",
      zIndex: 60, animation: "fadeUp .14s ease",
    }}>
      <div style={{ padding: "6px 10px 10px", borderBottom: "1px solid var(--night-line)", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name ?? "Creator"}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
          {user?.email ?? ""}
        </div>
      </div>
      <button
        onClick={onLogout}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 10, border: "none",
          display: "flex", alignItems: "center", gap: 10,
          background: "transparent", color: "white", textAlign: "left",
          fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <Icon name="logout" size={16} /> Sign out
      </button>
    </div>
  );
}
