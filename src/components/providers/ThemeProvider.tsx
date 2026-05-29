"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "jayfield-theme";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Read the resolved theme from a `Theme` setting, taking system preference
 * into account when the value is "system". Safe to call during SSR — falls
 * back to "light" when there is no `window`.
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

/**
 * Apply the resolved theme to the document root. The inline FOUC-prevention
 * script in <head> already handles the very first paint — this keeps the
 * class in sync afterward as the user toggles or system changes.
 */
function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * Vanilla theme provider. Three states (light/dark/system) persisted in
 * localStorage under `jayfield-theme`. We deliberately avoid pulling in
 * next-themes since the FOUC-prevention script + this provider cover what
 * we need with no added dependency.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to "system" — gets overwritten on mount by whatever is in
  // localStorage. Initial paint is governed by the inline script in <head>,
  // so this default doesn't cause a flash.
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      const next: Theme =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "system";
      setThemeState(next);
      const resolved = resolveTheme(next);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } catch {
      // localStorage may be blocked (private mode, sandbox) — silently use
      // the in-memory default.
    }
  }, []);

  // Re-resolve when the OS preference flips — only relevant in "system" mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next: ResolvedTheme = mq.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook for reading and updating the current theme. Components rendered
 * outside `<ThemeProvider>` will get a sensible no-op default (light, system).
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Graceful fallback — theme reads still work even before the provider
    // mounts (e.g. in stories or isolated tests).
    return {
      theme: "system",
      resolvedTheme: "light",
      setTheme: () => {},
    };
  }
  return ctx;
}
