"use client";

import { useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "schemata_theme_preference";

export function useTheme(): {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (pref: ThemePreference) => void;
  cycleTheme: () => void;
} {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const [systemIsDark, setSystemIsDark] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      setThemePreferenceState(saved);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: ResolvedTheme =
    themePreference === "system" ? (systemIsDark ? "dark" : "light") : themePreference;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    localStorage.setItem(STORAGE_KEY, pref);
  };

  const cycleTheme = () => {
    const next: ThemePreference =
      themePreference === "system" ? "light" : themePreference === "light" ? "dark" : "system";
    setThemePreference(next);
  };

  return {
    themePreference,
    resolvedTheme,
    setThemePreference,
    cycleTheme,
  };
}
