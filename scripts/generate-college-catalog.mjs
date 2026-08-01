import ExcelJS from "exceljs";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const workbookPath = resolve(root, "docs/data/college_data.xlsx");
const descriptionsPath = resolve(root, "docs/data/college_data.json");
const enrichmentPath = resolve(root, "docs/data/college_enrichment.official.json");
const rankingsPath = resolve(root, "docs/data/college_rankings.official.json");
const researchLeadsPath = resolve(root, "data/college-research-leads.json");
const governmentFactsPath = resolve(root, "data/college-government-facts.json");
const outputPath = resolve(root, "lib/college-catalog.generated.json");
const reviewedAt = "2026-08-01";

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(workbookPath);
const sheet = workbook.worksheets[0];
if (!sheet) throw new Error("The workbook has no worksheets.");

const headers = new Map();
sheet.getRow(1).eachCell((cell, column) => {
  const header = clean(cellValue(cell.value));
  if (header) headers.set(header, column);
});

const descriptions = JSON.parse(readFileSync(descriptionsPath, "utf8"));
const descriptionByName = new Map(descriptions.map((row) => [normalizeTypography(clean(row["University Name"])), clean(row.Description)]));
const enrichment = JSON.parse(readFileSync(enrichmentPath, "utf8")).records ?? {};
const rankingData = JSON.parse(readFileSync(rankingsPath, "utf8"));
const researchLeadByName = new Map(JSON.parse(readFileSync(researchLeadsPath, "utf8")).records.map((record) => [normalizeTypography(record.name), record]));
const governmentFactById = new Map(JSON.parse(readFileSync(governmentFactsPath, "utf8")).records.map((record) => [record.ipedsId, record]));
const rankingByName = buildRankingMap(rankingData);
const lacNames = new Set(rankingData.usNews2026.categoryNames);
const seenNames = new Set();
const seenSlugs = new Set();
const colleges = [];
let skippedBlankRows = 0;

const aliasOverrides = {
  "Massachusetts Institute of Technology (MIT)": ["MIT"],
  "New York University (NYU)": ["NYU"],
  "New Jersey Institute of Technology (NJIT)": ["NJIT"],
  "Rensselaer Polytechnic Institute (RPI)": ["RPI"],
  "California Institute of Technology (Caltech)": ["Caltech"],
  "Georgia Institute of Technology (Georgia Tech)": ["Georgia Tech"],
  "Rochester Institute of Technology (RIT)": ["RIT"],
  "New York Institute of Technology (NYIT)": ["NYIT"],
  "University of Southern California": ["USC"],
  "University of California-Los Angeles": ["UCLA"],
  "University of California-Berkeley": ["UC Berkeley", "UCB"],
  "University of California-San Diego": ["UCSD"],
  "University of Pennsylvania": ["Penn", "UPenn"],
  "Pennsylvania State University-University Park": ["Penn State"],
  "Carnegie Mellon University": ["CMU"],
  "Johns Hopkins University": ["JHU"],
  "Texas A&M University-College Station": ["Texas A&M", "TAMU"]
};

