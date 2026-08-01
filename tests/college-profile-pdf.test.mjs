import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import ts from "typescript";

function loadTypeScriptModule(relativePath) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const loadedModule = { exports: {} };
  new Function("exports", "module", "require", output)(loadedModule.exports, loadedModule, (name) => {
    if (name === "pdf-lib") return requirePdfLib;
    throw new Error(`Unexpected test import: ${name}`);
  });
  return loadedModule.exports;
}

const requirePdfLib = await import("pdf-lib");
const catalog = JSON.parse(readFileSync(new URL("../lib/college-catalog.generated.json", import.meta.url), "utf8")).colleges;
const { createCollegeProfilePdf } = loadTypeScriptModule("../lib/college-profile-pdf.ts");

for (const fixture of [
  catalog.find((college) => college.shortName === "MIT"),
  catalog.find((college) => college.slug === "alabama-a-and-m-university"),
  {
    ...catalog.find((college) => college.name === "Adelphi University"),
    scholarships: Array.from({ length: 8 }, (_, index) => ({ name: `Very long scholarship ${index + 1}`, amount: "$50,000 renewable", applicationMethod: "Separate application with a long eligibility statement and multiple supporting documents.", requirements: "International first-year applicants with sustained academic work and community contribution.", notes: "Long workbook note ".repeat(30) }))
  }
]) {
  test(`college profile PDF stays on one A4 page for ${fixture.name}`, async () => {
    const bytes = await createCollegeProfilePdf(fixture);
    const pdf = await PDFDocument.load(bytes);
    assert.equal(pdf.getPageCount(), 1);
    const { width, height } = pdf.getPage(0).getSize();
    assert.ok(Math.abs(width - 595.28) < 0.1);
    assert.ok(Math.abs(height - 841.89) < 0.1);
  });
}
