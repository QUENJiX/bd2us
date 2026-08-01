import ExcelJS from "exceljs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const publicPath = process.argv[2] ?? "C:/tmp/bd2us-public.csv";
const linksPath = process.argv[3] ?? "C:/tmp/bd2us-links.csv";
const zeroPath = process.argv[4] ?? "C:/tmp/bd2us-zero-efc.csv";
const outputPath = resolve(root, "data/college-research-leads.json");

const [publicSheet, linksSheet, zeroSheet] = await Promise.all([readCsv(publicPath), readCsv(linksPath), readCsv(zeroPath)]);
const linkRows = rowsByName(linksSheet, "Institution");
const lowContributionNames = new Set(dataRows(zeroSheet).map((row) => clean(row.getCell(1).value)).filter(Boolean));
const headers = headerMap(publicSheet);
const records = [];

const fields = {
  city: "City",
  state: "Name of the state",
  control: "Control",
  region: "Region",
  metropolitanAccess: "Accessible to Metropolitan Area",
  setting: "Setting",
  institutionSize: "Institution size",
  genderEnrollment: "Men's / Women's",
  hbcu: "HBCU?",
  primaryFocus: "Primary Focus",
  undergraduateFocus: "Undergraduate?",
  residencePattern: "Where do most students live?",
  budgetCategory: "Budget category",
  tuition: "Tuition and fees without aid",
  roomAndBoard: "Room and board",
  costOfAttendance: "Total cost of attendance without aid",
  costYear: "COA from year",
  internationalAidTypes: "Types of Aid for international students",
  internationalAidRecipients: "Number of international students awarded financial aid/scholarships",
  internationalAidShare: "Percentage of International students who receive aid",
  averageAward: "Average amount awarded",
  averageNetCost: "Average cost in 2023-2024 after aid (merit or need)",
  aidSourceLead: "Source",
  meetsFullNeed: "Meets full demonstrated need?",
  largestMeritAmount: "Amount of largest merit scholarship",
  scholarshipNameAndInfo: "Name and info",
  largestScholarshipName: "Name of Biggest Scholarship",
  scholarshipApplication: "How to apply",
  scholarshipNotes: "Notes",
  overallAcceptanceRate: "Acceptance rate",
  internationalAcceptanceRate: "International admission rate",
  acceptanceDataYear: "Admission rate data from class year",
  internationalApplicants: "Class of 2027 - international applications",
  internationalAdmitted: "Class of 2027 - international students admitted",
  internationalEnrolled: "Class of 2027 international accepted offer/enrolled",
  internationalAdmissionSourceLead: "International admission rate/yield data source",
  overallAdmissionSourceLead: "Acceptance rate data source",
  regularDecisionRate: "RD acceptance rate",
  regularDecisionRateYear: "RD acceptance rate from class year",
  earlyPlan: "Early plan offered?",
  ed2Offered: "ED2 offered?",
  earlyDecisionRate: "ED acceptance rate",
  earlyDecisionRateYear: "ED acceptance rate from year",
  earlyActionRate: "EA acceptance rate",
  earlyActionRateYear: "EA acceptance rate from class year",
  testingPolicy: "Testing Req.",
  satSubmissionShare: "Percent of accepted students who submitted SAT scores",
  actSubmissionShare: "Percent of accepted students who submitted ACT scores",
  satComposite: "SAT comp 50%ile",
  satMath25: "SAT Math 25%ile",
  satMath75: "SAT Math 75%ile",
  satEbrw25: "SAT EBRW 25%ile",
  satEbrw75: "SAT EBRW 75%ile",
  testingSourceLead: "Testing - main data source",
  eaOffered: "EA offered?",
  edDeadline: "ED application deadline",
  eaDeadline: "EA application deadline",
  priorityDeadline: "Priority Deadline",
  rollingAdmission: "Rolling admission?",
  rdDeadline: "RD deadline",
  earlyDocumentDeadline: "EA/ED document deadline",
  earlyAidDeadline: "EA/ED financial aid deadline",
  earlyTestingDeadline: "Latest testing for EA/ED",
  earlyNotification: "EA/ED notification date",
  ed2Deadline: "ED2 Application deadline",
  ed2AidDeadline: "ED2 Financial aid deadline",
  ed2Notification: "ED2 Notification Date",
  rdDocumentDeadline: "RD document deadline",
  rdTestingDeadline: "Latest testing accepted RD",
  rdAidDeadline: "RD/only financial aid deadline",
  rdNotification: "RD notification date",
  latestCommonDataSet: "Latest CDS available",
  climateRangeCelsius: "Range between average temperatures (coldest and hottest months) (C)",
  coldestMonth: "Coldest month (2023)",
  coldestAverageLowCelsius: "Coldest montly avg low in 2023 (°C)",
  averageTemperatureCelsius: "Average temp in 2023 (C)",
  warmestAverageHighCelsius: "Warmest monthly avg high in 2023 (°C)",
  warmestMonth: "Warmest month (2023)",
  campusViolentCrimeAverage: "On-campus violent crimes (non-sexual) reported 2018-2022, average per year (OPE)",
  campusSexualAssaultAverage: "On-campus rapes/sexual assaults reported 2018-2022 - average per year (OPE)"
};

for (const row of dataRows(publicSheet)) {
  const name = clean(row.getCell(2).value);
  if (!name) continue;
  const values = Object.fromEntries(Object.entries(fields).map(([key, header]) => [key, safeValue(row.getCell(requiredColumn(headers, header)).value)]));
  const link = linkRows.get(name);
  records.push({
    name,
    ipedsId: link ? clean(link.getCell(1).value) : null,
    scholarshipLead: link ? safeValue(link.getCell(3).value) : null,
    strongLowContributionResearchSignal: lowContributionNames.has(name),
    reviewStatus: "requires_official_verification",
    values
  });
}

if (records.length !== 678) throw new Error(`Expected 678 research leads, received ${records.length}.`);
if (new Set(records.map((record) => record.name)).size !== 678) throw new Error("Research lead names are not unique.");
if (linkRows.size !== 678) throw new Error(`Expected 678 Links rows, received ${linkRows.size}.`);

await mkdir(resolve(root, "data"), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ schemaVersion: 1, importedAt: "2026-08-01", sourceRole: "research_lead_only", excludedSourceColumns: 4, count: records.length, records }, null, 2)}\n`);
console.log(`Normalized ${records.length} public research leads; ${lowContributionNames.size} have a strong low-contribution research signal.`);

async function readCsv(path) {
  const workbook = new ExcelJS.Workbook();
  return workbook.csv.readFile(path);
}
function dataRows(sheet) { return Array.from({ length: Math.max(0, sheet.rowCount - 1) }, (_, index) => sheet.getRow(index + 2)); }
function headerMap(sheet) { return new Map(sheet.getRow(1).values.slice(1).map((value, index) => [clean(value), index + 1]).filter(([value]) => value)); }
function requiredColumn(headers, header) { const column = headers.get(header); if (!column) throw new Error(`Missing column: ${header}`); return column; }
function rowsByName(sheet, header) { const headers = headerMap(sheet); const nameColumn = requiredColumn(headers, header); return new Map(dataRows(sheet).map((row) => [clean(row.getCell(nameColumn).value), row]).filter(([name]) => name)); }
function clean(value) { return String(value ?? "").replace(/\s+/g, " ").trim(); }
function safeValue(value) {
  const cleaned = clean(value);
  if (!cleaned || /^-+$|^n\/?a$/i.test(cleaned) || /patreon|premium/i.test(cleaned)) return null;
  return cleaned;
}