for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
  const row = sheet.getRow(rowNumber);
  const rawName = clean(cellValue(row.getCell(2).value));
  if (!rawName) {
    skippedBlankRows += 1;
    continue;
  }
  const name = normalizeTypography(rawName);
  if (seenNames.has(name)) throw new Error(`Duplicate workbook college name: ${name}`);
  seenNames.add(name);

  const description = descriptionByName.get(name);
  if (!description) throw new Error(`Workbook college has no JSON description: ${name}`);
  const get = (header) => cellValue(row.getCell(requiredColumn(header)).value);
  const city = nullableText(get("City"));
  const state = nullableText(get("Name of the state")) ?? nullableText(get("State"));
  const location = [city, state].filter(Boolean).join(", ") || "Location not listed";
  const control = normalizeControl(get("Control"));
  const setting = nullableText(get("Setting"));
  const enrollmentBand = nullableText(get("Institution size"));
  const costOfAttendance = currency(get("Total cost of attendance without aid"));
  const acceptanceRate = percentage(get("Acceptance rate"));
  const internationalAcceptanceRate = percentage(get("International admission rate"));
  const internationalAidPercent = percentage(get("Percentage of International students who receive aid"));
  const averageInternationalAid = currency(get("Average amount awarded"));
  const needPolicyRaw = nullableText(get("Meets full demonstrated need?"));
  const scholarshipInfo = nullableText(get("Name and info"));
  const scholarshipAmount = nullableText(get("Amount of largest merit scholarship"));
  const scholarshipMethod = nullableText(get("How to apply"));
  const scholarshipNotes = nullableText(get("Notes"));
  const testingRequirement = nullableText(get("Testing Req."));
  const overallSource = nullableText(get("Acceptance rate data source"));
  const internationalSource = nullableText(get("International admission rate/yield data source"));
  const classYear = nullableText(get("Admission rate data from class year"));
  const aliases = aliasesFor(name);
  const legacySlug = slugify(rawName);
  const slug = uniqueSlug(slugify(name));
  const ranking = rankingByName.get(name);
  const researchLead = researchLeadByName.get(name);
  const governmentFact = governmentFactById.get(String(researchLead?.ipedsId ?? ""));
  const rankingCategory = lacNames.has(name) ? "liberal-arts-college" : ranking?.system === "QS World University Rankings" || /\bUniversity\b/i.test(name) ? "university" : "other";
  const scholarships = buildScholarships({ scholarshipInfo, scholarshipAmount, scholarshipMethod, scholarshipNotes });
  const testing = buildTestingProfile({
    testingRequirement,
    satComposite: numberValue(get("SAT comp 50%ile")),
    satMathLow: numberValue(get("SAT Math 25%ile")),
    satMathHigh: numberValue(get("SAT Math 75%ile")),
    satEbrwLow: numberValue(get("SAT EBRW 25%ile")),
    satEbrwHigh: numberValue(get("SAT EBRW 75%ile")),
    satSubmissionPercent: percentage(get("Percent of accepted students who submitted SAT scores")),
    actSubmissionPercent: percentage(get("Percent of accepted students who submitted ACT scores"))
  });
  const admissions = buildAdmissions({
    acceptanceRate,
    internationalAcceptanceRate,
    classYear,
    overallSource,
    internationalSource,
    internationalApplicants: numberValue(get("Class of 2027 - international applications")),
    internationalAdmitted: numberValue(get("Class of 2027 - international students admitted")),
    yieldRate: percentage(get("Yield (approx)")),
    internationalYieldRate: percentage(get("International yield")),
    rdRate: percentage(get("RD acceptance rate")),
    rdYear: nullableText(get("RD acceptance rate from class year")),
    edRate: percentage(get("ED acceptance rate")),
    edYear: nullableText(get("ED acceptance rate from year")),
    eaRate: percentage(get("EA acceptance rate")),
    earlyPlan: nullableText(get("Early plan offered?")),
    ed2: nullableText(get("ED2 offered?"))
  });
  const base = {
    ipedsId: researchLead?.ipedsId ?? null,
    slug,
    slugAliases: legacySlug === slug ? [] : [legacySlug],
    name,
    shortName: shortNameFor(name, aliases),
    aliases,
    location,
    city,
    state,
    region: nullableText(get("Region")),
    type: rankingCategory === "liberal-arts-college" ? "Liberal arts college" : rankingCategory === "university" ? "University" : /\bCollege\b/i.test(name) ? "College" : "Institution",
    rankingCategory,
    control,
    setting,
    enrollmentBand,
    aidPolicy: aidPolicyFor(needPolicyRaw, get("Types of Aid for international students")),
    meetsFullNeed: yesNo(needPolicyRaw),
    meritAid: scholarshipInfo || scholarshipAmount ? true : null,
    testingPolicy: testing.policy.value ?? "The current testing policy has not been confirmed here; check the official admission site.",
    englishTests: [],
    applicationPlans: applicationPlans(get("Early plan offered?"), get("ED2 offered?")),
    feeWaiver: "Verify the current application fee and waiver process on the official admission site.",
    themes: [control, setting, nullableText(get("Primary Focus")), nullableText(get("Types of Aid for international students"))].filter(Boolean),
    budgetFit: budgetFitFor(needPolicyRaw, scholarshipInfo, internationalAidPercent),
    strongLowContributionResearchSignal: researchLead?.strongLowContributionResearchSignal ?? false,
    summary: summaryFor({ name, location, control, costOfAttendance, acceptanceRate, internationalAidPercent }),
    source: { label: "U.S. Department of Education College Navigator", url: governmentFact?.identity?.sourceUrl ?? "", lastVerifiedAt: reviewedAt },
    officialLinks: governmentFact?.officialLinks ?? {},
    sourceScope: "Identity, overall admission counts, and available score ranges are checked against U.S. Department of Education information. Confirm changing application policies on the college's official pages.",
    originalDescription: description,
    costOfAttendance,
    acceptanceRate,
    internationalAidPercent,
    averageInternationalAid,
    specialNote: scholarshipNotes,
    admissions,
    testing,
    englishProficiency: [],
    scholarships,
    rankings: ranking ? [ranking] : [],
    researchHighlights: [],
    researchHighlightOverride: null,
    officialReview: { status: "unreviewed", reviewedAt: null, reviewerNote: null },
    workbookFacts: {
      stateCode: nullableText(get("State")),
      metro: nullableText(get("Accessible to Metropolitan Area")),
      gender: nullableText(get("Men's / Women's")),
      hbcu: nullableText(get("HBCU?")),
      primaryFocus: nullableText(get("Primary Focus")),
      undergraduateFocus: nullableText(get("Undergraduate?")),
      residency: nullableText(get("Where do most students live?")),
      religiousAffiliation: nullableText(get("Religious? (see \"Religion\" sheet)")),
      tuition: currency(get("Tuition and fees without aid")),
      roomAndBoard: currency(get("Room and board")),
      costYear: nullableText(get("COA from year")),
      aidTypes: nullableText(get("Types of Aid for international students")),
      internationalAidRecipients: numberValue(get("Number of international students awarded financial aid/scholarships")),
      averageNetCost: currency(get("Average cost in 2023-2024 after aid (merit or need)")),
      workbookSource: nullableText(get("Source")),
      totalAwarded: nullableText(get("Total awarded in millions")),
      largestMeritAmount: scholarshipAmount,
      adjustedTuition: currency(get("2024-2025 adjusted tuition after merit scholarship")),
      adjustedCostOfAttendance: currency(get("2024-2025 cost of attendance after largest merit scholarship")),
      countriesRepresented: numberValue(get("Number of countries represented among admitted students")),
      earlyDecisionAdvantage: nullableText(get("ED advantage over RD")),
      earlyActionAdvantage: nullableText(get("EA advantage over RD")),
      earlyDecisionClassShare: percentage(get("Percent of class of 2027 filled ED"))
    },
    datasetReviewedAt: reviewedAt,
    lastVerifiedAt: reviewedAt,
    reviewStatus: "published"
  };

  const merged = mergeEnrichment(mergeGovernmentFacts(base, governmentFact), enrichment[slug]);
  merged.researchHighlights = researchHighlightsFor(merged);
  colleges.push(merged);
}

