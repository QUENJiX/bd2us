"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDark(document.documentElement.classList.contains("dark")), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("bd2us-theme", next ? "dark" : "light");
    setDark(next);
  }

  return <button aria-label={`Switch to ${dark ? "light" : "dark"} mode`} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-emerald-950/15 bg-white/70 text-sm font-bold text-emerald-950" onClick={toggle} type="button">{dark ? "☀" : "◐"}</button>;
}
