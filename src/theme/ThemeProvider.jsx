import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

const STORAGE_KEY = "water-measuring:theme";

function readInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return "dark";
    if (stored === "light") return "light";
  } catch {
    // ignore
  }

  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeProvider({ children }) {
  const location = useLocation();
  const [mode, setMode] = useState(readInitialTheme);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const effectiveMode = isAdminRoute ? "light" : mode;
  const isDark = effectiveMode === "dark";

  const setTheme = useCallback((next) => {
    setMode(next === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }

    document.documentElement.setAttribute("data-theme", effectiveMode);
    // keep compatibility with existing CSS using body.dark
    document.body.classList.toggle("dark", effectiveMode === "dark");
  }, [mode, effectiveMode]);

  const antdConfig = useMemo(() => {
    return {
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    };
  }, [isDark]);

  const value = useMemo(
    () => ({ isDark, toggleTheme, setTheme }),
    [isDark, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}

