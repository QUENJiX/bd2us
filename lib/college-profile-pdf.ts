import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { College } from "@/lib/types";

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 38;
const paper = rgb(0.984, 0.973, 0.937);
const forest = rgb(0.024, 0.306, 0.231);
const forestDeep = rgb(0.012, 0.22, 0.169);
const navy = rgb(0.086, 0.196, 0.31);
const amber = rgb(0.647, 0.365, 0.067);
const ink = rgb(0.09, 0.13, 0.114);
const muted = rgb(0.36, 0.43, 0.4);
const line = rgb(0.82, 0.8, 0.75);
const white = rgb(1, 0.994, 0.973);

export async function downloadCollegeProfile(college: College) {
  const bytes = await createCollegeProfilePdf(college);
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = documentElement("a");
  anchor.href = url;
  anchor.download = `${safeFilename(college.name)}-bd2us-profile.pdf`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function createCollegeProfilePdf(college: College) {
  const document = await PDFDocument.create();
  document.setTitle(`${college.name} — BD2US college profile`);
  document.setAuthor("BD2US");
  document.setSubject("Public college research facts for a Bangladeshi applicant");
  const page = document.addPage([pageWidth, pageHeight]);
  const sans = await document.embedFont(StandardFonts.Helvetica);
  const sansBold = await document.embedFont(StandardFonts.HelveticaBold);
  const serif = await document.embedFont(StandardFonts.TimesRomanBold);
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: paper });

  page.drawRectangle({ x: 0, y: pageHeight - 130, width: pageWidth, height: 130, color: forestDeep });
  page.drawText("BD2US", { x: margin, y: pageHeight - 34, font: serif, size: 17, color: white });
  page.drawText("COLLEGE RESEARCH PROFILE", { x: margin + 72, y: pageHeight - 31, font: sansBold, size: 7.4, color: rgb(0.75, 0.91, 0.84) });
  const titleLines = wrapText(college.name, serif, 25, 420, 2);
  drawLines(page, titleLines, { x: margin, y: pageHeight - 68, font: serif, size: 25, color: white, lineHeight: 27 });
  page.drawText(ascii(`${college.location}  |  ${typeLabel(college)}`), { x: margin, y: pageHeight - 116, font: sans, size: 9, color: rgb(0.81, 0.9, 0.86) });
  drawRankingStamp(page, college, sans, sansBold);

  let y = pageHeight - 155;
  label(page, "RESEARCH SNAPSHOT", margin, y, sansBold);
  y -= 13;
  const facts = [
    ["Annual cost", money(college.costOfAttendance)],
    ["Intl. aid share", percent(college.internationalAidPercent, "Not listed")],
    ["Average award", money(college.averageInternationalAid)],
    ["Overall admit rate", percent(college.admissions?.overallAcceptanceRate.value ?? college.acceptanceRate, "Not listed")],
    ["International admit rate", percent(college.admissions?.internationalAcceptanceRate.value, "Not published")],
    ["Aid policy", college.aidPolicy]
  ];
  y = drawFactGrid(page, facts, y, sans, sansBold);

  y -= 19;
  const columnWidth = (pageWidth - margin * 2 - 18) / 2;
  const leftX = margin;
  const rightX = margin + columnWidth + 18;
  const sectionTop = y;
  label(page, "ADMISSION CONTEXT", leftX, sectionTop, sansBold);
  let leftY = sectionTop - 18;
  leftY = drawKeyValue(page, "Overall", acceptanceLabel(college, "overall"), leftX, leftY, columnWidth, sans, sansBold);
  leftY = drawKeyValue(page, "International", acceptanceLabel(college, "international"), leftX, leftY, columnWidth, sans, sansBold);
  leftY = drawKeyValue(page, "Plans", applicationPlanLabel(college), leftX, leftY, columnWidth, sans, sansBold);
  leftY = drawKeyValue(page, "Deadline", deadlineLabel(college), leftX, leftY, columnWidth, sans, sansBold);

  label(page, "TESTING + ENGLISH", rightX, sectionTop, sansBold);
  let rightY = sectionTop - 18;
  rightY = drawKeyValue(page, "Policy", college.testing?.policy.value ?? "Not listed", rightX, rightY, columnWidth, sans, sansBold);
  rightY = drawKeyValue(page, "SAT Math", scoreRange(college.testing?.satMathRange?.value), rightX, rightY, columnWidth, sans, sansBold);
  rightY = drawKeyValue(page, "SAT EBRW", scoreRange(college.testing?.satEbrwRange?.value), rightX, rightY, columnWidth, sans, sansBold);
  rightY = drawKeyValue(page, "English tests", englishLabel(college), rightX, rightY, columnWidth, sans, sansBold);
  y = Math.min(leftY, rightY) - 10;

  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.7, color: line });
  y -= 22;
  label(page, "SCHOLARSHIPS TO CHECK", margin, y, sansBold);
  y -= 17;
  const scholarships = college.scholarships?.slice(0, 3) ?? [];
  if (!scholarships.length) {
    page.drawText("No named scholarship is confirmed here. Check the official aid and scholarship pages.", { x: margin, y, font: sans, size: 9, color: muted });
    y -= 25;
  } else {
    for (const [index, scholarship] of scholarships.entries()) {
      const text = `${index + 1}. ${scholarship.name}${scholarship.amount ? ` — ${scholarship.amount}` : ""}`;
      page.drawText(ascii(truncate(text, 92)), { x: margin, y, font: sansBold, size: 9.2, color: navy });
      y -= 12;
      const note = [scholarship.requirements, scholarship.applicationMethod, scholarship.notes].filter(Boolean).join(" | ");
      const lines = wrapText(note || "Eligibility and application route require official verification.", sans, 7.7, pageWidth - margin * 2 - 12, 2);
      y = drawLines(page, lines, { x: margin + 12, y, font: sans, size: 7.7, color: muted, lineHeight: 9.5 }) - 8;
    }
  }

  const footerTop = 120;
  page.drawRectangle({ x: margin, y: footerTop, width: pageWidth - margin * 2, height: 66, color: white, borderColor: line, borderWidth: 0.8 });
  label(page, "BANGLADESH APPLICANT — NEXT STEP", margin + 14, footerTop + 48, sansBold);
  const nextStep = "Confirm how the college wants SSC/HSC or O/A Level transcripts, predicted grades, English-test evidence, and financial-aid documents submitted.";
  drawLines(page, wrapText(nextStep, sans, 9, pageWidth - margin * 2 - 28, 2), { x: margin + 14, y: footerTop + 30, font: sans, size: 9, color: ink, lineHeight: 11 });

  page.drawText(ascii(`Information checked ${college.officialReview?.reviewedAt ?? college.datasetReviewedAt ?? college.lastVerifiedAt}  |  Confirmed = official source  |  Not published = the college has not published it`), { x: margin, y: 82, font: sans, size: 6.8, color: muted });
  page.drawText(ascii(`Open the live profile: https://www.bd2us.app/colleges/${college.slug}`), { x: margin, y: 66, font: sansBold, size: 7.2, color: forest });
  page.drawText("Rankings are context, never an admission recommendation or personal probability.", { x: margin, y: 50, font: sans, size: 6.8, color: muted });
  page.drawText("BD2US  |  Bangladesh to U.S. admissions field guide", { x: margin, y: 27, font: sansBold, size: 7.2, color: amber });
  page.drawText("1 / 1", { x: pageWidth - margin - 18, y: 27, font: sans, size: 7.2, color: muted });

  return document.save();
}

