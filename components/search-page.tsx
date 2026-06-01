"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { localSearch } from "@/lib/search";
import type { SearchResult } from "@/lib/types";
import { Tag } from "@/components/ui";

const resultTypes = ["All", "Guide", "Blog", "Task", "College", "FAQ", "Resource"] as const;

export function SearchPage() {
  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [type, setType] = useState<(typeof resultTypes)[number]>("All");
  const [results, setResults] = useState<SearchResult[]>(() => localSearch(params.get("q") ?? ""));
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setRecent(JSON.parse(window.localStorage.getItem("bd2us:recent-searches") ?? "[]"));
      } catch {
        setRecent([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length < 2) return setResults([]);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=30`);
        if (!response.ok) throw new Error("Search unavailable");
        const payload = (await response.json()) as { results: SearchResult[] };
        setResults(payload.results);
      } catch {
        setResults(localSearch(trimmed));
      }
      setRecent((current) => {
        const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 5);
        window.localStorage.setItem("bd2us:recent-searches", JSON.stringify(next));
        return next;
      });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const visible = useMemo(() => results.filter((result) => type === "All" || result.type === type), [results, type]);

  return (
    <div>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Search the public guide</span>
        <input
          autoFocus
          className="mt-3 min-h-16 w-full rounded-2xl border border-emerald-900/15 bg-white px-5 text-lg outline-none shadow-sm focus:border-emerald-700"
          placeholder="Try CSS Profile, visa, need-blind, HSC..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        {resultTypes.map((item) => (
          <button className={`rounded-full px-3 py-2 text-xs font-bold ${type === item ? "bg-emerald-900 text-white" : "border border-emerald-900/10 bg-white text-slate-600"}`} key={item} onClick={() => setType(item)}>{item}</button>
        ))}
      </div>
      {query.length < 2 && recent.length ? (
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Recent searches</p>
          <div className="mt-3 flex flex-wrap gap-2">{recent.map((item) => <button className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
        </div>
      ) : null}
      <div className="mt-8 grid gap-3">
        {visible.map((result) => (
          <Link className="card block p-5 hover:border-emerald-700/30 hover:bg-white" href={result.href} key={`${result.type}-${result.href}-${result.title}`}>
            <Tag tone={result.type === "College" ? "amber" : "green"}>{result.type}</Tag>
            <h2 className="font-display mt-3 text-2xl text-emerald-950">{result.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{result.summary}</p>
          </Link>
        ))}
        {query.trim().length >= 2 && !visible.length ? (
          <div className="card p-7">
            <h2 className="font-display text-3xl text-emerald-950">No public result yet.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">The miss is recorded anonymously when Supabase is configured, helping editors spot gaps in the guide.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
