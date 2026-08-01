import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function loadTypeScriptModule(relativePath) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const loadedModule = { exports: {} };
  new Function("exports", "module", output)(loadedModule.exports, loadedModule);
  return loadedModule.exports;
}

const { guideEnhancements } = loadTypeScriptModule("../lib/guide-enhancements.ts");
const { glossary } = loadTypeScriptModule("../lib/glossary.ts");
const { guideSources } = loadTypeScriptModule("../lib/guide-content.ts");
const expectedGuides = ["orientation", "timeline", "college-research", "academics", "standardized-testing", "activities", "essays", "application-platforms", "financial-aid", "decisions", "visa", "arrival"];

test("all 12 chapters include progressive, Bangladesh-specific guidance", () => {
  assert.deepEqual(Object.keys(guideEnhancements), expectedGuides);
  for (const slug of expectedGuides) {
    const chapter = guideEnhancements[slug];
    assert.ok(chapter.beginner.length > 80, `${slug} needs a substantial beginner overview`);
    assert.ok(chapter.vocabulary.length >= 1, `${slug} needs vocabulary`);
    assert.ok(chapter.deeper.length >= 2, `${slug} needs advanced nuance`);
    assert.ok(chapter.bangladesh.length > 80, `${slug} needs Bangladesh context`);
    assert.ok(chapter.communityInsight.length > 60, `${slug} needs labeled community perspective`);
    assert.ok(chapter.mistakes.length >= 3, `${slug} needs common mistakes`);
    assert.ok(chapter.worksheetItems.length >= 4, `${slug} needs a reusable artifact`);
  }
});

test("every chapter has a dated official source trail", () => {
  for (const slug of expectedGuides) {
    assert.ok(guideSources[slug]?.length, `${slug} needs at least one source`);
    for (const source of guideSources[slug]) {
      assert.match(source.url, /^https:\/\//);
      assert.equal(source.lastVerifiedAt, "2026-08-01");
    }
  }
});

test("glossary covers required terms with Bangla explanations", () => {
  const terms = glossary.map((item) => item.term.toLowerCase());
  for (const expected of ["demonstrated need", "need-aware", "sai", "efc", "superscoring", "deferral", "waitlist", "i-20", "sevis", "nonresident alien"]) {
    assert.ok(terms.includes(expected), `missing glossary term: ${expected}`);
  }
  for (const item of glossary) {
    assert.ok(item.definition.length > 30);
    assert.match(item.bangla, /[\u0980-\u09ff]/);
  }
});

test("guidance avoids admissions-odds promises", () => {
  const text = JSON.stringify(guideEnhancements).toLowerCase();
  assert.doesNotMatch(text, /guaranteed admission|calculate your odds|personal admission probability/);
});
