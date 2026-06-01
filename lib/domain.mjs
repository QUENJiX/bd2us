export const searchSynonyms = {
  efc: ["budget", "family contribution", "financial aid", "affordability"],
  "financial aid": ["scholarship", "funding", "css profile", "isfaa", "efc", "family contribution"],
  scholarship: ["financial aid", "funding", "merit aid", "full ride"],
  "full ride": ["full funding", "scholarship", "financial aid"],
  css: ["css profile", "financial aid", "college board"],
  "css profile": ["css", "financial aid", "college board", "isfaa"],
  isaa: ["isfaa", "financial aid"],
  isfaa: ["financial aid", "css profile", "alternative aid form"],
  hsc: ["ssc hsc", "bangla medium", "national curriculum"],
  ssc: ["ssc hsc", "bangla medium", "national curriculum"],
  "a level": ["o a level", "english medium", "cambridge", "edexcel"],
  "o level": ["o a level", "english medium", "cambridge", "edexcel"],
  commonapp: ["common app", "common application", "application platform"],
  "common app": ["common application", "application platform", "fee waiver"],
  "fee waiver": ["common app", "application fee", "application platform"],
  visa: ["f1", "f 1", "i20", "i 20", "sevis", "ds160", "ds 160", "visa interview"],
  i20: ["i 20", "visa", "sevis"],
  "ds 160": ["ds160", "visa", "visa interview"],
  sat: ["testing", "college board", "standardized test"],
  "english proficiency": ["english test", "language test", "ielts", "toefl", "det", "duolingo english test"],
  "english test": ["english proficiency", "language test", "ielts", "toefl", "det"],
  toefl: ["english proficiency", "english test", "language test"],
  ielts: ["english proficiency", "english test", "language test"],
  det: ["duolingo english test", "english proficiency", "english test"],
  ed: ["early decision", "application plan"],
  ea: ["early action", "application plan"],
  rd: ["regular decision", "application plan"]
};

const shortSearchTerms = new Set(["ed", "ea", "rd", "ib"]);
const stopWords = new Set(["a", "an", "and", "are", "for", "from", "how", "in", "is", "of", "the", "to", "what", "with"]);

export function normalizeSearchText(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z])(\d)/gi, "$1 $2")
    .replace(/(\d)([a-z])/gi, "$1 $2")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function tokenize(value) {
  return normalizeSearchText(value)
    .split(" ")
    .filter((term) => term && (!stopWords.has(term) || shortSearchTerms.has(term)));
}

export function expandedTerms(query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  const queryTokens = tokenize(normalized);
  const additions = Object.entries(searchSynonyms).flatMap(([term, synonyms]) => {
    const normalizedTerm = normalizeSearchText(term);
    const fuzzyAlias = normalizedTerm.length >= 5 && (
      trigramSimilarity(normalized, normalizedTerm) >= 0.7 ||
      queryTokens.some((token) => token.length >= 5 && trigramSimilarity(token, normalizedTerm) >= 0.7)
    );
    return normalized.includes(normalizedTerm) || queryTokens.includes(normalizedTerm) || fuzzyAlias ? [normalizedTerm, ...synonyms] : [];
  });
  return [...new Set([normalized, ...queryTokens, ...additions.map(normalizeSearchText)])];
}

function similarity(left, right) {
  const a = new Set(tokenize(left));
  const b = new Set(tokenize(right));
  const overlap = [...a].filter((term) => b.has(term)).length;
  return overlap / Math.max(1, Math.max(a.size, b.size));
}

export function trigramSimilarity(left, right) {
  const grams = (value) => {
    const normalized = `  ${normalizeSearchText(value)} `;
    return new Set([...normalized].map((_, index) => normalized.slice(index, index + 3)).filter((gram) => gram.length === 3));
  };
  const a = grams(left);
  const b = grams(right);
  const overlap = [...a].filter((gram) => b.has(gram)).length;
  return (2 * overlap) / Math.max(1, a.size + b.size);
}

export function rankSearch(index, query) {
  const normalizedQuery = normalizeSearchText(query);
  const terms = expandedTerms(query);
  if (!terms.length) return [];
  const priority = { Guide: 5, Blog: 4.5, Task: 4, College: 3, FAQ: 2, Resource: 1 };
  const ranked = index
    .map((item) => {
      const title = normalizeSearchText(item.title);
      const summary = normalizeSearchText(item.summary);
      const keywords = normalizeSearchText(item.keywords.join(" "));
      let score = Number(priority[item.type] ?? 0) * 0.01;
      if (title === normalizedQuery) score += 90;
      else if (title.startsWith(normalizedQuery)) score += 52;
      else if (title.includes(normalizedQuery)) score += 32;
      if (keywords.includes(normalizedQuery)) score += 18;
      if (summary.includes(normalizedQuery)) score += 10;
      score += terms.reduce((total, term) => {
        if (!term || term === normalizedQuery) return total;
        if (title.includes(term)) total += 14;
        if (keywords.includes(term)) total += 7;
        if (summary.includes(term)) total += 3;
        return total;
      }, 0);
      score += similarity(title, normalizedQuery) * 14;
      score += similarity(keywords, normalizedQuery) * 7;
      score += Math.max(
        trigramSimilarity(title, normalizedQuery) * 16,
        trigramSimilarity(keywords, normalizedQuery) * 12,
        trigramSimilarity(summary, normalizedQuery) * 6
      );
      return { ...item, score };
    })
    .filter((item) => item.score > 2)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return [...new Map(ranked.map((item) => [`${item.type}|${item.href}|${item.title}`, item])).values()];
}

export function isContentStale({ lastVerifiedAt, nextReviewAt, today = new Date().toISOString().slice(0, 10), maxAgeDays = 120 }) {
  if (nextReviewAt && nextReviewAt < today) return true;
  const age = (Date.parse(today) - Date.parse(lastVerifiedAt)) / 86400000;
  return age > maxAgeDays;
}

export function estimateBudget({ monthlyIncomeBdt = 0, savingsBdt = 0, assetsBdt = 0, exchangeRate = 118 }) {
  const annualIncome = Number(monthlyIncomeBdt) * 12;
  const planningAmount = (annualIncome * 0.08 + Number(savingsBdt) * 0.04 + Number(assetsBdt) * 0.01) / Number(exchangeRate);
  const rounded = Math.max(0, Math.round(planningAmount / 250) * 250);
  return {
    planningAmount: rounded,
    band: rounded < 5000 ? "Full funding likely required" : rounded < 20000 ? "Substantial aid likely required" : "Partial contribution range",
    disclaimer:
      "Planning estimate only. It is not an institutional aid calculation, EFC, SAI, or financial-aid offer."
  };
}

export function collegeFitReasons(college, profile) {
  const reasons = [];
  if (profile.aidBand?.toLowerCase().includes("substantial") && college.meetsFullNeed) {
    reasons.push("meets full demonstrated need for admitted students");
  }
  if (profile.aidBand?.toLowerCase().includes("full") && college.aidPolicy === "Need-blind") {
    reasons.push("does not consider financial need in first-year admission");
  }
  if (college.meritAid) reasons.push("offers a merit-aid route worth researching");
  const interest = profile.interests?.find((value) =>
    college.themes.some((theme) => theme.toLowerCase().includes(value.toLowerCase()))
  );
  if (interest) reasons.push(`matches your interest in ${interest}`);
  if (!reasons.length) reasons.push("is in the reviewed BD2US research set");
  return reasons;
}
