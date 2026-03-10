"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const cached = window.localStorage.getItem("daily-cn-theme");
  if (cached === "dark" || cached === "light") {
    return cached;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const next = getInitialTheme();
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  const handleToggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("daily-cn-theme", next);
  };

  return (
    <button className="action-btn" onClick={handleToggle} type="button">
      {theme === "dark" ? "切换亮色" : "切换暗色"}
    </button>
  );
}
