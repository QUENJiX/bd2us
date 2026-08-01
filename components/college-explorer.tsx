"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { collegeFitReasons } from "@/lib/domain.mjs";
import { searchColleges } from "@/lib/college-search.mjs";
import { defaultProfile } from "@/lib/content";
import { compareByRanking, getCollegeRanking, getRankingGroup, rankingLabel, type RankingGroup } from "@/lib/college-rankings";
import type { College, StudentProfile } from "@/lib/types";

const savedKey = "bd2us:saved-colleges";
const profileKey = "bd2us-profile";
const pageSize = 36;

type ViewMode = "grid" | "table";
type Filters = {
  aid: string;
  control: string;
  region: string;
  cost: string;
  acceptance: string;
  internationalAid: string;
  testing: string;
  satData: string;
  englishTest: string;
  scholarship: string;
  savedOnly: boolean;
};

const initialFilters: Filters = {
  aid: "All",
  control: "All",
  region: "All",
  cost: "All",
  acceptance: "All",
  internationalAid: "All",
  testing: "All",
  satData: "All",
  englishTest: "All",
  scholarship: "All",
  savedOnly: false
};

export function CollegeExplorer({ colleges }: { colleges: College[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [filters, setFilters] = useState<Filters>(() => ({
    aid: params.get("aid") ?? "All",
    control: params.get("control") ?? "All",
    region: params.get("region") ?? "All",
    cost: params.get("cost") ?? "All",
    acceptance: params.get("acceptance") ?? "All",
    internationalAid: params.get("internationalAid") ?? "All",
    testing: params.get("testing") ?? "All",
    satData: params.get("satData") ?? "All",
    englishTest: params.get("englishTest") ?? "All",
    scholarship: params.get("scholarship") ?? "All",
    savedOnly: params.get("saved") === "1"
  }));
  const [view, setView] = useState<ViewMode>("grid");
  const [group, setGroup] = useState<RankingGroup>(() => validGroup(params.get("list")));
  const [saved, setSaved] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSaved(readList(savedKey));
      const stored = window.localStorage.getItem(profileKey);
      if (stored) setProfile({ ...defaultProfile, ...JSON.parse(stored) });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (group !== "universities") next.set("list", group);
    for (const [key, value] of Object.entries(filters)) {
      if (key === "savedOnly") {
        if (value) next.set("saved", "1");
      } else if (value !== "All") next.set(key, String(value));
    }
    router.replace(next.size ? `/colleges?${next.toString()}` : "/colleges", { scroll: false });
  }, [filters, group, query, router]);

  const filtered = useMemo(() => {
    const needle = query.trim();
    return searchColleges(colleges, needle, compareByRanking).filter((college: College) => {
      return (
        (needle || group === "all" || getRankingGroup(college) === group) &&
        (filters.aid === "All" || college.aidPolicy === filters.aid || (filters.aid === "International aid reported" && college.internationalAidPercent != null)) &&
        (filters.control === "All" || college.control === filters.control) &&
        (filters.region === "All" || college.region === filters.region) &&
        costMatches(college.costOfAttendance, filters.cost) &&
        acceptanceMatches(college.acceptanceRate, filters.acceptance) &&
        aidPercentMatches(college.internationalAidPercent, filters.internationalAid) &&
        (filters.testing === "All" || (filters.testing === "Not listed" ? college.testing?.policy.value == null : college.testing?.policy.value === filters.testing)) &&
        (filters.satData === "All" || (filters.satData === "Available" ? hasSatData(college) : !hasSatData(college))) &&
        (filters.englishTest === "All" || college.englishProficiency?.some((requirement) => requirement.test === filters.englishTest)) &&
        (filters.scholarship === "All" || (filters.scholarship === "Named scholarship" ? hasNamedScholarship(college) : !hasNamedScholarship(college))) &&
        (!filters.savedOnly || saved.includes(college.slug))
      );
    });
  }, [colleges, filters, group, query, saved]);

  const groupCounts = useMemo(() => ({
    universities: colleges.filter((college) => getRankingGroup(college) === "universities").length,
    "liberal-arts": colleges.filter((college) => getRankingGroup(college) === "liberal-arts").length,
    other: colleges.filter((college) => getRankingGroup(college) === "other").length,
    all: colleges.length
  }), [colleges]);

  const visible = filtered.slice(0, visibleCount);
  const comparison = compare.map((slug) => colleges.find((college) => college.slug === slug)).filter(Boolean) as College[];
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key === "savedOnly" ? value : value !== "All").length;

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setVisibleCount(pageSize);
  }

  function toggleSaved(slug: string) {
    const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
    setSaved(next);
    window.localStorage.setItem(savedKey, JSON.stringify(next));
  }

  function toggleCompare(slug: string) {
    if (compare.includes(slug)) return setCompare(compare.filter((item) => item !== slug));
    if (compare.length < 4) setCompare([...compare, slug]);
  }

  function clearFilters() {
    setVisibleCount(pageSize);
    setQuery("");
    setFilters(initialFilters);
  }

  return (
    <div>
      <section className="ranking-ledger" aria-labelledby="ranking-ledger-title">
        <div className="ranking-ledger-heading">
          <div><p className="eyebrow">Choose an institution list</p><h3 id="ranking-ledger-title">Universities and liberal-arts colleges use different rankings.</h3></div>
          <p>Rank is only one research signal. Funding, program fit, and current international policy still require separate verification.</p>
        </div>
        <div className="ranking-tabs" role="group" aria-label="Institution list">
          <RankingTab active={group === "universities"} count={groupCounts.universities} label="Universities · QS 2027" onClick={() => changeGroup("universities")} />
          <RankingTab active={group === "liberal-arts"} count={groupCounts["liberal-arts"]} label="Liberal arts · U.S. News 2026" onClick={() => changeGroup("liberal-arts")} />
          <RankingTab active={group === "other"} count={groupCounts.other} label="Other colleges" onClick={() => changeGroup("other")} />
          <RankingTab active={group === "all"} count={groupCounts.all} label="All institutions" onClick={() => changeGroup("all")} />
        </div>
        <p className="ranking-source-note">Ranked universities use the <a href="https://www.topuniversities.com/qs-top-uni-wur" target="_blank" rel="noreferrer">QS World University Rankings 2027 ↗</a>. Ranked liberal-arts colleges use the <a href="https://www.usnews.com/best-colleges/rankings/national-liberal-arts-colleges" target="_blank" rel="noreferrer">U.S. News 2026 list ↗</a>. Unlisted institutions remain alphabetical after ranked entries.</p>
      </section>

      <section className="filter-desk" aria-label="Filter colleges">
        <div className="filter-search">
          <label htmlFor="college-search">Search across all 678 institutions</label>
          <input id="college-search" placeholder="College, city, state, setting, or scholarship" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(pageSize); }} />
        </div>
        <div className="filter-grid">
          <Filter label="Aid signal" value={filters.aid} onChange={(value) => updateFilter("aid", value)} values={["All", "International aid reported", "Need-blind", "Need-aware", "Merit-focused"]} />
          <Filter label="Control" value={filters.control} onChange={(value) => updateFilter("control", value)} values={["All", "Private", "Public"]} />
          <Filter label="Region" value={filters.region} onChange={(value) => updateFilter("region", value)} values={["All", "Northeast", "Midwest", "South", "West", "Other"]} />
          <Filter label="Annual cost" value={filters.cost} onChange={(value) => updateFilter("cost", value)} values={["All", "Under $40k", "$40k–$60k", "$60k–$80k", "$80k+"]} />
          <Filter label="Overall acceptance" value={filters.acceptance} onChange={(value) => updateFilter("acceptance", value)} values={["All", "Under 15%", "15%–35%", "35%–65%", "65%+"]} />
          <Filter label="International aid share" value={filters.internationalAid} onChange={(value) => updateFilter("internationalAid", value)} values={["All", "Reported", "50%+", "80%+"]} />
          <Filter label="Testing policy" value={filters.testing} onChange={(value) => updateFilter("testing", value)} values={["All", "Test required", "Test optional", "Test blind", "Test flexible", "Not listed"]} />
          <Filter label="SAT data" value={filters.satData} onChange={(value) => updateFilter("satData", value)} values={["All", "Available", "Not listed"]} />
          <Filter label="English test" value={filters.englishTest} onChange={(value) => updateFilter("englishTest", value)} values={["All", "TOEFL", "IELTS", "Duolingo", "PTE", "Cambridge"]} />
          <Filter label="Scholarship" value={filters.scholarship} onChange={(value) => updateFilter("scholarship", value)} values={["All", "Named scholarship", "Not listed"]} />
        </div>
        <div className="filter-meta">
          <div>
            <strong>{filtered.length.toLocaleString()}</strong> results {query ? "across the full catalog" : `in ${groupLabel(group)}`}
            {activeFilterCount ? <button type="button" onClick={clearFilters}>Clear {activeFilterCount} filters</button> : null}
          </div>
          <div className="view-controls" aria-label="Explorer display">
            <button className={filters.savedOnly ? "is-active" : ""} onClick={() => updateFilter("savedOnly", !filters.savedOnly)} type="button">Saved {saved.length ? `(${saved.length})` : ""}</button>
            <button className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} type="button">Cards</button>
            <button className={view === "table" ? "is-active" : ""} onClick={() => setView("table")} type="button">Table</button>
          </div>
        </div>
      </section>

      <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--passport-soft)] px-4 py-3 text-sm leading-6 text-[var(--passport)]">
        Acceptance rates describe an institution&apos;s overall pool, not your personal probability. Build a balanced list around affordability, academic fit, and verified policies.
      </div>

      {view === "grid" ? (
        <div className="college-ledger mt-6">
          {visible.map((college, index) => (
            <CollegeCard
              college={college}
              compared={compare.includes(college.slug)}
              compareFull={compare.length >= 4}
              fitReasons={collegeFitReasons(college, profile)}
              index={index + 1}
              ranking={rankingLabel(college)}
              saved={saved.includes(college.slug)}
              toggleCompare={toggleCompare}
              toggleSaved={toggleSaved}
              key={college.slug}
            />
          ))}
        </div>
      ) : <CollegeTable colleges={visible} saved={saved} toggleSaved={toggleSaved} />}

      {!filtered.length ? (
        <div className="empty-state mt-6">
          <p className="eyebrow">No exact match</p>
          <h2>Widen one part of the list.</h2>
          <p>Clear a cost, region, or aid filter. A useful application list usually combines several funding routes and selectivity levels.</p>
          <button type="button" onClick={clearFilters}>Reset the explorer</button>
        </div>
      ) : null}

      {visibleCount < filtered.length ? (
        <div className="mt-8 text-center">
          <button className="button-secondary" type="button" onClick={() => setVisibleCount((count) => count + pageSize)}>
            Show {Math.min(pageSize, filtered.length - visibleCount)} more colleges
          </button>
        </div>
      ) : null}

      {comparison.length ? <Comparison colleges={comparison} clear={() => setCompare([])} /> : null}
    </div>
  );

  function changeGroup(next: RankingGroup) {
    setGroup(next);
    setVisibleCount(pageSize);
  }
}

