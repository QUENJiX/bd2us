import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catalog = JSON.parse(readFileSync(new URL("../lib/college-catalog.generated.json", import.meta.url), "utf8"));
const launchScope = JSON.parse(readFileSync(new URL("../data/college-launch-scope.json", import.meta.url), "utf8"));
const manualReviews = JSON.parse(readFileSync(new URL("../data/college-manual-review-overrides.json", import.meta.url), "utf8"));

test("college catalog contains 678 unique, publishable records", () => {
  assert.equal(catalog.count, 678);
  assert.equal(catalog.colleges.length, 678);
  assert.equal(catalog.skippedBlankRows, 5);
  assert.equal(catalog.source, "docs/data/college_data.xlsx");
  assert.equal(new Set(catalog.colleges.map((college) => college.slug)).size, 678);
  assert.equal(new Set(catalog.colleges.map((college) => college.name)).size, 678);
  for (const college of catalog.colleges) {
    assert.ok(college.slug);
    assert.ok(college.name);
    assert.ok(college.originalDescription);
    assert.equal(college.reviewStatus, "published");
    assert.equal(college.datasetReviewedAt, "2026-08-01");
  }
});

test("parser keeps missing source values null instead of inferring them", () => {
  const alabama = catalog.colleges.find((college) => college.slug === "alabama-a-and-m-university");
  assert.ok(alabama);
  assert.equal(alabama.internationalAidPercent, null);
  assert.equal(alabama.averageInternationalAid, null);
  assert.equal(alabama.meetsFullNeed, null);
  assert.equal(alabama.meritAid, true);
  assert.ok(alabama.scholarships.length > 0);
});

test("parser extracts cost, aid, acceptance, and special scholarship notes", () => {
  const adelphi = catalog.colleges.find((college) => college.slug === "adelphi-university");
  assert.deepEqual(
    {
      cost: adelphi.costOfAttendance,
      acceptance: adelphi.acceptanceRate,
      aidPercent: adelphi.internationalAidPercent,
      averageAid: adelphi.averageInternationalAid
    },
    { cost: 71834, acceptance: 77.512, aidPercent: 40.9, averageAid: 25053 }
  );
  assert.equal(adelphi.costOfAttendanceFact.status, "calculated");
  assert.equal(adelphi.costOfAttendanceFact.dataYear, "2023-24");
  assert.match(adelphi.costOfAttendanceFact.sourceUrl, /nces\.ed\.gov/);
  assert.equal(adelphi.admissions.overallAcceptanceRate.status, "calculated");
  assert.equal(adelphi.admissions.overallAcceptanceRate.applicants, 17111);
  assert.equal(adelphi.admissions.overallAcceptanceRate.admitted, 13263);
  assert.match(adelphi.admissions.overallAcceptanceRate.sourceUrl, /nces\.ed\.gov/);
  assert.match(adelphi.specialNote, /YouAreWelcomeHere/);
});

test("detailed research is limited to the 20-university and 10-LAC launch scope", () => {
  assert.equal(launchScope.universities.length, 20);
  assert.equal(launchScope.liberalArtsColleges.length, 10);
  const scopedNames = new Set([...launchScope.universities, ...launchScope.liberalArtsColleges].map((college) => college.name));
  const detailed = catalog.colleges.filter((college) => college.profileTier === "detailed");
  assert.ok(detailed.length >= 4);
  assert.ok(detailed.every((college) => scopedNames.has(college.name)));
  for (const slug of ["mit", "stanford", "harvard", "princeton"]) {
    assert.equal(catalog.colleges.find((college) => college.slug === slug)?.profileTier, "detailed");
  }
});

test("manual reviews have unique names so older entries cannot erase current guidance", () => {
  assert.equal(new Set(manualReviews.records.map((review) => review.name)).size, manualReviews.records.length);
});

test("current deadline guidance preserves institution-specific dates and aid deadlines", () => {
  const amherst = catalog.colleges.find((college) => college.slug === "amherst");
  assert.equal(amherst.deadlines.find((deadline) => deadline.plan === "ED" && deadline.kind === "application").date.value, "November 9, 2026");
  const hopkins = catalog.colleges.find((college) => college.name === "Johns Hopkins University");
  assert.equal(hopkins.deadlines.find((deadline) => deadline.plan === "ED2" && deadline.kind === "financial_aid").date.value, "January 15, 2027");
  const yale = catalog.colleges.find((college) => college.slug === "yale");
  assert.match(yale.englishProficiency.find((requirement) => requirement.test === "IELTS").minimumScore.value, /Competitive/);
  assert.match(yale.testing.policy.value, /required/);
});

