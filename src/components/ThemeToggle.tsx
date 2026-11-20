"use client";

import { useTheme } from "@/lib/UseTheme";

export function ThemeToggle() {
  const { themePreference, cycleTheme } = useTheme();

  const themeLabel =
    themePreference === "system" ? "🖥️ System" : themePreference === "dark" ? "🌙 Dark" : "☀️ Light";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Current theme: ${themeLabel} (click to cycle)`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm transition"
    >
      {themeLabel}
    </button>
  );
}
