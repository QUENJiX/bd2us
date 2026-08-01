import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function loadTypeScriptModule(relativePath) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} };
  new Function("exports", "module", output)(loadedModule.exports, loadedModule);
  return loadedModule.exports;
}

const catalog = JSON.parse(readFileSync(new URL("../lib/college-catalog.generated.json", import.meta.url), "utf8")).colleges;
const qsSnapshot = JSON.parse(readFileSync(new URL("../docs/data/qs2027-us.official.json", import.meta.url), "utf8"));
const { getCollegeRanking, getRankingGroup, compareByRanking } = loadTypeScriptModule("../lib/college-rankings.ts");
const college = (name) => catalog.find((item) => item.name === name);

test("QS 2027 university ranks are attached without combining them with LAC ranks", () => {
  assert.equal(qsSnapshot.count, 184);
  assert.equal(qsSnapshot.matchedCatalogCount, 179);
  assert.equal(qsSnapshot.entries.filter((entry) => entry.matchStatus !== "matched").length, 5);
  const mit = getCollegeRanking(college("Massachusetts Institute of Technology (MIT)"));
  assert.equal(mit.rank, 1);
  assert.equal(mit.globalRank, 1);
  assert.equal(mit.countryPosition, undefined);
  assert.equal(mit.system, "QS World University Rankings");
  assert.equal(getCollegeRanking(college("Stanford University")).rank, 2);
  assert.equal(getCollegeRanking(college("Harvard University")).rank, 5);
  assert.equal(getCollegeRanking(college("Princeton University")).rank, 27);
  assert.equal(getCollegeRanking(college("Kent State University")).rankDisplay, "1201-1400");
  assert.equal(getRankingGroup(college("Massachusetts Institute of Technology (MIT)")), "universities");
  assert.equal(getRankingGroup(college("Harvard University")), "universities");
});

test("U.S. News 2026 liberal-arts ranks remain a separate list", () => {
  assert.equal(getCollegeRanking(college("Williams College")).rank, 1);
  assert.equal(getCollegeRanking(college("Amherst College")).rank, 2);
  assert.equal(getCollegeRanking(college("Swarthmore College")).rank, 4);
  assert.equal(getRankingGroup(college("Williams College")), "liberal-arts");
  assert.equal(getRankingGroup(college("Washington and Lee University")), "liberal-arts");
});

test("unranked institutions stay unranked and follow ranked records alphabetically", () => {
  const unranked = college("Adelphi University");
  assert.equal(getCollegeRanking(unranked), null);
  assert.ok(compareByRanking(college("Harvard University"), unranked) < 0);
});

test("combined sorting groups ranking systems instead of comparing their rank numbers", () => {
  const mixed = [college("Williams College"), college("Harvard University"), college("Adelphi University")].sort(compareByRanking);
  assert.deepEqual(mixed.map((item) => item.name), ["Harvard University", "Adelphi University", "Williams College"]);
});
