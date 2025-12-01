import { useState, useEffect } from "react";
import { ThemeMode } from "@/types/theme-mode";

const THEME_KEY = "theme";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    return stored || "system";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      setThemeState(stored || "system");
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Also listen for theme changes from our own app
    const checkTheme = () => {
      const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      setThemeState(stored || "system");
    };

    const interval = setInterval(checkTheme, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return { theme };
}
