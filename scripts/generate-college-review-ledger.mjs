import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalog = JSON.parse(readFileSync(resolve(root, "lib/college-catalog.generated.json"), "utf8"));
const government = JSON.parse(readFileSync(resolve(root, "data/college-government-facts.json"), "utf8"));
const governmentById = new Map(government.records.map((record) => [record.ipedsId, record]));
const reviewedAt = "2026-08-01";

const records = catalog.colleges.map((college) => {
  const official = governmentById.get(String(college.ipedsId ?? ""));
  if (!official) throw new Error(`Missing official government foundation for ${college.name}.`);
  const ncesSource = {
    label: "U.S. Department of Education College Navigator",
    url: official.identity.sourceUrl,
    reviewedAt
  };
  const hasScoreRange = [official.admissions.satMathRange, official.admissions.satEbrwRange, official.admissions.actCompositeRange]
    .some((fact) => fact.value != null);
  return {
    slug: college.slug,
    name: college.name,
    ipedsId: college.ipedsId,
    reviewStatus: "in_progress",
    fields: {
      identity: outcome("reported", [ncesSource], "Official institutional identity and location checked."),
      overallAdmission: outcome(official.admissions.overallAcceptanceRate.status, [ncesSource], official.admissions.overallAcceptanceRate.value == null ? "No overall applicant/admit count was published in this release." : "Rate calculated from same-year official applicant and admit counts."),
      scoreRanges: outcome(hasScoreRange ? "reported" : "not_published", [ncesSource], hasScoreRange ? "Available score ranges and submission shares checked." : "No score range was published in this release."),
      cost: pending(),
      internationalAid: pending(),
      scholarships: pending(),
      internationalAdmission: pending(),
      applicationPlansAndDeadlines: pending(),
      applicationRequirements: pending(),
      testingPolicy: pending(),
      englishProficiency: pending(),
      campusContext: pending()
    }
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

function pending() {
  return { status: "unreviewed", sources: [], reviewedAt: null, note: "Official college pages still need to be checked." };
}
