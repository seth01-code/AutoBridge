"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  /*
    Default to "light" for SSR. The inline <script> in layout.tsx already
    sets data-theme on <html> before paint, so there is no visual flash.
    This useState just keeps React's mental model in sync after hydration.
  */
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    /*
      On mount, read the value that was already applied by the theme-init
      script. This keeps React state in sync without a second setAttribute.
    */
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (current === "dark" || current === "light") {
      setTheme(current);
    } else {
      // Fallback: derive from localStorage or OS preference
      try {
        const stored = localStorage.getItem("ab-theme") as Theme | null;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const resolved: Theme = stored ?? (prefersDark ? "dark" : "light");
        setTheme(resolved);
        document.documentElement.setAttribute("data-theme", resolved);
      } catch {
        setTheme("light");
        document.documentElement.setAttribute("data-theme", "light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem("ab-theme", next);
    } catch {
      // localStorage blocked (private mode, etc.) — still apply visually
    }
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);