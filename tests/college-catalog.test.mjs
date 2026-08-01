import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catalog = JSON.parse(readFileSync(new URL("../lib/college-catalog.generated.json", import.meta.url), "utf8"));

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

test("international rates remain unreviewed when neither a published rate nor official source is attached", () => {
  const mit = catalog.colleges.find((college) => college.name === "Massachusetts Institute of Technology (MIT)");
  assert.equal(mit.admissions.internationalAcceptanceRate.value, null);
  assert.equal(mit.admissions.internationalAcceptanceRate.status, "unreviewed");
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