function RankingTab({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) {
  return <button className={active ? "is-active" : ""} aria-pressed={active} onClick={onClick} type="button"><span>{label}</span><strong>{count}</strong></button>;
}

function Filter({ label, value, onChange, values }: { label: string; value: string; onChange: (value: string) => void; values: string[] }) {
  return (
    <label className="filter-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}

function CollegeCard({ college, compared, compareFull, fitReasons, index, ranking, saved, toggleCompare, toggleSaved }: { college: College; compared: boolean; compareFull: boolean; fitReasons: string[]; index: number; ranking: string; saved: boolean; toggleCompare: (slug: string) => void; toggleSaved: (slug: string) => void }) {
  return (
    <article className="college-entry">
      <div className="college-entry-index" aria-hidden="true">{String(index).padStart(2, "0")}</div>
      <div className="college-entry-main">
        <div className="college-entry-heading">
          <div>
            <p className="eyebrow">{college.location}</p>
            <h2><Link href={`/colleges/${college.slug}`}>{college.name}</Link></h2>
            <p className="college-kind">{[college.control, college.type, college.setting].filter(Boolean).join(" · ")}</p>
            <p className={getCollegeRanking(college) ? "college-ranking is-ranked" : "college-ranking"}>{ranking}</p>
          </div>
          <button aria-label={`${saved ? "Remove" : "Save"} ${college.name}`} className={saved ? "save-control is-saved" : "save-control"} onClick={() => toggleSaved(college.slug)} type="button">
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        <div className="college-fact-strip">
          <FactCompact label="Annual cost" value={formatUsd(college.costOfAttendance)} />
          <FactCompact label="Intl. aid" value={college.internationalAidPercent == null ? "Not listed" : `${college.internationalAidPercent}% receive aid`} />
          <FactCompact label="Average award" value={formatUsd(college.averageInternationalAid)} />
          <FactCompact label="Overall admit rate" value={college.acceptanceRate == null ? "Not listed" : `${college.acceptanceRate}%`} />
        </div>
        {college.specialNote ? <p className="college-note"><strong>Funding note:</strong> {college.specialNote}</p> : null}
        <div className="college-entry-footer">
          <p><strong>Why research it:</strong> {fitReasons.map(trimPeriod).join("; ")}.</p>
          <div>
            <Link href={`/colleges/${college.slug}`}>Open research profile →</Link>
            <button disabled={!compared && compareFull} onClick={() => toggleCompare(college.slug)} type="button">{compared ? "Remove" : compareFull ? "Comparison full" : "Compare"}</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function FactCompact({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function CollegeTable({ colleges, saved, toggleSaved }: { colleges: College[]; saved: string[]; toggleSaved: (slug: string) => void }) {
  return (
    <div className="data-table-wrap mt-6">
      <table>
        <caption className="sr-only">Filtered college catalog</caption>
        <thead><tr><th>College</th><th>Ranking context</th><th>Cost</th><th>International aid</th><th>Average award</th><th>Admit rate</th><th>Save</th></tr></thead>
        <tbody>{colleges.map((college) => (
          <tr key={college.slug}>
            <td><Link href={`/colleges/${college.slug}`}>{college.name}</Link><span>{college.location}</span></td>
            <td>{rankingLabel(college)}</td>
            <td>{formatUsd(college.costOfAttendance)}</td>
            <td>{college.internationalAidPercent == null ? "Not listed" : `${college.internationalAidPercent}%`}</td>
            <td>{formatUsd(college.averageInternationalAid)}</td>
            <td>{college.acceptanceRate == null ? "Not listed" : `${college.acceptanceRate}%`}</td>
            <td><button onClick={() => toggleSaved(college.slug)} type="button">{saved.includes(college.slug) ? "Saved" : "Save"}</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Comparison({ colleges, clear }: { colleges: College[]; clear: () => void }) {
  return (
    <section className="comparison-sheet" aria-labelledby="comparison-title">
      <div className="comparison-heading"><div><p className="eyebrow">Research comparison · {colleges.length}/4</p><h2 id="comparison-title">Read across, then verify.</h2></div><button onClick={clear} type="button">Clear comparison</button></div>
      <div className="data-table-wrap">
        <table>
          <thead><tr><th>Factor</th>{colleges.map((college) => <th key={college.slug}><Link href={`/colleges/${college.slug}`}>{college.shortName}</Link></th>)}</tr></thead>
          <tbody>
            <CompareRow label="Annual cost" colleges={colleges} value={(college) => formatUsd(college.costOfAttendance)} />
            <CompareRow label="International aid" colleges={colleges} value={(college) => college.internationalAidPercent == null ? "Not listed" : `${college.internationalAidPercent}% receive aid`} />
            <CompareRow label="Average award" colleges={colleges} value={(college) => formatUsd(college.averageInternationalAid)} />
            <CompareRow label="Overall admit rate" colleges={colleges} value={(college) => college.acceptanceRate == null ? "Not listed" : `${college.acceptanceRate}%`} />
            <CompareRow label="International admit rate" colleges={colleges} value={(college) => formatPercent(college.admissions?.internationalAcceptanceRate.value)} />
            <CompareRow label="Testing policy" colleges={colleges} value={(college) => college.testing?.policy.value ?? "Not listed"} />
            <CompareRow label="SAT Math middle 50%" colleges={colleges} value={(college) => formatRange(college.testing?.satMathRange?.value)} />
            <CompareRow label="SAT EBRW middle 50%" colleges={colleges} value={(college) => formatRange(college.testing?.satEbrwRange?.value)} />
            <CompareRow label="Named scholarships" colleges={colleges} value={(college) => college.scholarships?.slice(0, 2).map((item) => item.name).join(", ") || "Not listed"} />
            <CompareRow label="Setting" colleges={colleges} value={(college) => college.setting ?? "Not listed"} />
            <CompareRow label="Enrollment" colleges={colleges} value={(college) => college.enrollmentBand ?? "Not listed"} />
            <CompareRow label="Aid policy" colleges={colleges} value={(college) => college.aidPolicy} />
            <CompareRow label="Ranking context" colleges={colleges} value={rankingLabel} />
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CompareRow({ label, colleges, value }: { label: string; colleges: College[]; value: (college: College) => string }) {
  return <tr><th>{label}</th>{colleges.map((college) => <td key={college.slug}>{value(college)}</td>)}</tr>;
}

function costMatches(value: number | null | undefined, filter: string) {
  if (filter === "All") return true;
  if (value == null) return false;
  if (filter === "Under $40k") return value < 40000;
  if (filter === "$40k–$60k") return value >= 40000 && value < 60000;
  if (filter === "$60k–$80k") return value >= 60000 && value < 80000;
  return value >= 80000;
}

function acceptanceMatches(value: number | null | undefined, filter: string) {
  if (filter === "All") return true;
  if (value == null) return false;
  if (filter === "Under 15%") return value < 15;
  if (filter === "15%–35%") return value >= 15 && value < 35;
  if (filter === "35%–65%") return value >= 35 && value < 65;
  return value >= 65;
}

function aidPercentMatches(value: number | null | undefined, filter: string) {
  if (filter === "All") return true;
  if (filter === "Reported") return value != null;
  if (value == null) return false;
  if (filter === "50%+") return value >= 50;
  return value >= 80;
}

function formatUsd(value: number | null | undefined) {
  return value == null ? "Not listed" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number | null | undefined) {
  return value == null ? "Not published" : `${value}%`;
}

function formatRange(value: { low: number | null; high: number | null } | null | undefined) {
  if (!value || (value.low == null && value.high == null)) return "Not listed";
  return value.low != null && value.high != null ? `${value.low}–${value.high}` : String(value.low ?? value.high);
}

function hasSatData(college: College) {
  return college.testing?.satComposite?.value != null || college.testing?.satMathRange?.value != null || college.testing?.satEbrwRange?.value != null;
}

function hasNamedScholarship(college: College) {
  return Boolean(college.scholarships?.some((item) => item.name && item.name !== "Largest listed merit scholarship"));
}

function trimPeriod(value: string) { return value.replace(/[.!?]+$/, ""); }

function validGroup(value: string | null): RankingGroup {
  return value === "liberal-arts" || value === "other" || value === "all" ? value : "universities";
}

function groupLabel(value: RankingGroup) {
  return ({ universities: "the university list", "liberal-arts": "the liberal-arts list", other: "other colleges", all: "all institutions" } as const)[value];
}

function readList(key: string): string[] {
  try { return JSON.parse(window.localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
