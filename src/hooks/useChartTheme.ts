"use client";

import { useEffect, useState } from "react";

export interface ChartTheme {
  tick: string;
  label: string;
  grid: string;
  cursor: string;
  bar: string;
  tooltip: {
    background: string;
    border: string;
    title: string;
    body: string;
  };
}

const LIGHT: ChartTheme = {
  tick: "#6b7280",
  label: "#374151",
  grid: "#e5e7eb",
  cursor: "rgba(31, 78, 120, 0.08)",
  bar: "#1F4E78",
  tooltip: {
    background: "#ffffff",
    border: "#e5e7eb",
    title: "#111827",
    body: "#4b5563",
  },
};

function readChartTheme(): ChartTheme {
  if (typeof document === "undefined") return LIGHT;

  const isDark = document.documentElement.classList.contains("dark");
  if (!isDark) return LIGHT;

  return {
    tick: "#94a3b8",
    label: "#cbd5e1",
    grid: "#2d3a4d",
    cursor: "rgba(107, 163, 214, 0.12)",
    bar: "#6ba3d6",
    tooltip: {
      background: "#151b23",
      border: "#2d3a4d",
      title: "#f1f5f9",
      body: "#94a3b8",
    },
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(LIGHT);

  useEffect(() => {
    setTheme(readChartTheme());

    const observer = new MutationObserver(() => {
      setTheme(readChartTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
