"use client";

import { Moon, Sun } from "lucide-react";
import { clsx } from "clsx";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        "flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 transition-colors hover:bg-white dark:border-border dark:bg-surface-muted dark:text-foreground dark:hover:bg-surface",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        showLabel && "px-3",
        className
      )}
      aria-label={
        mounted
          ? isDark
            ? "Activar modo claro"
            : "Activar modo oscuro"
          : "Cambiar tema"
      }
      title={mounted ? (isDark ? "Modo claro" : "Modo oscuro") : "Tema"}
    >
      {!mounted ? (
        <Sun className="h-5 w-5 opacity-50" aria-hidden />
      ) : isDark ? (
        <Sun className="h-5 w-5 text-amber-400" aria-hidden />
      ) : (
        <Moon className="h-5 w-5 text-primary" aria-hidden />
      )}
      {showLabel && mounted && (
        <span className="text-sm font-medium">
          {isDark ? "Claro" : "Oscuro"}
        </span>
      )}
    </button>
  );
}
