import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ledger = JSON.parse(readFileSync(resolve(root, "data/college-official-reviews.json"), "utf8"));
const catalog = JSON.parse(readFileSync(resolve(root, "lib/college-catalog.generated.json"), "utf8"));
const scope = JSON.parse(readFileSync(resolve(root, "data/college-launch-scope.json"), "utf8"));
const allowedOutcomes = new Set(["reported", "calculated", "not_published", "previous_cycle"]);
const problems = [];
const scopedNames = new Set([...scope.universities, ...scope.liberalArtsColleges].map((college) => college.name));
const scopedColleges = catalog.colleges.filter((college) => scopedNames.has(college.name));
const scopedSlugs = new Set(scopedColleges.map((college) => college.slug));
const expectedScopeCount = scope.universities.length + scope.liberalArtsColleges.length;

if (ledger.count !== 678 || ledger.records.length !== 678) problems.push(`Expected 678 review entries; found ${ledger.records.length}.`);
if (new Set(ledger.records.map((record) => record.slug)).size !== 678) problems.push("Review slugs are not unique.");
if (scopedNames.size !== expectedScopeCount || scopedColleges.length !== expectedScopeCount) problems.push(`Expected ${expectedScopeCount} detailed-profile colleges; resolved ${scopedColleges.length}.`);

for (const record of ledger.records) {
  if (!scopedSlugs.has(record.slug)) continue;
  for (const fieldName of ledger.requiredFields) {
    const field = record.fields[fieldName];
    if (!field || !allowedOutcomes.has(field.status)) problems.push(`${record.slug}: ${fieldName} is not complete.`);
    if (field && allowedOutcomes.has(field.status) && (!field.reviewedAt || !field.sources?.length)) problems.push(`${record.slug}: ${fieldName} lacks review metadata or an official source.`);
  }
}

const ledgerBySlug = new Map(ledger.records.map((record) => [record.slug, record]));
for (const college of catalog.colleges) {
  if (!scopedSlugs.has(college.slug)) continue;
  const review = ledgerBySlug.get(college.slug);
  requireFact(college, "cost of attendance", college.costOfAttendanceFact);
  requireFact(college, "overall acceptance rate", college.admissions?.overallAcceptanceRate);
  requireFact(college, "international acceptance rate", college.admissions?.internationalAcceptanceRate);
  requireFact(college, "testing policy", college.testing?.policy);

  requireReviewedCollection(college, review, "englishProficiency", college.englishProficiency, (requirement) => {
    requireFact(college, `${requirement.test} minimum score`, requirement.minimumScore);
  });
  requireReviewedCollection(college, review, "scholarships", college.scholarships, (scholarship) => {
    requireFact(college, `scholarship ${scholarship.name}`, scholarship.source);
  });
  requireReviewedCollection(college, review, "applicationPlansAndDeadlines", college.deadlines, (deadline) => {
    requireFact(college, `${deadline.label} deadline`, deadline.date);
  });

  const requirementsStatus = review?.fields.applicationRequirements?.status;
  if (!college.applicationRequirements) {
    if (requirementsStatus !== "not_published") problems.push(`${college.slug}: application requirements have no field-level review.`);
  } else {
    for (const plan of college.applicationRequirements.plans ?? []) requireFact(college, `${plan.code} plan`, plan.source);
    for (const key of ["recommendations", "schoolForms", "transcripts", "midyearReport", "finalReport", "supplements", "interviews", "portfolio", "specialRequirements"]) {
      requireFact(college, `application requirement ${key}`, college.applicationRequirements[key]);
    }
    requireFact(college, "application fee", college.applicationRequirements.fee?.amount);
    requireFact(college, "international application fee", college.applicationRequirements.fee?.internationalFee);
    requireFact(college, "fee-waiver route", college.applicationRequirements.fee?.waiverRoute);
  }

  const serialized = JSON.stringify(college);
  if (/coming soon|premium|patreon/i.test(serialized)) problems.push(`${college.slug}: contains an applicant-facing source placeholder.`);
}

if (problems.length) {
  const failedSlugs = new Set(problems.map((problem) => problem.split(":", 1)[0]).filter((slug) => scopedSlugs.has(slug)));
  console.error(`Detailed-profile launch gate: ${expectedScopeCount - failedSlugs.size}/${expectedScopeCount} colleges complete; ${failedSlugs.size} colleges and ${problems.length} checks remain.`);
  for (const problem of problems.slice(0, 25)) console.error(`- ${problem}`);
  if (problems.length > 25) console.error(`- …and ${problems.length - 25} more.`);
  process.exit(1);
}

console.log(`College launch gate passed for ${scope.universities.length} ranked universities and ${scope.liberalArtsColleges.length} ranked liberal-arts colleges; all remaining colleges retain clearly labeled basic profiles.`);

function requireReviewedCollection(college, review, topic, values, inspect) {
  const topicStatus = review?.fields[topic]?.status;
  if (!values?.length) {
    if (topicStatus !== "not_published") problems.push(`${college.slug}: ${topic} has no field-level outcome.`);
    return;
  }
  for (const value of values) inspect(value);
}

function requireFact(college, label, fact) {
  if (!fact || !allowedOutcomes.has(fact.status)) {
    problems.push(`${college.slug}: ${label} is not officially resolved.`);
    return;
  }
  if (!fact.reviewedAt || !/^https:\/\//.test(fact.sourceUrl ?? "")) problems.push(`${college.slug}: ${label} lacks an official source and review date.`);
  if (fact.status === "calculated" && label.includes("acceptance") && (fact.applicants == null || fact.admitted == null || !fact.dataYear)) {
    problems.push(`${college.slug}: ${label} calculation lacks same-year official counts.`);
  }
}
