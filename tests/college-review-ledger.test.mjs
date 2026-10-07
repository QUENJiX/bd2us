import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ledger = JSON.parse(readFileSync(new URL("../data/college-official-reviews.json", import.meta.url), "utf8"));

test("official review ledger contains every college and every required topic", () => {
  assert.equal(ledger.count, 678);
  assert.equal(ledger.records.length, 678);
  assert.equal(new Set(ledger.records.map((record) => record.slug)).size, 678);
  assert.deepEqual(ledger.requiredFields, [
    "identity", "overallAdmission", "scoreRanges", "cost", "internationalAid", "scholarships",
    "internationalAdmission", "applicationPlansAndDeadlines", "applicationRequirements", "testingPolicy",
    "englishProficiency", "campusSafety", "climate"
  ]);
  for (const record of ledger.records) {
    assert.deepEqual(Object.keys(record.fields), ledger.requiredFields);
    assert.ok(record.fields.identity.sources[0].url.startsWith("https://nces.ed.gov/"));
  }
});

test("topic-level review entries distinguish sourced outcomes from unfinished reviews", () => {
  const launchFields = [
    "internationalAid", "scholarships", "internationalAdmission", "applicationPlansAndDeadlines",
    "applicationRequirements", "testingPolicy", "englishProficiency"
  ];
  const allowedStatuses = new Set(["reported", "calculated", "previous_cycle", "not_published"]);

  for (const record of ledger.records) {
    for (const key of launchFields) {
      const field = record.fields[key];
      if (field.status === "unreviewed") {
        assert.equal(field.reviewedAt, null, `${record.name}: unfinished ${key} must not claim a review date`);
        assert.equal(field.sources.length, 0, `${record.name}: unfinished ${key} must not claim verified sources`);
        assert.equal(record.reviewStatus, "in_progress");
        continue;
      }
      assert.ok(allowedStatuses.has(field.status), `${record.name}: ${key} is ${field.status}`);
      assert.ok(field.reviewedAt, `${record.name}: ${key} has no review date`);
      assert.ok(field.sources.length > 0, `${record.name}: ${key} has no official source`);
      assert.ok(field.sources.every((source) => source.url.startsWith("https://")), `${record.name}: ${key} has an invalid source`);
    }
  }
});

test("manual official reviews retain current and previous-cycle status accurately", () => {
  const albion = ledger.records.find((record) => record.name === "Albion College");
  assert.equal(albion.fields.applicationPlansAndDeadlines.status, "reported");
  assert.match(albion.fields.applicationPlansAndDeadlines.sources[0].url, /albion\.edu/);
  const american = ledger.records.find((record) => record.name === "American University");
  assert.equal(american.fields.applicationPlansAndDeadlines.status, "previous_cycle");
  assert.match(american.fields.applicationPlansAndDeadlines.note, /prior-cycle/i);
});
