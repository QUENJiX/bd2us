import Link from "next/link";
import { notFound } from "next/navigation";
import { CollegeProfileTools } from "@/components/college-profile-tools";
import { colleges } from "@/lib/content";
import { rankingLabel } from "@/lib/college-rankings";
import { getPublishedCollege } from "@/lib/public-content";
import type { College } from "@/lib/types";

export function generateStaticParams() {
  return colleges.map((college) => ({ slug: college.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const college = await getPublishedCollege((await params).slug);
  return college ? { title: college.name, description: college.summary, alternates: { canonical: `/colleges/${college.slug}` } } : {};
}

export default async function CollegePage({ params }: { params: Promise<{ slug: string }> }) {
  const college = await getPublishedCollege((await params).slug);
  if (!college) notFound();

  const meaning = applicantMeaning(college);
  return (
    <main id="main-content" className="college-profile-page">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <Link className="back-link" href="/colleges">← Back to college list</Link>
        <div className="college-profile-grid">
          <article>
            <header className="college-profile-header">
              <p className="eyebrow">{college.location} · Reviewed {formatDate(college.datasetReviewedAt ?? college.lastVerifiedAt)}</p>
              <h1>{college.name}</h1>
              <p className="college-profile-deck">{college.summary}</p>
              <div className="profile-tags">
                {[college.control, college.type, college.setting, college.enrollmentBand].filter(Boolean).map((item) => <span key={item}>{item}</span>)}
                {college.aidPolicy !== "Not classified" ? <span>{college.aidPolicy}</span> : null}
              </div>
            </header>

            <section className="profile-section" aria-labelledby="numbers-title">
              <div className="section-kicker"><span>01</span><div><p className="eyebrow">Dataset snapshot</p><h2 id="numbers-title">Start with the numbers—then investigate the story.</h2></div></div>
              <div className="profile-numbers">
                <ProfileNumber label="Annual cost of attendance" value={formatUsd(college.costOfAttendance)} note="Before grants, scholarships, travel, insurance, and personal expenses unless the source states otherwise." />
                <ProfileNumber label="International students receiving aid" value={formatPercent(college.internationalAidPercent)} note="The share reported in the BD2US dataset; availability does not guarantee affordability." />
                <ProfileNumber label="Average international award" value={formatUsd(college.averageInternationalAid)} note="An average is not a promise. Award amounts can differ substantially by student." />
                <ProfileNumber label="Overall acceptance rate" value={formatPercent(college.admissions?.overallAcceptanceRate.value ?? college.acceptanceRate)} note={factNote(college.admissions?.overallAcceptanceRate, "Institution-wide context, never an estimate of your individual chance.")} />
                <ProfileNumber label="International acceptance rate" value={formatPercent(college.admissions?.internationalAcceptanceRate.value, "Not published")} note={factNote(college.admissions?.internationalAcceptanceRate, "A separate international rate is not reliably published for many colleges.")} />
                <ProfileNumber label="Ranking context" value={rankingLabel(college)} note={college.rankingCategory === "liberal-arts-college" ? "LACs use the separate U.S. News liberal-arts list; no QS rank is invented." : "QS global rank and the BD2US-derived U.S. position use the same 2027 table."} />
              </div>
            </section>

            <section className="profile-section" aria-labelledby="requirements-title">
              <div className="section-kicker"><span>02</span><div><p className="eyebrow">Application evidence</p><h2 id="requirements-title">Testing, English proficiency, and scholarships</h2></div></div>
              <div className="profile-evidence-grid">
                <article>
                  <p className="eyebrow">SAT / ACT</p>
                  <h3>{college.testing?.policy.value ?? "Policy not listed"}</h3>
                  <dl>
                    <EvidenceRow label="SAT composite" value={formatNumber(college.testing?.satComposite?.value)} />
                    <EvidenceRow label="Math middle 50%" value={formatRange(college.testing?.satMathRange?.value)} />
                    <EvidenceRow label="EBRW middle 50%" value={formatRange(college.testing?.satEbrwRange?.value)} />
                    <EvidenceRow label="SAT submitted" value={formatPercent(college.testing?.satSubmissionPercent?.value)} />
                  </dl>
                  <p className="evidence-caution">{college.testing?.context ?? "The workbook has no testing record. Verify the Fall 2027 policy on the official admissions site."}</p>
                </article>
                <article>
                  <p className="eyebrow">English proficiency</p>
                  <h3>{college.englishProficiency?.length ? "Reviewed test routes" : "Official review still needed"}</h3>
                  {college.englishProficiency?.length ? <dl>{college.englishProficiency.map((requirement) => <EvidenceRow key={requirement.test} label={requirement.test} value={requirement.minimumScore.value == null ? "Minimum not published" : `${requirement.minimumScore.value}${requirement.waiverNote ? ` · ${requirement.waiverNote}` : ""}`} />)}</dl> : <p>The workbook does not contain English-test requirements. Check accepted exams, minimum scores, curriculum-based waivers, and whether official scores are required at application.</p>}
                </article>
              </div>
              <div className="scholarship-ledger">
                <div><p className="eyebrow">Scholarship leads</p><h3>{college.scholarships?.length ? `${college.scholarships.length} workbook lead${college.scholarships.length === 1 ? "" : "s"}` : "No named scholarship listed"}</h3></div>
                {college.scholarships?.length ? college.scholarships.map((scholarship, index) => (
                  <article key={`${scholarship.name}-${index}`}>
                    <div><span>{String(index + 1).padStart(2, "0")}</span><h4>{scholarship.name}</h4>{scholarship.amount ? <strong>{scholarship.amount}</strong> : null}</div>
                    {scholarship.applicationMethod ? <p><b>How to apply:</b> {scholarship.applicationMethod}</p> : null}
                    {scholarship.requirements ? <p><b>Eligibility:</b> {scholarship.requirements}</p> : null}
                    {scholarship.notes ? <p><b>Workbook note:</b> {scholarship.notes}</p> : null}
                    <small>Uncertain workbook language remains a research lead until an official source is attached.</small>
                  </article>
                )) : <p>Missing does not mean unavailable. Search the college&apos;s official undergraduate scholarships and international financial-aid pages.</p>}
              </div>
            </section>

            {college.specialNote ? (
              <section className="funding-evidence" aria-labelledby="funding-note-title">
                <p className="eyebrow">Funding evidence to investigate</p>
                <h2 id="funding-note-title">A useful lead from the dataset</h2>
                <p>{college.specialNote}</p>
                <div className="verify-strip">Search the college&apos;s official international admissions and scholarship pages for the current Fall 2027 terms, eligibility, deadlines, and whether awards can be combined.</div>
              </section>
            ) : null}

            <section className="profile-section" aria-labelledby="meaning-title">
              <div className="section-kicker"><span>03</span><div><p className="eyebrow">Bangladesh applicant lens</p><h2 id="meaning-title">What this information means</h2></div></div>
              <div className="meaning-list">{meaning.map((item) => <div key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
            </section>

            <section className="profile-section" aria-labelledby="verify-title">
              <div className="section-kicker"><span>04</span><div><p className="eyebrow">Fall 2027 research checklist</p><h2 id="verify-title">Verify these before the college enters your final list.</h2></div></div>
              <ol className="verification-list">
                <li><strong>Affordability:</strong> net price for international students, need-based eligibility, merit awards, renewal conditions, and indirect costs.</li>
                <li><strong>Application policy:</strong> Fall 2027 testing requirements, English-proficiency routes, application plans, fee waivers, and deadlines.</li>
                <li><strong>Academic fit:</strong> intended major, curriculum flexibility, first-year support, research access, and any portfolio or prerequisite requirements.</li>
                <li><strong>International support:</strong> housing, health insurance, airport arrival, visa-document timeline, campus employment, and advising.</li>
              </ol>
              <div className="source-record">
                <div><p className="eyebrow">Source record</p><p>{college.sourceScope ?? "Review changing policies on the official college website."}</p></div>
                {college.source.url ? <a href={college.source.url} rel="noreferrer" target="_blank">Open official source ↗</a> : <a href={`https://www.google.com/search?q=${encodeURIComponent(`${college.name} international undergraduate admissions financial aid`)}`} rel="noreferrer" target="_blank">Find official college pages ↗</a>}
              </div>
            </section>

            <details className="dataset-detail">
              <summary>See the complete source description</summary>
              <p>{college.originalDescription ?? college.summary}</p>
            </details>
          </article>

          <aside className="college-profile-aside">
            <CollegeProfileTools college={college} />
            <nav className="profile-journey" aria-label="Related admissions journey">
              <p className="eyebrow">Continue your field guide</p>
              <Link href="/guide/college-research">How to build a balanced list</Link>
              <Link href="/guide/financial-aid">Understand international aid</Link>
              <Link href="/roadmap#research-list">Complete the research-list task</Link>
              <Link href="/dashboard">Open your planning workspace</Link>
            </nav>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProfileNumber({ label, value, note }: { label: string; value: string; note: string }) {
  return <div><p>{label}</p><strong>{value}</strong><span>{note}</span></div>;
}

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function applicantMeaning(college: College) {
  const items = [];
  if (college.costOfAttendance != null) {
    items.push({
      title: college.costOfAttendance >= 70000 ? "Treat affordability as a first filter" : "Model the complete four-year cost",
      text: college.costOfAttendance >= 70000
        ? "The listed price is high enough that a Bangladeshi applicant needing substantial support should confirm international need-based aid or named scholarships before investing heavily in the application."
        : "A lower listed price can still be unaffordable after exchange-rate changes, travel, insurance, and annual increases. Compare the amount your family can sustain for four years."
    });
  }
  if (college.internationalAidPercent != null) {
    items.push({
      title: "Aid prevalence is not aid generosity",
      text: `${college.internationalAidPercent}% receiving aid tells you how common an award was in the dataset, while the average award helps estimate scale. Neither figure explains your likely package or the current policy.`
    });
  } else {
    items.push({ title: "No international-aid percentage is listed", text: "Do not read the missing statistic as zero aid. Check the official international financial-aid and merit-scholarship pages directly." });
  }
  items.push({
    title: "Selectivity needs context",
    text: college.acceptanceRate != null && college.acceptanceRate < 20
      ? "A low overall rate means the college should be treated as highly uncertain for every applicant. It cannot be the only financial or academic route on your list."
      : "The overall rate does not account for international status, aid need, program demand, or the strength of your preparation. Use it only to balance the list, not to label the college a safety."
  });
  return items;
}

function formatUsd(value: number | null | undefined) {
  return value == null ? "Not listed" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
function formatPercent(value: number | null | undefined, missing = "Not listed") { return value == null ? missing : `${value}%`; }
function formatNumber(value: number | null | undefined) { return value == null ? "Not listed" : value.toLocaleString("en-US"); }
function formatRange(value: { low: number | null; high: number | null } | null | undefined) { return !value || (value.low == null && value.high == null) ? "Not listed" : value.low != null && value.high != null ? `${value.low}–${value.high}` : String(value.low ?? value.high); }
function factNote(fact: { status: string; dataYear?: string | null; sourceLabel?: string | null } | undefined, fallback: string) { return fact ? `${fact.status === "calculated" ? "BD2US calculated" : fact.status.replace("_", " ")}${fact.dataYear ? ` · data year ${fact.dataYear}` : ""}${fact.sourceLabel ? ` · ${fact.sourceLabel}` : ""}. ${fallback}` : fallback; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
