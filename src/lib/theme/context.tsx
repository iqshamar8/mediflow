"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mediflow_theme") as Theme;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (saved === "dark" || (!saved && prefersDark)) {
      setThemeState("dark");
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setThemeState("light");
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    let effectiveDark = false;
    if (newTheme === "dark") {
      effectiveDark = true;
    } else if (newTheme === "system") {
      effectiveDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      effectiveDark = false;
    }

    if (effectiveDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setIsDark(effectiveDark);
    setThemeState(newTheme);
    localStorage.setItem("mediflow_theme", newTheme);
  };

  const toggleTheme = () => {
    applyTheme(isDark ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme: applyTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