function drawRankingStamp(page: PDFPage, college: College, font: PDFFont, bold: PDFFont) {
  const ranking = college.rankings?.[0];
  const x = pageWidth - margin - 104;
  const y = pageHeight - 111;
  page.drawRectangle({ x, y, width: 104, height: 55, borderColor: rgb(0.42, 0.63, 0.55), borderWidth: 0.8 });
  const primary = ranking?.globalRank ?? ranking?.nationalRank;
  page.drawText(primary == null ? "UNRANKED" : `${ranking?.tied ? "=" : "#"}${primary}`, { x: x + 10, y: y + 27, font: bold, size: primary == null ? 11 : 21, color: white });
  page.drawText(ascii(ranking ? ranking.system.startsWith("QS") ? `QS GLOBAL ${ranking.edition}` : `U.S. NEWS LAC ${ranking.edition}` : "NO APPLICABLE SNAPSHOT"), { x: x + 10, y: y + 13, font, size: 6.5, color: rgb(0.75, 0.91, 0.84) });
}

function drawFactGrid(page: PDFPage, facts: string[][], top: number, font: PDFFont, bold: PDFFont) {
  const width = pageWidth - margin * 2;
  const cellWidth = width / 3;
  const cellHeight = 50;
  facts.forEach(([name, value], index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const x = margin + column * cellWidth;
    const y = top - (row + 1) * cellHeight;
    page.drawRectangle({ x, y, width: cellWidth, height: cellHeight, color: white, borderColor: line, borderWidth: 0.6 });
    page.drawText(ascii(name.toUpperCase()), { x: x + 10, y: y + 33, font: bold, size: 6.3, color: muted });
    page.drawText(ascii(truncate(value, 28)), { x: x + 10, y: y + 14, font: bold, size: 11.5, color: navy });
  });
  return top - 2 * cellHeight;
}

