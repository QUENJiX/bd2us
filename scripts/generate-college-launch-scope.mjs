import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const rankings = JSON.parse(readFileSync(resolve(root, "docs/data/college_rankings.official.json"), "utf8"));
const scope = {
  schemaVersion: 1,
  reviewedAt: "2026-08-09",
  policy: "Complete official profiles for 20 ranked universities and 10 ranked liberal-arts colleges; basic profiles remain available for the rest of the catalog.",
  universities: rankings.qs2027.entries.slice(0, 20).map(({ name, globalRank, rankDisplay }) => ({ name, globalRank, rankDisplay })),
  liberalArtsColleges: rankings.usNews2026.entries.slice(0, 10).map(({ name, nationalRank }) => ({ name, nationalRank }))
};

writeFileSync(resolve(root, "data/college-launch-scope.json"), `${JSON.stringify(scope, null, 2)}\n`);
console.log(`Launch scope: ${scope.universities.length} universities + ${scope.liberalArtsColleges.length} liberal-arts colleges.`);
