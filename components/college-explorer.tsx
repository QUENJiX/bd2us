"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { collegeFitReasons } from "@/lib/domain.mjs";
import { defaultProfile } from "@/lib/content";
import type { College, StudentProfile } from "@/lib/types";
import { Tag } from "@/components/ui";

const savedKey = "bd2us:saved-colleges";
const profileKey = "bd2us-profile";

type ViewMode = "grid" | "table";

export function CollegeExplorer({ colleges }: { colleges: College[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [aidPolicy, setAidPolicy] = useState(() => params.get("aid") ?? "All");
  const [institutionType, setInstitutionType] = useState(() => params.get("type") ?? "All");
  const [funding, setFunding] = useState(() => params.get("funding") ?? "All");
  const [view, setView] = useState<ViewMode>("grid");
  const [saved, setSaved] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);

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
    if (aidPolicy !== "All") next.set("aid", aidPolicy);
    if (institutionType !== "All") next.set("type", institutionType);
    if (funding !== "All") next.set("funding", funding);
    router.replace(next.size ? `/colleges?${next.toString()}` : "/colleges", { scroll: false });
  }, [aidPolicy, funding, institutionType, query, router]);

  const filtered = useMemo(
    () =>
      colleges.filter((college) => {
        const haystack = [college.name, college.shortName, college.location, ...college.themes]
          .join(" ")
          .toLowerCase();
        return (
          (!query || haystack.includes(query.toLowerCase())) &&
          (aidPolicy === "All" || college.aidPolicy === aidPolicy) &&
          (institutionType === "All" || college.type === institutionType) &&
          (funding === "All" ||
            (funding === "Full need" && college.meetsFullNeed) ||
            (funding === "Merit aid" && college.meritAid))
        );
      }),
    [aidPolicy, colleges, funding, institutionType, query]
  );

  const comparison = compare.map((slug) => colleges.find((college) => college.slug === slug)).filter(Boolean) as College[];

  function toggleSaved(slug: string) {
    const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
    setSaved(next);
    window.localStorage.setItem(savedKey, JSON.stringify(next));
  }

  function toggleCompare(slug: string) {
    if (compare.includes(slug)) return setCompare(compare.filter((item) => item !== slug));
    if (compare.length < 3) setCompare([...compare, slug]);
  }

  return (
    <div>
      <div className="card sticky top-20 z-20 mb-7 p-4 shadow-lg shadow-emerald-950/5">
        <div className="grid gap-3 md:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <label className="sr-only" htmlFor="college-search">Search colleges</label>
          <input
            id="college-search"
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-emerald-700"
            placeholder="Search name, city, or interest"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Filter label="Aid policy" value={aidPolicy} onChange={setAidPolicy} values={["All", "Need-blind", "Need-aware", "Merit-focused"]} />
          <Filter label="Institution type" value={institutionType} onChange={setInstitutionType} values={["All", "University", "Liberal arts college"]} />
          <Filter label="Funding route" value={funding} onChange={setFunding} values={["All", "Full need", "Merit aid"]} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-500"><strong className="text-emerald-950">{filtered.length}</strong> reviewed colleges</p>
          <div className="flex gap-2">
            <button className={`rounded-full px-3 py-1.5 text-xs font-bold ${view === "grid" ? "bg-emerald-900 text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setView("grid")}>Grid</button>
            <button className={`rounded-full px-3 py-1.5 text-xs font-bold ${view === "table" ? "bg-emerald-900 text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setView("table")}>Table</button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((college) => (
            <CollegeCard
              college={college}
              compared={compare.includes(college.slug)}
              fitReasons={collegeFitReasons(college, profile)}
              saved={saved.includes(college.slug)}
              toggleCompare={toggleCompare}
              toggleSaved={toggleSaved}
              key={college.slug}
            />
          ))}
        </div>
      ) : (
        <CollegeTable colleges={filtered} saved={saved} toggleSaved={toggleSaved} />
      )}

      {!filtered.length ? (
        <div className="card mt-5 p-8 text-center">
          <h2 className="font-display text-3xl text-emerald-950">No colleges match those filters.</h2>
          <p className="mt-2 text-sm text-slate-600">Clear one filter and keep exploring. A thoughtful list usually mixes several funding routes.</p>
        </div>
      ) : null}

      {comparison.length ? <Comparison colleges={comparison} clear={() => setCompare([])} /> : null}
    </div>
  );
}

