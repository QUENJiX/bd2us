import test from "node:test";
import assert from "node:assert/strict";
import { collegeFitReasons, estimateBudget, expandedTerms, isContentStale, rankSearch, trigramSimilarity } from "../lib/domain.mjs";

test("Bangladesh-specific synonyms expand common planning terms", () => {
  assert.ok(expandedTerms("HSC timeline").includes("national curriculum"));
  assert.ok(expandedTerms("visa checklist").includes("ds 160"));
});

test("search ranking prefers title matches and keeps typo fallback useful", () => {
  const index = [
    { type: "Guide", title: "Financial aid strategy", summary: "Build a budget.", href: "/aid", keywords: ["scholarship"] },
    { type: "Guide", title: "Essay planning", summary: "Write clearly.", href: "/essays", keywords: ["personal statement"] }
  ];
  assert.equal(rankSearch(index, "financial aid")[0].href, "/aid");
  assert.ok(trigramSimilarity("scholarship", "scholership") > 0.65);
  assert.ok(expandedTerms("scholership").includes("financial aid"));
  assert.equal(rankSearch(index, "scholership")[0].href, "/aid");
});

test("search ranking expands application aliases and deduplicates stable results", () => {
  const duplicate = { type: "Guide", title: "Control the submission workflow", summary: "Track forms and fees.", href: "/applications", keywords: ["application platform", "common application", "fee waiver"] };
  const index = [
    duplicate,
    duplicate,
    { type: "Guide", title: "Essay planning", summary: "Write clearly.", href: "/essays", keywords: ["personal statement"] }
  ];
  const results = rankSearch(index, "common app");
  assert.equal(results[0].href, "/applications");
  assert.equal(results.filter((result) => result.href === "/applications").length, 1);
});

test("search normalization handles common visa punctuation variants", () => {
  assert.ok(expandedTerms("DS-160 form").includes("visa"));
  assert.ok(expandedTerms("I-20 checklist").includes("sevis"));
});

test("search normalization restores misspelled English proficiency phrases", () => {
  const index = [
    { type: "Guide", title: "Plan testing", summary: "Choose an English-proficiency test.", href: "/testing", keywords: ["English test", "IELTS", "TOEFL", "DET"] },
    { type: "Resource", title: "CSS Profile", summary: "Financial-aid form.", href: "/css", keywords: ["College Board"] }
  ];
  assert.ok(expandedTerms("englsh proficency").includes("english proficiency"));
  assert.equal(rankSearch(index, "englsh proficency")[0].href, "/testing");
});

test("budget estimator is transparent and never claims to calculate aid", () => {
  const result = estimateBudget({ monthlyIncomeBdt: 100000, savingsBdt: 500000, assetsBdt: 1000000, exchangeRate: 125 });
  assert.equal(result.planningAmount, 1000);
  assert.match(result.disclaimer, /not an institutional aid calculation/i);
});

test("fit explanations describe research reasons without admissions odds", () => {
  const reasons = collegeFitReasons(
    { meetsFullNeed: true, aidPolicy: "Need-blind", meritAid: false, themes: ["Engineering"] },
    { aidBand: "Need full funding", interests: ["Engineering"] }
  );
  assert.ok(reasons.some((reason) => reason.includes("does not consider financial need")));
  assert.ok(reasons.some((reason) => reason.includes("Engineering")));
  assert.ok(reasons.every((reason) => !reason.includes("%")));
});

test("stale content respects next-review dates and maximum review age", () => {
  assert.equal(isContentStale({ lastVerifiedAt: "2026-05-01", nextReviewAt: "2026-05-31", today: "2026-06-01" }), true);
  assert.equal(isContentStale({ lastVerifiedAt: "2026-05-01", today: "2026-06-01" }), false);
  assert.equal(isContentStale({ lastVerifiedAt: "2025-01-01", today: "2026-06-01" }), true);
});
