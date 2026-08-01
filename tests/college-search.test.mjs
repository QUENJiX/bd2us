import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collegeSearchScore, searchColleges } from "../lib/college-search.mjs";

const colleges = JSON.parse(readFileSync(new URL("../lib/college-catalog.generated.json", import.meta.url), "utf8")).colleges;

test("exact acronyms resolve before fact text and unrelated substrings", () => {
  const results = searchColleges(colleges, "MIT");
  assert.equal(results[0].name, "Massachusetts Institute of Technology (MIT)");
  assert.ok(results.every((college) => !college.researchHighlights.join(" ").toLowerCase().includes("submitted") || college.name.includes("MIT")));
});

test("college names containing Massachusetts outrank colleges merely located there", () => {
  const results = searchColleges(colleges, "Massachusetts");
  assert.match(results[0].name, /Massachusetts/i);
  const firstLocationOnly = results.findIndex((college) => !college.name.toLowerCase().includes("massachusetts"));
  const lastNameMatch = results.reduce((last, college, index) => college.name.toLowerCase().includes("massachusetts") ? index : last, -1);
  assert.ok(firstLocationOnly > lastNameMatch);
});

test("alias matching uses tokens instead of accidental substrings", () => {
  const mit = colleges.find((college) => college.shortName === "MIT");
  assert.equal(collegeSearchScore(mit, "MIT"), 950);
  assert.equal(collegeSearchScore(mit, "submitted"), -1);
  assert.equal(searchColleges(colleges, "NYU")[0].name, "New York University (NYU)");
});
