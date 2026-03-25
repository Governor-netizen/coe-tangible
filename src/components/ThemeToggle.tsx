import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getCurrentTheme, toggleTheme, ThemeMode } from "../lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    setTheme(getCurrentTheme());
    const onThemeChange = () => setTheme(getCurrentTheme());
    window.addEventListener("themechange", onThemeChange);
    return () => window.removeEventListener("themechange", onThemeChange);
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(toggleTheme())}
      className={`inline-flex items-center justify-center rounded border border-outline-variant/40 bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors w-9 h-9 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