function drawKeyValue(page: PDFPage, key: string, value: string, x: number, y: number, width: number, font: PDFFont, bold: PDFFont) {
  page.drawText(ascii(key), { x, y, font: bold, size: 7.5, color: muted });
  const lines = wrapText(value, font, 8.5, width - 76, 2);
  drawLines(page, lines, { x: x + 74, y, font, size: 8.5, color: ink, lineHeight: 10 });
  return y - Math.max(17, lines.length * 10 + 5);
}

function drawLines(page: PDFPage, lines: string[], options: { x: number; y: number; font: PDFFont; size: number; color: ReturnType<typeof rgb>; lineHeight: number }) {
  lines.forEach((lineText, index) => page.drawText(ascii(lineText), { x: options.x, y: options.y - index * options.lineHeight, font: options.font, size: options.size, color: options.color }));
  return options.y - lines.length * options.lineHeight;
}
function label(page: PDFPage, value: string, x: number, y: number, font: PDFFont) { page.drawText(value, { x, y, font, size: 7, color: amber }); }
function wrapText(value: string, font: PDFFont, size: number, maxWidth: number, maxLines: number) {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) current = candidate;
    else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (words.join(" ") !== lines.join(" ") && lines.length) lines[lines.length - 1] = truncate(lines[lines.length - 1], Math.max(8, lines[lines.length - 1].length - 2));
  return lines;
}
function acceptanceLabel(college: College, audience: "overall" | "international") {
  const fact = audience === "overall" ? college.admissions?.overallAcceptanceRate : college.admissions?.internationalAcceptanceRate;
  if (fact?.value == null) return audience === "international" ? "Not published / not reviewed" : "Not listed";
  return `${percent(fact.value)}${fact.dataYear ? ` | data year ${fact.dataYear}` : ""}${fact.status === "calculated" ? " | calculated from official counts" : ""}`;
}
function applicationPlanLabel(college: College) {
  const reviewed = college.applicationRequirements?.plans.map((plan) => plan.code) ?? [];
  return [...new Set([...reviewed, ...college.applicationPlans])].join(", ") || "Not published here";
}
function deadlineLabel(college: College) {
  const deadline = college.deadlines?.find((item) => item.date.status === "reported" && item.date.value) ?? college.deadlines?.[0];
  if (!deadline) return "Fall 2027 not yet published here";
  if (deadline.date.status === "not_published") return "Fall 2027 not yet published";
  return `${deadline.plan}: ${deadline.date.value ?? "Not published"}${deadline.date.cycle && deadline.date.cycle !== "Fall 2027" ? ` (${deadline.date.cycle} reference)` : ""}`;
}
function englishLabel(college: College) {
  if (college.englishProficiency?.length) return college.englishProficiency.map((item) => `${item.test}${item.minimumScore.value != null ? ` ${item.minimumScore.value}+` : ""}`).join(", ");
  if (college.englishTests.length) return college.englishTests.join(", ");
  return "Not reviewed; verify accepted tests, minimums, and waivers";
}
function scoreRange(value: { low: number | null; high: number | null } | null | undefined) { return value?.low != null && value.high != null ? `${value.low}-${value.high}` : value?.low?.toString() ?? value?.high?.toString() ?? "Not listed"; }
function typeLabel(college: College) { return college.rankingCategory === "liberal-arts-college" ? "Liberal arts college" : college.rankingCategory === "university" ? "University" : college.type; }
function percent(value: number | null | undefined, missing = "Not listed") { return value == null ? missing : `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`; }
function money(value: number | null | undefined) { return value == null ? "Not listed" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }
function ascii(value: string) { return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/[^\x20-\x7E]/g, ""); }
function truncate(value: string, length: number) { return value.length <= length ? value : `${value.slice(0, Math.max(1, length - 3)).trim()}...`; }
function safeFilename(value: string) { return ascii(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "college"; }
function documentElement(tag: "a") { return window.document.createElement(tag); }
