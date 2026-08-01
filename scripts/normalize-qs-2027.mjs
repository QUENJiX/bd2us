import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourcePath = process.argv[2] ?? "C:/tmp/qs2027-official.txt";
const source = JSON.parse(readFileSync(sourcePath, "utf8"));
const catalog = JSON.parse(readFileSync(resolve(root, "lib/college-catalog.generated.json"), "utf8"));
const rankingManifestPath = resolve(root, "docs/data/college_rankings.official.json");
const rankingManifest = JSON.parse(readFileSync(rankingManifestPath, "utf8"));
const sourceUrl = "https://www.topuniversities.com/world-university-rankings";
const mirrorDataUrl = "https://www.qs-topuniversities.cn/sites/default/files/qs-rankings-data/en/26f968d285c35eba846f63ffc48a96a2.txt";

const manualMatches = new Map(Object.entries({
  "University of California, Berkeley (UCB)": "University of California-Berkeley",
  "University of California, Los Angeles (UCLA)": "University of California-Los Angeles",
  "University of California, San Diego (UCSD)": "University of California-San Diego",
  "University of California, Davis": "University of California-Davis",
  "University of California, Santa Barbara (UCSB)": "University of California-Santa Barbara",
  "University of California, Irvine": "University of California-Irvine",
  "University of California, Riverside": "University of California-Riverside",
  "University of California, Santa Cruz": "University of California-Santa Cruz",
  "University of Illinois at Urbana-Champaign": "University of Illinois at Urbana-Champaign",
  "Pennsylvania State University": "Pennsylvania State University-University Park",
  "Purdue University": "Purdue University-West Lafayette",
  "University of Washington": "University of Washington-Seattle",
  "Texas A&M University": "Texas A&M University-College Station",
  "Arizona State University": "Arizona State University-Tempe",
  "University of Maryland, College Park": "University of Maryland-College Park",
  "University of Colorado Boulder": "University of Colorado Boulder",
  "The Ohio State University": "Ohio State University-Main Campus",
  "University of Massachusetts Amherst": "University of Massachusetts-Amherst",
  "Rutgers University–New Brunswick": "Rutgers University-New Brunswick",
  "Stony Brook University, State University of New York": "Stony Brook University",
  "University at Buffalo SUNY": "University at Buffalo",
  "University of Minnesota Twin Cities": "University of Minnesota-Twin Cities",
  "University of North Carolina, Chapel Hill": "University of North Carolina at Chapel Hill",
  "North Carolina State University": "North Carolina State University-Raleigh",
  "Virginia Polytechnic Institute and State University": "Virginia Tech (Polytech. Inst. & State U.)",
  "University at Buffalo SUNY": "SUNY - University at Buffalo",
  "Stony Brook University, State University of New York": "SUNY - Stony Brook University",
  "Colorado State University": "Colorado State University-Fort Collins",
  "Tulane University": "Tulane University of Louisiana",
  "University of Hawaiʻi at Mānoa": "University of Hawaii at Manoa",
  "University of Texas Dallas": "University of Texas at Dallas",
  "University of South Carolina": "University of South Carolina-Columbia",
  "University of Missouri, Columbia": "University of Missouri",
  "University of Oklahoma": "University of Oklahoma-Norman Campus",
  "University at Albany SUNY": "SUNY - University at Albany",
  "University of Alabama at Birmingham": "University of Alabama-Birmingham",
  "Binghamton University SUNY": "SUNY - Binghamton University",
  "The University of Alabama": "University of Alabama-Tuscaloosa (Main Campus)",
  "University of North Texas": "University of North Texas-Denton",
  "University of Texas Arlington": "University of Texas at Arlington",
  "Brigham Young University": "Brigham Young University-Provo",
  "Florida Atlantic University - Boca Raton": "Florida Atlantic University",
  "Miami University": "Miami University-Ohio",
  "University of Arkansas Fayetteville": "University of Arkansas (Main Cmapus)",
  "University of Missouri, Kansas City": "University of Missouri-Kansas City",
  "University of Texas El Paso": "University of Texas at El Paso"
}));

