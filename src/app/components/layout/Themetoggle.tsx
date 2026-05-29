"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/Themecontext";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${className}`}
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-strong)",
        color: "var(--text-secondary)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--primary-light)";
        e.currentTarget.style.borderColor = "var(--primary-border)";
        e.currentTarget.style.color = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface-2)";
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}