const jsonNames = new Set(descriptionByName.keys());
const workbookOnly = [...seenNames].filter((name) => !jsonNames.has(name));
const jsonOnly = [...jsonNames].filter((name) => !seenNames.has(name));
if (workbookOnly.length || jsonOnly.length) throw new Error(`Excel/JSON name mismatch. Workbook only: ${workbookOnly.join(", ")}; JSON only: ${jsonOnly.join(", ")}`);
if (colleges.length !== 678) throw new Error(`Expected 678 populated workbook rows, received ${colleges.length}.`);
if (skippedBlankRows !== 5) throw new Error(`Expected five empty workbook rows, received ${skippedBlankRows}.`);

writeFileSync(outputPath, `${JSON.stringify({
  generatedAt: reviewedAt,
  source: "docs/data/college_data.xlsx",
  editorialTraceabilitySource: "docs/data/college_data.json",
  officialEnrichmentSource: "docs/data/college_enrichment.official.json",
  governmentSource: "data/college-government-facts.json",
  skippedBlankRows,
  count: colleges.length,
  colleges
}, null, 2)}\n`);
console.log(`Generated ${colleges.length} Excel-backed college records; skipped ${skippedBlankRows} blank rows.`);

function requiredColumn(header) {
  const column = headers.get(header);
  if (!column) throw new Error(`Missing workbook column: ${header}`);
  return column;
}

function cellValue(value) {
  if (value && typeof value === "object") {
    if ("result" in value) return value.result;
    if ("text" in value) return value.text;
    if ("hyperlink" in value) return value.hyperlink;
    if (Array.isArray(value.richText)) return value.richText.map((part) => part.text).join("");
  }
  return value;
}

