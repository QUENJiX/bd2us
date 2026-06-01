import { Suspense } from "react";
import { BudgetEstimator } from "@/components/budget-estimator";
import { CollegeExplorer } from "@/components/college-explorer";
import { SectionHeading, Tag } from "@/components/ui";
import { colleges, verifiedOn } from "@/lib/content";

export const metadata = {
  title: "College Explorer",
  description: "Build a source-backed U.S. college research list around funding, fit, and official information."
};

export default function CollegesPage() {
  return (
    <main>
      <section className="college-hero border-b border-emerald-900/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <Tag tone="amber">Curated and source-backed</Tag>
          <h1 className="font-display mt-5 max-w-4xl text-6xl leading-[.93] text-emerald-950 sm:text-7xl">Research a list that respects your budget.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Explore a deliberately focused starting set for Bangladeshi applicants. Every card links to an official source and shows why it may deserve research.
          </p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Records last reviewed {verifiedOn}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <SectionHeading eyebrow="College explorer" title="Filter carefully. Compare deliberately." description="These are research leads, not an admissions prediction. Verify changing facts on the college site before you apply." />
        <div className="mt-8">
          <Suspense fallback={<div className="card p-8 text-sm text-slate-600">Loading the explorer...</div>}>
            <CollegeExplorer colleges={colleges} />
          </Suspense>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <BudgetEstimator />
      </section>
    </main>
  );
}
