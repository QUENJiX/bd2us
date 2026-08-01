import { Suspense } from "react";
import { BudgetEstimator } from "@/components/budget-estimator";
import { CollegeExplorer } from "@/components/college-explorer";
import { JourneyRail } from "@/components/journey-rail";
import { colleges, verifiedOn } from "@/lib/content";
import { getPublishedColleges } from "@/lib/public-content";

export const metadata = {
  title: "College List",
  description: "Research 678 U.S. colleges using cost, international-aid, setting, size, and admissions context built for Bangladeshi applicants."
};

export default async function CollegesPage() {
  const publicColleges = await getPublishedColleges();
  return (
    <main id="main-content">
      <section className="catalog-hero">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="eyebrow">BD2US research catalog · Fall 2027</p>
            <h1>Build the list with evidence, not brand names.</h1>
            <p className="catalog-deck">Explore the complete BD2US college list. Compare cost, international-aid reach, average awards, setting, size, and overall selectivity—then verify the policies that can change.</p>
          </div>
          <dl className="catalog-summary">
            <div><dt>Colleges</dt><dd>{colleges.length}</dd></div>
            <div><dt>Information checked</dt><dd>{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(`${verifiedOn}T00:00:00`))}</dd></div>
            <div><dt>Applicant lens</dt><dd>Bangladesh → United States</dd></div>
          </dl>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6"><JourneyRail compact /></div>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="section-intro">
          <p className="eyebrow">Comprehensive explorer</p>
          <h2>Filter the facts. Read the context. Keep your own notes.</h2>
          <p>Published facts are useful starting points. Testing, deadlines, aid rules, and scholarship eligibility can change by cycle, so each profile ends with a verification checklist.</p>
        </div>
        <div className="mt-8">
          <Suspense fallback={<div className="empty-state">Opening the college catalog…</div>}>
            <CollegeExplorer colleges={publicColleges} />
          </Suspense>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <BudgetEstimator />
      </section>
    </main>
  );
}
