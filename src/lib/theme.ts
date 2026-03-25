export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "tangible-theme";

export const getCurrentTheme = (): ThemeMode => {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

export const applyTheme = (theme: ThemeMode) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.setAttribute("data-theme", theme);
};

export const initializeTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme: ThemeMode = stored ?? (systemPrefersDark ? "dark" : "light");

  applyTheme(theme);
  return theme;
};

export const toggleTheme = (): ThemeMode => {
  const nextTheme: ThemeMode = getCurrentTheme() === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  window.localStorage.setItem(STORAGE_KEY, nextTheme);
  window.dispatchEvent(new CustomEvent("themechange", { detail: nextTheme }));
  return nextTheme;
};
