import { normalizeSearchText, trigramSimilarity } from "./domain.mjs";

export function collegeSearchScore(college, query) {
  const needle = normalizeSearchText(query);
  if (!needle) return 0;
  const name = normalizeSearchText(college.name);
  const aliases = [...new Set([college.shortName, ...(college.aliases ?? [])].map(normalizeSearchText).filter(Boolean))];
  const location = normalizeSearchText([college.city, college.state, college.location, college.region].filter(Boolean).join(" "));
  const facts = normalizeSearchText([
    college.setting,
    college.specialNote,
    ...(college.themes ?? []),
    ...(college.researchHighlights ?? []),
    ...(college.scholarships ?? []).flatMap((item) => [item.name, item.amount, item.applicationMethod, item.requirements, item.notes])
  ].filter(Boolean).join(" "));
  const nameTokens = name.split(" ");

  if (name === needle) return 1000;
  if (aliases.some((alias) => alias === needle)) return 950;
  if (name.startsWith(needle)) return 850;
  if (nameTokens.some((token) => token === needle) || name.includes(needle)) return 750;
  if (aliases.some((alias) => alias.startsWith(needle))) return 650;
  if (location.split(" ").includes(needle) || location.includes(needle)) return 350;
  if (facts.includes(needle)) return 150;

  if (needle.length >= 4) {
    const nameSimilarity = trigramSimilarity(name, needle);
    const aliasSimilarity = Math.max(0, ...aliases.map((alias) => trigramSimilarity(alias, needle)));
    if (nameSimilarity >= 0.42) return 80 + nameSimilarity * 100;
    if (aliasSimilarity >= 0.65) return 70 + aliasSimilarity * 100;
  }
  return -1;
}

export function searchColleges(colleges, query, tieBreaker = (left, right) => left.name.localeCompare(right.name)) {
  const needle = normalizeSearchText(query);
  if (!needle) return [...colleges].sort(tieBreaker);
  return colleges
    .map((college) => ({ college, score: collegeSearchScore(college, needle) }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => right.score - left.score || tieBreaker(left.college, right.college))
    .map(({ college }) => college);
}
