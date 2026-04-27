import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "default" | "girly" | "dark";

export interface ThemeMeta {
  id: Theme;
  label: string;
  icon: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "default", label: "Default", icon: "sparkle" },
  { id: "girly", label: "Girly", icon: "heart" },
  { id: "dark", label: "Dark", icon: "moon" },
];

const THEME_IDS = THEMES.map((t) => t.id);

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme) => void;
  cycleTheme: () => void;
  themes: ThemeMeta[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";

function isTheme(value: string | null): value is Theme {
  return value !== null && (THEME_IDS as string[]).includes(value);
}

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "default";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : "default";
  } catch {
    return "default";
  }
}

function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage may be blocked (private mode) — theme still applies in memory.
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEME_IDS.indexOf(prev);
      return THEME_IDS[(idx + 1) % THEME_IDS.length] ?? "default";
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
