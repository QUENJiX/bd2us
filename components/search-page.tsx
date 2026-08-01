"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { localSearch } from "@/lib/search";
import type { SearchResult } from "@/lib/types";
import { Tag } from "@/components/ui";

const resultTypes = ["All", "Guide", "Blog", "Task", "College", "Glossary", "FAQ", "Resource"] as const;

export function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [type, setType] = useState<(typeof resultTypes)[number]>("All");
  const [results, setResults] = useState<SearchResult[]>(() => localSearch(params.get("q") ?? ""));

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const trimmed = query.trim();
      router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search", { scroll: false });
      if (trimmed.length < 2) return setResults([]);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=30`);
        if (!response.ok) throw new Error("Search unavailable");
        const payload = (await response.json()) as { results: SearchResult[] };
        setResults(payload.results);
      } catch {
        setResults(localSearch(trimmed));
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query, router]);

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
      <div className="mt-8 grid gap-3">
        {visible.map((result) => (
          <Link className="card block p-5 hover:border-emerald-700/30 hover:bg-white" href={result.href} key={`${result.type}-${result.href}-${result.title}`}>
            <Tag tone={result.type === "College" ? "amber" : "green"}>{result.type}</Tag>
            <h2 className="font-display mt-3 text-2xl text-emerald-950">{result.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{result.summary}</p>
            {result.matchedContext && result.matchedContext !== result.summary && result.matchedContext !== result.title ? <p className="mt-3 text-xs font-bold text-amber-800">Matched in {result.matchedField}: {result.matchedContext}</p> : null}
          </Link>
        ))}
        {query.trim().length >= 2 && !visible.length ? (
          <div className="card p-7">
            <h2 className="font-display text-3xl text-emerald-950">No public result yet.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Try a broader phrase, a college name, or a related term such as financial aid, essays, or visa.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
