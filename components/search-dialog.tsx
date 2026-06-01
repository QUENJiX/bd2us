"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { localSearch } from "@/lib/search";
import type { SearchResult } from "@/lib/types";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function openSearch() {
      setOpen(true);
      window.setTimeout(() => input.current?.focus(), 30);
    }
    function keyboard(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("bd2us:search", openSearch);
    window.addEventListener("keydown", keyboard);
    return () => {
      window.removeEventListener("bd2us:search", openSearch);
      window.removeEventListener("keydown", keyboard);
    };
  }, []);

  const fallback = useMemo(() => localSearch(query), [query]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
        if (!response.ok) throw new Error("Search unavailable");
        const payload = (await response.json()) as { results: SearchResult[] };
        setResults(payload.results);
      } catch {
        setResults(fallback);
      }
    }, 140);
    return () => window.clearTimeout(timer);
  }, [fallback, query]);

  if (!open) return null;
  const visibleResults = results.length ? results : fallback;

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
      className="fixed inset-0 z-[90] bg-emerald-950/35 px-4 pt-[12vh] backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Search BD2US"
        className="mx-auto max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/60 bg-[#fffdf8] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-emerald-950/10 px-4">
          <span aria-hidden="true" className="text-xl text-emerald-800">
            ⌕
          </span>
          <input
            ref={input}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") setActive((value) => Math.min(value + 1, visibleResults.length - 1));
              if (event.key === "ArrowUp") setActive((value) => Math.max(value - 1, 0));
            }}
            placeholder="Search guides, tasks, and colleges..."
            className="min-h-16 flex-1 bg-transparent text-base outline-none"
          />
          <button type="button" onClick={() => setOpen(false)} className="rounded-full px-2 py-1 text-sm font-bold text-slate-500">
            ESC
          </button>
        </div>
        <div className="max-h-[58vh] overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <p className="p-5 text-sm text-slate-500">Try “CSS Profile”, “visa”, or “need-blind”.</p>
          ) : visibleResults.length ? (
            visibleResults.map((result, index) => (
              <Link
                key={`${result.type}-${result.href}-${result.title}`}
                href={result.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-3 ${index === active ? "bg-emerald-50" : "hover:bg-emerald-50/70"}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">{result.type}</span>
                <p className="mt-1 font-bold text-emerald-950">{result.title}</p>
                <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
              </Link>
            ))
          ) : (
            <p className="p-5 text-sm text-slate-500">No results yet. We log anonymous misses so the guide can improve.</p>
          )}
        </div>
      </section>
    </div>
  );
}