const catalogByName = new Map(catalog.colleges.map((college) => [college.name, college]));
const catalogByKey = new Map();
for (const college of catalog.colleges) {
  for (const value of [college.name, college.shortName, ...(college.aliases ?? [])]) {
    const key = nameKey(value);
    if (!catalogByKey.has(key)) catalogByKey.set(key, []);
    const matches = catalogByKey.get(key);
    if (!matches.some((match) => match.slug === college.slug)) matches.push(college);
  }
}

const entries = source.data.filter((entry) => entry.country === "United States").map((entry) => {
  const officialName = plainText(entry.title);
  const rankDisplay = String(entry.rank_display).trim();
  const exactRank = /^=?\d+$/.test(rankDisplay) ? Number(rankDisplay.replace("=", "")) : null;
  const manualName = manualMatches.get(officialName);
  const direct = catalogByKey.get(nameKey(officialName)) ?? [];
  const catalogName = manualName && catalogByName.has(manualName) ? manualName : direct.length === 1 ? direct[0].name : null;
  return {
    officialName,
    rankDisplay,
    globalRank: exactRank,
    tied: rankDisplay.startsWith("="),
    score: entry.score ? Number(entry.score) : null,
    qsCoreId: String(entry.core_id),
    profileUrl: absoluteProfileUrl(entry.title),
    catalogName,
    matchStatus: catalogName ? "matched" : direct.length > 1 ? "ambiguous" : "not_in_catalog"
  };
}).sort(compareRanks);

if (!entries.length || entries[0].officialName !== "Massachusetts Institute of Technology (MIT)" || entries[0].globalRank !== 1) throw new Error("The official U.S. ranking extraction failed its MIT #1 check.");
const requiredChecks = new Map([["Stanford University", 2], ["Harvard University", 5], ["Princeton University", 27]]);
for (const [name, rank] of requiredChecks) if (entries.find((entry) => entry.officialName === name)?.globalRank !== rank) throw new Error(`${name} failed the QS ${rank} check.`);

const snapshot = {
  schemaVersion: 1,
  edition: "2027",
  publishedAt: "2026-06-18",
  reviewedAt: "2026-08-01",
  sourceUrl,
  officialMirrorDataUrl: mirrorDataUrl,
  country: "United States",
  count: entries.length,
  matchedCatalogCount: entries.filter((entry) => entry.catalogName).length,
  entries
};
writeFileSync(resolve(root, "docs/data/qs2027-us.official.json"), `${JSON.stringify(snapshot, null, 2)}\n`);

rankingManifest.qs2027 = {
  edition: "2027",
  sourceUrl,
  entries: entries.filter((entry) => entry.catalogName).map((entry) => ({
    name: entry.catalogName,
    officialName: entry.officialName,
    rankDisplay: entry.rankDisplay,
    globalRank: entry.globalRank,
    tied: entry.tied
  }))
};
writeFileSync(rankingManifestPath, `${JSON.stringify(rankingManifest, null, 2)}\n`);
console.log(`Normalized ${entries.length} official U.S. QS entries; ${snapshot.matchedCatalogCount} match the BD2US college list.`);
if (snapshot.matchedCatalogCount < entries.length) console.log(`${entries.length - snapshot.matchedCatalogCount} official entries are retained in the snapshot but do not yet match a catalog institution.`);

function plainText(value) { return String(value).replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#039;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim(); }
function absoluteProfileUrl(value) { const match = String(value).match(/href="([^"]+)"/); return match ? new URL(match[1], "https://www.qs-topuniversities.cn").toString() : null; }
function nameKey(value) { return plainText(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/^the\s+/, "").replace(/\([^)]*\)/g, " ").replace(/&/g, " and ").replace(/\b(university|college)\b/g, " $1 ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim(); }
function rankFloor(display) { const value = Number(String(display).replace(/^=/, "").match(/^\d+/)?.[0]); return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER; }
function compareRanks(left, right) { return rankFloor(left.rankDisplay) - rankFloor(right.rankDisplay) || left.officialName.localeCompare(right.officialName); }
