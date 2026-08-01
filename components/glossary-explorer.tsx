"use client";

import { useMemo, useState } from "react";
import type { GlossaryTerm } from "@/lib/types";

const categories = ["All", "Planning & research", "Applications", "Testing", "Money", "Decisions", "Visa & arrival"] as const;
type Category = (typeof categories)[number];

export function GlossaryExplorer({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return terms.filter((item) => {
      const matchesText = !needle || `${item.term} ${item.definition} ${item.bangla}`.toLocaleLowerCase().includes(needle);
      return matchesText && (category === "All" || termCategory(item) === category);
    });
  }, [category, query, terms]);

  return (
    <div>
      <section className="glossary-tools" aria-label="Search and filter glossary">
        <label htmlFor="glossary-search"><span>Find a term in English or বাংলা</span><input id="glossary-search" type="search" placeholder="Try: early decision, I-20, স্কলারশিপ…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div role="group" aria-label="Glossary category">{categories.map((item) => <button aria-pressed={category === item} className={category === item ? "is-active" : ""} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div>
        <p aria-live="polite"><strong>{filtered.length}</strong> of {terms.length} terms</p>
      </section>

      {filtered.length ? <div className="glossary-index">{filtered.map((item) => <article id={slug(item.term)} key={item.term}><p className="eyebrow">{termCategory(item)} · {item.relatedGuideSlug?.replaceAll("-", " ") ?? "Admissions term"}</p><h2>{item.term}</h2><p>{item.definition}</p><p lang="bn">{item.bangla}</p>{item.relatedGuideSlug ? <a href={`/guide/${item.relatedGuideSlug}`}>Read the related chapter →</a> : null}</article>)}</div> : <div className="empty-state"><p className="eyebrow">No matching term</p><h2>Try a shorter word or another category.</h2><button onClick={() => { setQuery(""); setCategory("All"); }} type="button">Reset glossary</button></div>}
    </div>
  );
}

function termCategory(item: GlossaryTerm): Exclude<Category, "All"> {
  const slugValue = item.relatedGuideSlug ?? "";
  if (slugValue === "financial-aid") return "Money";
  if (slugValue === "standardized-testing") return "Testing";
  if (slugValue === "decisions") return "Decisions";
  if (slugValue === "visa" || slugValue === "arrival") return "Visa & arrival";
  if (["academics", "activities", "essays", "recommendations", "application-platforms"].includes(slugValue)) return "Applications";
  return "Planning & research";
}

function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
