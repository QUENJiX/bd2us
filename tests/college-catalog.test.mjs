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
    { cost: 71675, acceptance: 77.512, aidPercent: 40.9, averageAid: 25053 }
  );
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
