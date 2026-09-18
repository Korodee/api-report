import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "api-report-theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("theme");
    const initial =
      fromQuery === "light" || fromQuery === "dark"
        ? fromQuery
        : (readStoredTheme() ?? systemTheme());
    if (fromQuery === "light" || fromQuery === "dark") {
      localStorage.setItem(STORAGE_KEY, fromQuery);
    }
    setTheme(initial);
    applyTheme(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStoredTheme()) return;
      const next = systemTheme();
      setTheme(next);
      applyTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
    applyTheme(next);
  }

  return { theme, toggleTheme };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export type ChartColors = {
  text: string;
  muted: string;
  line: string;
  accent: string;
  accentMuted: string;
  tooltipBg: string;
  tooltipBorder: string;
};

const FALLBACK: ChartColors = {
  text: "#141414",
  muted: "#6b6b6b",
  line: "#e8e8e8",
  accent: "#215db0",
  accentMuted: "#b7c0cc",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e8e8e8",
};

function readChartColors(): ChartColors {
  const styles = getComputedStyle(document.documentElement);
  const value = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    text: value("--text", FALLBACK.text),
    muted: value("--muted", FALLBACK.muted),
    line: value("--line", FALLBACK.line),
    accent: value("--accent", FALLBACK.accent),
    accentMuted: value("--accent-muted", FALLBACK.accentMuted),
    tooltipBg: value("--tooltip-bg", FALLBACK.tooltipBg),
    tooltipBorder: value("--tooltip-border", FALLBACK.tooltipBorder),
  };
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(FALLBACK);

  useEffect(() => {
    const sync = () => setColors(readChartColors());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
