"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  ["/roadmap", "Roadmap"],
  ["/guide/orientation", "Guide"],
  ["/colleges", "Colleges"],
  ["/resources", "Resources"],
  ["/blog", "Blog"],
  ["/about", "About"]
];

export function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#fbf8f1]/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
        <Link href="/" className="font-display text-2xl font-bold text-emerald-950">
          BD<span className="text-amber-700">2</span>US
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="text-sm font-bold text-slate-700 hover:text-emerald-900">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("bd2us:search"))}
            className="hidden min-h-10 rounded-full border border-emerald-950/15 bg-white/70 px-4 text-sm font-bold text-slate-700 hover:border-emerald-800 sm:block"
          >
            Search <span className="ml-2 text-xs text-slate-400">Ctrl K</span>
          </button>
          <Link
            href="/dashboard"
            className="hidden min-h-10 items-center rounded-full bg-emerald-900 px-4 text-sm font-bold text-white hover:bg-emerald-800 sm:inline-flex"
          >
            My plan
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-emerald-950/15 bg-white/70 text-lg font-bold text-emerald-950 lg:hidden"
          >
            {open ? "x" : "≡"}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-emerald-950/10 bg-[#fbf8f1] px-4 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-900/5 hover:text-emerald-900"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-900/5 hover:text-emerald-900"
            >
              Search
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-emerald-900 px-3 py-3 text-sm font-bold text-white"
            >
              Open my plan
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
