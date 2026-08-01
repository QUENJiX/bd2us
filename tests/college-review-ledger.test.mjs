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

test("unreviewed college-specific policies cannot be mistaken for not published facts", () => {
  const pending = ledger.records.flatMap((record) => Object.values(record.fields)).filter((field) => field.status === "unreviewed");
  assert.ok(pending.length > 0);
  assert.ok(pending.every((field) => field.reviewedAt === null && field.sources.length === 0));
});
