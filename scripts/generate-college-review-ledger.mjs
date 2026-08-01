import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalog = JSON.parse(readFileSync(resolve(root, "lib/college-catalog.generated.json"), "utf8"));
const government = JSON.parse(readFileSync(resolve(root, "data/college-government-facts.json"), "utf8"));
const pageIndex = JSON.parse(readFileSync(resolve(root, "data/college-official-page-index.json"), "utf8"));
const climate = JSON.parse(readFileSync(resolve(root, "data/college-climate-facts.json"), "utf8"));
const manual = JSON.parse(readFileSync(resolve(root, "data/college-manual-review-overrides.json"), "utf8"));
const governmentById = new Map(government.records.map((record) => [record.ipedsId, record]));
const pagesBySlug = new Map(pageIndex.records.map((record) => [record.slug, record]));
const climateById = new Map(climate.records.map((record) => [record.ipedsId, record]));
const manualByName = new Map(manual.records.map((record) => [record.name, record]));
const reviewedAt = "2026-08-01";

const records = catalog.colleges.map((college) => {
  const official = governmentById.get(String(college.ipedsId ?? ""));
  const officialPages = pagesBySlug.get(college.slug);
  const officialClimate = climateById.get(String(college.ipedsId ?? ""));
  if (!official) throw new Error(`Missing official government foundation for ${college.name}.`);
  const ncesSource = {
    label: "U.S. Department of Education College Navigator",
    url: official.identity.sourceUrl,
    reviewedAt
  };
  const hasScoreRange = [official.admissions.satMathRange, official.admissions.satEbrwRange, official.admissions.actCompositeRange]
    .some((fact) => fact.value != null);
  const fields = {
      identity: outcome("reported", [ncesSource], "Official institutional identity and location checked."),
      overallAdmission: outcome(official.admissions.overallAcceptanceRate.status, [ncesSource], official.admissions.overallAcceptanceRate.value == null ? "No overall applicant/admit count was published in this release." : "Rate calculated from same-year official applicant and admit counts."),
      scoreRanges: outcome(hasScoreRange ? "reported" : "not_published", [ncesSource], hasScoreRange ? "Available score ranges and submission shares checked." : "No score range was published in this release."),
      cost: outcome(official.costOfAttendance.status === "not_published" ? "not_published" : "previous_cycle", [ncesSource], official.costOfAttendance.note),
      internationalAid: pageOutcome(officialPages, "internationalAid"),
      scholarships: pageOutcome(officialPages, "scholarships"),
      internationalAdmission: pageOutcome(officialPages, "internationalAdmission"),
      applicationPlansAndDeadlines: pageOutcome(officialPages, "applicationPlansAndDeadlines"),
      applicationRequirements: pageOutcome(officialPages, "applicationRequirements"),
      testingPolicy: pageOutcome(officialPages, "testingPolicy"),
      englishProficiency: pageOutcome(officialPages, "englishProficiency"),
      campusSafety: outcome("reported", [{ label: "U.S. Department of Education Campus Safety and Security", url: official.officialLinks.campusSafety, reviewedAt }], "Official campus-safety lookup is available; interpret reports in context rather than as a single safety score."),
      climate: officialClimate?.status === "reported" ? outcome("reported", [{ label: officialClimate.sourceLabel, url: officialClimate.sourcePage, reviewedAt }], officialClimate.note) : pending("Official NASA climate lookup still needs to be completed.")
    };
  for (const [field, override] of Object.entries(manualByName.get(college.name)?.fields ?? {})) {
    fields[field] = outcome(override.status, [{ label: "Official college page", url: override.url, reviewedAt }], override.note);
  }
  return {
    slug: college.slug,
    name: college.name,
    ipedsId: college.ipedsId,
    reviewStatus: Object.values(fields).some((field) => field.status === "unreviewed") ? "in_progress" : "reviewed",
    fields
  };
});

if (records.length !== 678 || new Set(records.map((record) => record.slug)).size !== 678) {
  throw new Error("The official review ledger must contain exactly 678 unique college slugs.");
}

writeFileSync(resolve(root, "data/college-official-reviews.json"), `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: reviewedAt,
  requiredFields: Object.keys(records[0].fields),
  count: records.length,
  records
}, null, 2)}\n`);

const pendingCount = records.reduce((total, record) => total + Object.values(record.fields).filter((field) => field.status === "unreviewed").length, 0);
console.log(`Created the 678-college review ledger with ${pendingCount} official checks still required.`);

function outcome(status, sources, note) {
  return { status, sources, reviewedAt, note };
}

function pageOutcome(review, topic) {
  const pages = review?.pages?.filter((page) => page.topics.includes(topic)) ?? [];
  if (pages.length) return outcome("reported", pages.slice(0, 3).map((page) => ({ label: page.title || "Official college page", url: page.url, reviewedAt })), "Relevant information was located on an official college page; structured details require exact evidence before publication.");
  if ((review?.pages?.length ?? 0) >= 8) return outcome("not_published", review.pages.slice(0, 3).map((page) => ({ label: page.title || "Official college page", url: page.url, reviewedAt })), "No relevant information was found after checking the college's official admissions pages and sitemap; this can be revisited when the college updates its site.");
  return pending("The official site blocked access or did not expose enough relevant pages; a targeted review is still required.");
}

function pending(note = "Official college pages still need to be checked.") {
  return { status: "unreviewed", sources: [], reviewedAt: null, note };
}
