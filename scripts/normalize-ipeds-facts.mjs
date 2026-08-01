import ExcelJS from "exceljs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const leads = JSON.parse(await readFile(resolve(root, "data/college-research-leads.json"), "utf8"));
const directoryPath = process.argv[2] ?? "C:/tmp/HD2024/HD2024.csv";
const admissionsPath = process.argv[3] ?? "C:/tmp/ADM2023/adm2023.csv";
const pricingPath = process.argv[4] ?? "C:/tmp/IC2023_AY/ic2023_ay.csv";
const outputPath = resolve(root, "data/college-government-facts.json");

const [directorySheet, admissionsSheet, pricingSheet] = await Promise.all([readCsv(directoryPath), readCsv(admissionsPath), readCsv(pricingPath)]);
const directory = rowsById(directorySheet);
const admissions = rowsById(admissionsSheet);
const pricing = rowsById(pricingSheet);
const records = [];

for (const lead of leads.records) {
  const id = String(lead.ipedsId ?? "");
  const directoryRow = directory.rows.get(id);
  if (!directoryRow) throw new Error(`IPEDS directory row missing for ${lead.name} (${id}).`);
  const admissionRow = admissions.rows.get(id);
  const pricingRow = pricing.rows.get(id);
  const officialName = text(directoryRow, directory.headers, "INSTNM");
  const applicants = number(admissionRow, admissions.headers, "APPLCN");
  const admitted = number(admissionRow, admissions.headers, "ADMSSN");
  const ncesUrl = `https://nces.ed.gov/collegenavigator/?id=${id}`;
  records.push({
    name: lead.name,
    ipedsId: id,
    identity: {
      officialName,
      city: text(directoryRow, directory.headers, "CITY"),
      stateCode: text(directoryRow, directory.headers, "STABBR"),
      controlCode: number(directoryRow, directory.headers, "CONTROL"),
      localeCode: number(directoryRow, directory.headers, "LOCALE"),
      institutionSizeCode: number(directoryRow, directory.headers, "INSTSIZE"),
      status: "reported",
      sourceUrl: ncesUrl,
      dataYear: "2024-25"
    },
    officialLinks: {
      homepage: url(directoryRow, directory.headers, "WEBADDR"),
      admissions: url(directoryRow, directory.headers, "ADMINURL"),
      financialAid: url(directoryRow, directory.headers, "FAIDURL"),
      application: url(directoryRow, directory.headers, "APPLURL"),
      campusSafety: "https://ope.ed.gov/campussafety/"
    },
    costOfAttendance: officialCost(pricingRow, pricing.headers, ncesUrl),
    admissions: {
      overallAcceptanceRate: applicants && admitted != null ? { value: round(admitted / applicants * 100), status: "calculated", applicants, admitted, sourceUrl: ncesUrl, dataYear: "2023-24", reviewedAt: "2026-08-01" } : { value: null, status: "not_published", applicants: null, admitted: null, sourceUrl: ncesUrl, dataYear: "2023-24", reviewedAt: "2026-08-01" },
      satSubmissionPercent: sourcedNumber(admissionRow, admissions.headers, "SATPCT", ncesUrl),
      actSubmissionPercent: sourcedNumber(admissionRow, admissions.headers, "ACTPCT", ncesUrl),
      satEbrwRange: sourcedRange(admissionRow, admissions.headers, "SATVR25", "SATVR75", ncesUrl),
      satMathRange: sourcedRange(admissionRow, admissions.headers, "SATMT25", "SATMT75", ncesUrl),
      actCompositeRange: sourcedRange(admissionRow, admissions.headers, "ACTCM25", "ACTCM75", ncesUrl)
    }
  });
}

if (records.length !== 678) throw new Error(`Expected 678 matched IPEDS records, received ${records.length}.`);
await mkdir(resolve(root, "data"), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ schemaVersion: 1, generatedAt: "2026-08-01", officialSource: "U.S. Department of Education NCES/IPEDS", directoryYear: "2024-25", admissionsYear: "2023-24", count: records.length, records }, null, 2)}\n`);
console.log(`Normalized official NCES identity data for ${records.length} colleges; ${records.filter((record) => record.admissions.overallAcceptanceRate.value != null).length} include official overall admission counts.`);

async function readCsv(path) { const workbook = new ExcelJS.Workbook(); return workbook.csv.readFile(path); }
function rowsById(sheet) {
  const headers = new Map(sheet.getRow(1).values.slice(1).map((value, index) => [String(value).trim(), index + 1]));
  const rows = new Map();
  for (let index = 2; index <= sheet.rowCount; index += 1) rows.set(String(sheet.getRow(index).getCell(headers.get("UNITID")).value ?? ""), sheet.getRow(index));
  return { headers, rows };
}
function cell(row, headers, field) { if (!row) return null; const column = headers.get(field); return column ? row.getCell(column).value : null; }
function text(row, headers, field) { const value = String(cell(row, headers, field) ?? "").trim(); return value && value !== "." ? value : null; }
function number(row, headers, field) { const value = Number(cell(row, headers, field)); return Number.isFinite(value) && value >= 0 ? value : null; }
function url(row, headers, field) { const value = text(row, headers, field); if (!value) return null; try { return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).toString(); } catch { return null; } }
function round(value) { return Math.round(value * 1000) / 1000; }
function sourcedNumber(row, headers, field, sourceUrl) { const value = number(row, headers, field); return { value, status: value == null ? "not_published" : "reported", sourceUrl, dataYear: "2023-24", reviewedAt: "2026-08-01" }; }
function sourcedRange(row, headers, lowField, highField, sourceUrl) { const low = scoreNumber(row, headers, lowField); const high = scoreNumber(row, headers, highField); return { value: low == null && high == null ? null : { low, high }, status: low == null && high == null ? "not_published" : "reported", sourceUrl, dataYear: "2023-24", reviewedAt: "2026-08-01" }; }
function scoreNumber(row, headers, field) { const value = number(row, headers, field); return value && value > 0 ? value : null; }
function officialCost(row, headers, sourceUrl) {
  const components = {
    outOfStateTuitionAndFees: number(row, headers, "CHG3AY3"),
    booksAndSupplies: number(row, headers, "CHG4AY3"),
    onCampusRoomAndBoard: number(row, headers, "CHG5AY3"),
    onCampusOtherExpenses: number(row, headers, "CHG6AY3")
  };
  const values = Object.values(components);
  const value = values.every((item) => item != null) ? values.reduce((sum, item) => sum + item, 0) : null;
  return { value, components, status: value == null ? "not_published" : "calculated", sourceUrl, dataYear: "2023-24", reviewedAt: "2026-08-01", note: "Previous-cycle on-campus estimate calculated from the official out-of-state tuition and fees, books, room and board, and other-expense components." };
}
