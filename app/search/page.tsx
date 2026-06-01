import { Suspense } from "react";
import { SearchPage } from "@/components/search-page";

export const metadata = {
  title: "Search",
  description: "Search BD2US guides, roadmap tasks, colleges, FAQs, and trusted resources."
};

export default function SearchRoute() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Find the next useful thing</p>
      <h1 className="font-display mt-4 text-6xl leading-[.94] text-emerald-950 sm:text-7xl">Search without digging.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Search guides, roadmap tasks, reviewed college profiles, answers, and official resources from one place.</p>
      <div className="mt-9">
        <Suspense fallback={<div className="card p-6 text-sm text-slate-600">Opening search...</div>}><SearchPage /></Suspense>
      </div>
    </main>
  );
}