function Filter({ label, value, onChange, values }: { label: string; value: string; onChange: (value: string) => void; values: string[] }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
      <span className="sr-only">{label}</span>
      <select className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-emerald-700" value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}

function CollegeCard({ college, compared, fitReasons, saved, toggleCompare, toggleSaved }: { college: College; compared: boolean; fitReasons: string[]; saved: boolean; toggleCompare: (slug: string) => void; toggleSaved: (slug: string) => void }) {
  return (
    <article className="card flex flex-col p-5 sm:p-6">
      <div className="flex justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{college.location}</p>
          <h2 className="font-display mt-2 text-3xl leading-none text-emerald-950">{college.name}</h2>
        </div>
        <button aria-label={`${saved ? "Remove" : "Save"} ${college.name}`} className="h-10 rounded-full border border-emerald-900/15 px-3 text-xs font-bold text-emerald-900" onClick={() => toggleSaved(college.slug)}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Tag>{college.aidPolicy}</Tag>
        {college.meetsFullNeed ? <Tag tone="amber">Meets full need</Tag> : null}
        {college.meritAid ? <Tag tone="neutral">Merit aid</Tag> : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{college.summary}</p>
      <div className="mt-5 rounded-2xl bg-emerald-50/80 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Why research this</p>
        <ul className="mt-2 space-y-1.5 text-sm text-emerald-950">
          {fitReasons.map((reason) => <li key={reason}>• {reason}</li>)}
        </ul>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        <Link className="text-sm font-bold text-emerald-900 underline decoration-emerald-300 underline-offset-4" href={`/colleges/${college.slug}`}>View verified profile</Link>
        <button className="text-sm font-bold text-slate-600" onClick={() => toggleCompare(college.slug)}>
          {compared ? "Remove comparison" : "Compare"}
        </button>
      </div>
    </article>
  );
}

function CollegeTable({ colleges, saved, toggleSaved }: { colleges: College[]; saved: string[]; toggleSaved: (slug: string) => void }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-emerald-950 text-xs uppercase tracking-[0.12em] text-emerald-50">
          <tr><th className="p-4">College</th><th className="p-4">Aid policy</th><th className="p-4">Funding</th><th className="p-4">Type</th><th className="p-4">Actions</th></tr>
        </thead>
        <tbody>
          {colleges.map((college) => (
            <tr className="border-t border-slate-100" key={college.slug}>
              <td className="p-4"><Link className="font-bold text-emerald-900" href={`/colleges/${college.slug}`}>{college.name}</Link><span className="mt-1 block text-xs text-slate-500">{college.location}</span></td>
              <td className="p-4">{college.aidPolicy}</td>
              <td className="p-4">{college.meetsFullNeed ? "Full need" : "Merit route"}{college.meritAid ? " · Merit aid" : ""}</td>
              <td className="p-4">{college.type}</td>
              <td className="p-4"><button className="font-bold text-emerald-800" onClick={() => toggleSaved(college.slug)}>{saved.includes(college.slug) ? "Saved" : "Save"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Comparison({ colleges, clear }: { colleges: College[]; clear: () => void }) {
  return (
    <section className="card mt-8 overflow-hidden border-emerald-900/20">
      <div className="flex items-center justify-between bg-emerald-950 px-5 py-4 text-white">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Research comparison</p><h2 className="font-display text-2xl">Compare what matters</h2></div>
        <button className="text-sm font-bold text-emerald-100" onClick={clear}>Clear</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr><th className="p-4 text-left text-slate-400">Factor</th>{colleges.map((college) => <th className="p-4 text-left font-display text-xl text-emerald-950" key={college.slug}>{college.shortName}</th>)}</tr></thead>
          <tbody>
            <CompareRow label="Aid policy" colleges={colleges} value={(college) => college.aidPolicy} />
            <CompareRow label="Meets full need" colleges={colleges} value={(college) => college.meetsFullNeed ? "Yes, if admitted" : "No"} />
            <CompareRow label="Merit aid" colleges={colleges} value={(college) => college.meritAid ? "Research available awards" : "Not offered"} />
            <CompareRow label="Testing" colleges={colleges} value={(college) => college.testingPolicy} />
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CompareRow({ label, colleges, value }: { label: string; colleges: College[]; value: (college: College) => string }) {
  return <tr className="border-t border-slate-100"><th className="p-4 text-left text-xs uppercase tracking-[0.12em] text-slate-500">{label}</th>{colleges.map((college) => <td className="p-4 text-slate-700" key={college.slug}>{value(college)}</td>)}</tr>;
}

function readList(key: string): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}