test("Excel percentage decimals and SAT ranges are converted without changing their meaning", () => {
  const mit = catalog.colleges.find((college) => college.name === "Massachusetts Institute of Technology (MIT)");
  assert.equal(mit.internationalAidPercent, 74.2);
  assert.equal(mit.acceptanceRate, 4.735);
  assert.equal(mit.shortName, "MIT");
  assert.deepEqual(mit.aliases, ["MIT"]);
  assert.deepEqual(mit.testing.satMathRange.value, { low: 780, high: 800 });
  assert.deepEqual(mit.testing.satEbrwRange.value, { low: 730, high: 780 });
});

test("generated aliases are clean, unique, and never contain stale brackets", () => {
  for (const college of catalog.colleges) {
    assert.equal(new Set(college.aliases).size, college.aliases.length);
    assert.doesNotMatch(college.shortName, /[()[\]{}]/);
    for (const alias of college.aliases) assert.doesNotMatch(alias, /[()[\]{}]/);
  }
});

test("applicant-facing catalog contains no source placeholders or paid-sheet prompts", () => {
  const serialized = JSON.stringify(catalog.colleges);
  assert.doesNotMatch(serialized, /coming soon|premium|patreon/i);
});

test("established short profile slugs remain canonical and long forms remain aliases", () => {
  const preserved = new Map([
    ["Massachusetts Institute of Technology (MIT)", "mit"], ["Harvard University", "harvard"],
    ["Yale University", "yale"], ["Princeton University", "princeton"],
    ["Dartmouth College", "dartmouth"], ["Amherst College", "amherst"],
    ["Bowdoin College", "bowdoin"], ["Brown University", "brown"],
    ["University of Notre Dame", "notre-dame"], ["Stanford University", "stanford"],
    ["University of Rochester", "rochester"], ["University of Southern California", "usc"]
  ]);
  for (const [name, slug] of preserved) {
    const college = catalog.colleges.find((item) => item.name === name);
    assert.equal(college?.slug, slug);
    assert.ok(college?.slugAliases.length > 0);
  }
});

test("international rates remain unreviewed when neither a published rate nor official source is attached", () => {
  const adelphi = catalog.colleges.find((college) => college.name === "Adelphi University");
  assert.equal(adelphi.admissions.internationalAcceptanceRate.value, null);
  assert.equal(adelphi.admissions.internationalAcceptanceRate.status, "unreviewed");
});

test("calculated international rates retain official counts, year, source, and review date", () => {
  const mit = catalog.colleges.find((college) => college.name === "Massachusetts Institute of Technology (MIT)");
  const rate = mit.admissions.internationalAcceptanceRate;
  assert.equal(rate.value, 1.964);
  assert.equal(rate.status, "calculated");
  assert.equal(rate.applicants, 6926);
  assert.equal(rate.admitted, 136);
  assert.equal(rate.dataYear, "Class of 2029");
  assert.equal(rate.reviewedAt, "2026-08-09");
  assert.match(rate.sourceUrl, /^https:\/\/mitadmissions\.org\//);
});

test("acceptance rates are described as context, not personal odds", () => {
  const withoutAidStat = catalog.colleges.find((college) => college.slug === "youngstown-state-university");
  assert.match(withoutAidStat.summary, /context rather than a personal (admission )?probability/i);
});

test("official manual review facts populate plans, deadlines, fees, and platforms", () => {
  const albion = catalog.colleges.find((college) => college.name === "Albion College");
  assert.equal(albion.testing.policy.value, "Test-optional");
  assert.deepEqual(albion.applicationPlans, ["ED", "EA", "Rolling"]);
  assert.deepEqual(albion.deadlines.map((deadline) => [deadline.plan, deadline.date.value]), [["ED", "November 1"], ["EA", "December 1"]]);
  assert.equal(albion.applicationRequirements.plans.find((plan) => plan.code === "ED").binding, true);
  assert.equal(albion.applicationRequirements.fee.amount.value, 25);
  assert.deepEqual(albion.applicationRequirements.platforms.map((platform) => platform.name), ["Albion Application", "Common Application"]);
});

test("every college has sourced climate and campus-safety context", () => {
  for (const college of catalog.colleges) {
    assert.equal(college.campusContext.climate.status, "reported");
    assert.match(college.campusContext.climate.sourceLabel, /NASA POWER/);
    assert.match(college.campusContext.climate.value, /Annual average/);
    assert.equal(college.campusContext.safetyUrl.status, "reported");
    assert.match(college.campusContext.safetyUrl.value, /ope\.ed\.gov\/campussafety/);
  }
});