function clean(value) { return String(value ?? "").replace(/\s+/g, " ").trim(); }
function normalizeTypography(value) { return value.replace(/â€™|â€˜/g, "’").replace(/â€œ|â€/g, "\"").replace(/â€“/g, "–").replace(/â€”/g, "—"); }
function nullableText(value) {
  const result = clean(value);
  return !result || result === "-" || /^n\/?a$/i.test(result) ? null : result;
}
function numberValue(value) {
  if (value == null || value === "") return null;
  const parsed = Number(String(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}
function currency(value) { return numberValue(value); }
function percentage(value) {
  const parsed = numberValue(value);
  if (parsed == null) return null;
  return Math.round((Math.abs(parsed) <= 1 ? parsed * 100 : parsed) * 1000) / 1000;
}
function slugify(value) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function uniqueSlug(base) {
  let slug = base;
  let suffix = 2;
  while (seenSlugs.has(slug)) slug = `${base}-${suffix++}`;
  seenSlugs.add(slug);
  return slug;
}

function aliasesFor(name) {
  const candidates = [...(aliasOverrides[name] ?? [])];
  for (const match of name.matchAll(/\(([^)]+)\)/g)) {
    const alias = clean(match[1]);
    if (/^[A-Za-z][A-Za-z0-9& .-]{1,14}$/.test(alias) && !/(campus|college|school|main|branch|state)/i.test(alias)) candidates.push(alias);
  }
  return [...new Set(candidates.map((alias) => alias.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")).filter((alias) => alias.length >= 2 && !name.toLowerCase().startsWith(`${alias.toLowerCase()} `)))];
}

function shortNameFor(name, aliases) {
  if (aliases[0]) return aliases[0];
  const compact = name.replace(/^The\s+/i, "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+(University|College)$/i, "").trim();
  if (compact.length <= 24) return compact;
  const initials = compact.split(/[^A-Za-z0-9]+/).filter((word) => word && !["of", "the", "and", "at", "in", "main", "campus"].includes(word.toLowerCase())).map((word) => word[0]).join("").slice(0, 8).toUpperCase();
  return initials.length >= 2 ? initials : compact.slice(0, 24).trim();
}

function normalizeControl(value) {
  const text = clean(value).toLowerCase();
  if (text.includes("private")) return "Private";
  if (text.includes("public")) return "Public";
  return "Unknown";
}
function yesNo(value) {
  const text = clean(value).toLowerCase();
  if (!text) return null;
  if (text.startsWith("yes")) return true;
  if (text.startsWith("no")) return false;
  return null;
}
function aidPolicyFor(needPolicy, aidTypes) {
  const text = `${clean(needPolicy)} ${clean(aidTypes)}`.toLowerCase();
  if (text.includes("blind")) return "Need-blind";
  if (text.includes("need")) return "Need-aware";
  if (text.includes("merit")) return "Merit-focused";
  return "Not classified";
}
function budgetFitFor(needPolicy, scholarshipInfo, aidPercent) {
  if (/blind|full/i.test(clean(needPolicy))) return "full-need";
  if (scholarshipInfo) return "merit";
  if (aidPercent != null) return "partial-need";
  return "research";
}
function applicationPlans(earlyPlan, ed2) {
  const text = `${clean(earlyPlan)} ${clean(ed2)}`.toUpperCase();
  return ["REA", "SCEA", "ED2", "ED", "EA"].filter((plan) => text.includes(plan));
}
function sourced(value, { source = null, dataYear = null, rawValue = null, status } = {}) {
  return {
    value,
    status: status ?? (value == null ? "unreviewed" : "reported"),
    sourceUrl: /^https?:\/\//i.test(source ?? "") ? source : null,
    sourceLabel: source && !/^https?:\/\//i.test(source) ? source : null,
    dataYear,
    cycle: null,
    reviewedAt,
    rawValue
  };
}
function rateFact(value, audience, options = {}) { return { ...sourced(value, options), audience, applicants: options.applicants ?? null, admitted: options.admitted ?? null }; }

function buildAdmissions(values) {
  const earlyPlans = [];
  if (values.rdRate != null) earlyPlans.push({ plan: "RD", acceptanceRate: sourced(values.rdRate, { dataYear: values.rdYear, source: values.overallSource }) });
  if (values.edRate != null) earlyPlans.push({ plan: "ED", acceptanceRate: sourced(values.edRate, { dataYear: values.edYear, source: values.overallSource }) });
  if (values.eaRate != null) earlyPlans.push({ plan: "EA", acceptanceRate: sourced(values.eaRate, { dataYear: values.edYear, source: values.overallSource }) });
  if (/yes/i.test(values.ed2 ?? "")) earlyPlans.push({ plan: "ED2", note: "ED2 is listed as a planning reference; verify the current cycle on the official admissions page." });
  return {
    overallAcceptanceRate: rateFact(values.acceptanceRate, "overall", { source: values.overallSource, dataYear: values.classYear }),
    internationalAcceptanceRate: rateFact(values.internationalAcceptanceRate, "international", { source: values.internationalSource, dataYear: values.classYear, applicants: values.internationalApplicants, admitted: values.internationalAdmitted }),
    yieldRate: sourced(values.yieldRate, { source: values.overallSource, dataYear: values.classYear }),
    internationalYieldRate: sourced(values.internationalYieldRate, { source: values.internationalSource, dataYear: values.classYear }),
    earlyPlans
  };
}

function normalizeTestingPolicy(raw) {
  if (!raw) return null;
  const value = raw.toLowerCase();
  if (/^req\.?$|required/.test(value)) return "Test required";
  if (/optional|^to\.?$|^opt\.?$/.test(value)) return "Test optional";
  if (/blind/.test(value)) return "Test blind";
  if (/flex/.test(value)) return "Test flexible";
  return raw;
}
function buildTestingProfile(values) {
  const hasMath = values.satMathLow != null || values.satMathHigh != null;
  const hasEbrw = values.satEbrwLow != null || values.satEbrwHigh != null;
  return {
    policy: sourced(normalizeTestingPolicy(values.testingRequirement), { rawValue: values.testingRequirement }),
    satComposite: sourced(values.satComposite),
    satMathRange: sourced(hasMath ? { low: values.satMathLow, high: values.satMathHigh } : null),
    satEbrwRange: sourced(hasEbrw ? { low: values.satEbrwLow, high: values.satEbrwHigh } : null),
    satSubmissionPercent: sourced(values.satSubmissionPercent),
    actSubmissionPercent: sourced(values.actSubmissionPercent),
    context: values.testingRequirement ? "Planning reference; confirm the Fall 2027 testing policy on the official admissions page before applying." : null
  };
}

function buildScholarships({ scholarshipInfo, scholarshipAmount, scholarshipMethod, scholarshipNotes }) {
  if (!scholarshipInfo && !scholarshipAmount && !scholarshipMethod && !scholarshipNotes) return [];
  const leadingName = scholarshipInfo?.split(/[:;\n]|\s[-–—]\s/)[0]?.trim();
  return [{
    name: leadingName && leadingName.length <= 100 ? leadingName : "Largest listed merit scholarship",
    amount: scholarshipAmount,
    applicationMethod: scholarshipMethod,
    requirements: null,
    restrictions: null,
    notes: [scholarshipInfo && scholarshipInfo !== leadingName ? scholarshipInfo : null, scholarshipNotes].filter(Boolean).join(" ") || null,
    source: sourced(scholarshipInfo ?? scholarshipAmount ?? scholarshipNotes, { status: "unreviewed", rawValue: scholarshipInfo })
  }];
}

function buildRankingMap(data) {
  const map = new Map();
  for (const entry of data.qs2027.entries) map.set(entry.name, { system: "QS World University Rankings", edition: data.qs2027.edition, globalRank: entry.globalRank, rankDisplay: entry.rankDisplay ?? String(entry.globalRank), nationalRank: null, tied: entry.tied, sourceUrl: data.qs2027.sourceUrl, reviewedAt: data.reviewedAt });
  for (const entry of data.usNews2026.entries) map.set(entry.name, { system: "U.S. News National Liberal Arts Colleges", edition: data.usNews2026.edition, globalRank: null, nationalRank: entry.nationalRank, tied: entry.tied, sourceUrl: data.usNews2026.sourceUrl, reviewedAt: data.reviewedAt });
  return map;
}

function mergeEnrichment(base, record) {
  if (!record) return base;
  return {
    ...base,
    ...record,
    aliases: [...new Set([...(base.aliases ?? []), ...(record.aliases ?? [])])],
    admissions: { ...base.admissions, ...(record.admissions ?? {}) },
    testing: { ...base.testing, ...(record.testing ?? {}) },
    scholarships: record.scholarships ?? base.scholarships,
    rankings: (record.rankings ?? base.rankings).map(publicRanking),
    englishProficiency: record.englishProficiency ?? base.englishProficiency,
    officialReview: record.officialReview ?? base.officialReview,
    workbookFacts: base.workbookFacts,
    originalDescription: base.originalDescription
  };
}

function mergeGovernmentFacts(base, record) {
  if (!record) return base;
  const overall = record.admissions?.overallAcceptanceRate;
  const testing = record.admissions ?? {};
  return {
    ...base,
    acceptanceRate: overall?.value ?? base.acceptanceRate,
    costOfAttendance: record.costOfAttendance?.value ?? base.costOfAttendance,
    costOfAttendanceFact: record.costOfAttendance ? { ...record.costOfAttendance, sourceLabel: "U.S. Department of Education NCES/IPEDS" } : undefined,
    source: { label: "U.S. Department of Education College Navigator", url: record.identity.sourceUrl, lastVerifiedAt: reviewedAt },
    officialLinks: record.officialLinks,
    admissions: {
      ...base.admissions,
      overallAcceptanceRate: {
        ...overall,
        audience: "overall",
        sourceLabel: "U.S. Department of Education NCES/IPEDS"
      }
    },
    testing: {
      ...base.testing,
      satMathRange: { ...testing.satMathRange, sourceLabel: "U.S. Department of Education NCES/IPEDS" },
      satEbrwRange: { ...testing.satEbrwRange, sourceLabel: "U.S. Department of Education NCES/IPEDS" },
      satSubmissionPercent: { ...testing.satSubmissionPercent, sourceLabel: "U.S. Department of Education NCES/IPEDS" },
      actSubmissionPercent: { ...testing.actSubmissionPercent, sourceLabel: "U.S. Department of Education NCES/IPEDS" }
    }
  };
}

function publicRanking(value) {
  const ranking = { ...value };
  delete ranking.countryPosition;
  delete ranking.countryPositionMethod;
  return ranking;
}

function researchHighlightsFor(college) {
  if (college.researchHighlightOverride) return [college.researchHighlightOverride];
  const highlights = [];
  if (college.strongLowContributionResearchSignal) highlights.push("A strong funding option to research for families who can contribute very little; confirm current international eligibility and the full four-year cost.");
  const scholarship = college.scholarships?.find((item) => item.name && !/largest listed/i.test(item.name));
  if (scholarship) highlights.push(`${scholarship.name}${scholarship.amount ? ` is listed at ${scholarship.amount}` : " is a named scholarship to verify"}.`);
  if (college.meetsFullNeed) highlights.push(`${college.name} is marked as meeting full demonstrated need; confirm how that policy applies to international applicants.`);
  if (college.internationalAidPercent != null) highlights.push(`Published information reports aid for ${formatPercent(college.internationalAidPercent)} of international students${college.averageInternationalAid != null ? `, averaging ${usd(college.averageInternationalAid)}` : ""}.`);
  if (college.testing?.satMathRange?.value) highlights.push(`Its listed SAT Math middle range is ${rangeLabel(college.testing.satMathRange.value)}, useful context if you plan to submit scores.`);
  if (college.rankings?.[0]) {
    const ranking = college.rankings[0];
    const rank = ranking.rankDisplay ?? ranking.globalRank ?? ranking.nationalRank;
    highlights.push(`${ranking.tied ? "Tied at" : "Ranked"} ${typeof rank === "number" ? `#${rank}` : rank} in the ${ranking.system} ${ranking.edition} snapshot.`);
  }
  if (!highlights.length && college.costOfAttendance != null) highlights.push(`The listed cost is ${usd(college.costOfAttendance)} before aid, so an official cost and aid-policy check should come first.`);
  if (!highlights.length && college.setting) highlights.push(`${college.setting} setting; compare transport, housing, and nearby support before shortlisting.`);
  return highlights.slice(0, 2);
}

function summaryFor({ name, location, control, costOfAttendance, acceptanceRate, internationalAidPercent }) {
  const facts = [];
  if (control !== "Unknown") facts.push(`${control.toLowerCase()} institution`);
  if (location !== "Location not listed") facts.push(`in ${location}`);
  let text = `${name} is ${facts.length ? `a ${facts.join(" ")}` : "included in the BD2US research catalog"}.`;
  if (costOfAttendance != null) text += ` The listed annual cost before aid is about ${usd(costOfAttendance)}.`;
  if (internationalAidPercent != null) text += ` It reports aid for ${formatPercent(internationalAidPercent)} of international students.`;
  else if (acceptanceRate != null) text += ` Its overall acceptance rate is ${formatPercent(acceptanceRate)}, which is context rather than a personal probability.`;
  return text;
}
function rangeLabel(range) { return range.low != null && range.high != null ? `${range.low}-${range.high}` : String(range.low ?? range.high ?? "Not listed"); }
function formatPercent(value) { return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`; }
function usd(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }
