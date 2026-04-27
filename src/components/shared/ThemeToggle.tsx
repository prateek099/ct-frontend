import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTheme } from "../../context/ThemeContext";
import Icon from "./Icon";

const wrapperStyle: CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  zIndex: 9999,
};

const triggerStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "1px solid var(--line-strong)",
  background: "var(--bg-elev)",
  color: "var(--accent)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "var(--shadow-md)",
  transition: "transform 160ms ease, box-shadow 160ms ease, background 200ms ease",
  padding: 0,
};

const popoverStyle: CSSProperties = {
  position: "absolute",
  bottom: 56,
  right: 0,
  minWidth: 180,
  padding: 6,
  background: "var(--bg-elev)",
  color: "var(--ink)",
  border: "1px solid var(--line)",
  borderRadius: 14,
  boxShadow: "var(--shadow-lg)",
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const optionBaseStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "8px 10px",
  borderRadius: 10,
  border: "none",
  background: "transparent",
  color: "var(--ink-2)",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "inherit",
  textAlign: "left",
  cursor: "pointer",
};

export default function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const current = themes.find((t) => t.id === theme) ?? themes[0];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      {open && (
        <div role="menu" aria-label="Theme" style={popoverStyle}>
          {themes.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                style={{
                  ...optionBaseStyle,
                  background: active ? "var(--accent-soft)" : "transparent",
                  color: active ? "var(--accent-ink)" : "var(--ink-2)",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "var(--bg-soft)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon name={t.icon} size={16} />
                <span>{t.label}</span>
                {active && (
                  <span style={{ marginLeft: "auto", display: "flex" }}>
                    <Icon name="check" size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose theme"
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Theme: ${current.label}`}
        className="theme-toggle-btn"
        style={triggerStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <Icon name={current.icon} size={22} />
      </button>
    </div>
  );
}
