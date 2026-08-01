import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ledger = JSON.parse(readFileSync(resolve(root, "data/college-official-reviews.json"), "utf8"));
const allowedOutcomes = new Set(["reported", "calculated", "not_published", "previous_cycle"]);
const problems = [];

if (ledger.count !== 678 || ledger.records.length !== 678) problems.push(`Expected 678 review entries; found ${ledger.records.length}.`);
if (new Set(ledger.records.map((record) => record.slug)).size !== 678) problems.push("Review slugs are not unique.");

for (const record of ledger.records) {
  for (const fieldName of ledger.requiredFields) {
    const field = record.fields[fieldName];
    if (!field || !allowedOutcomes.has(field.status)) problems.push(`${record.slug}: ${fieldName} is not complete.`);
    if (field && allowedOutcomes.has(field.status) && (!field.reviewedAt || !field.sources?.length)) problems.push(`${record.slug}: ${fieldName} lacks review metadata or an official source.`);
  }
}

if (problems.length) {
  console.error(`College launch gate blocked by ${problems.length} incomplete checks.`);
  for (const problem of problems.slice(0, 25)) console.error(`- ${problem}`);
  if (problems.length > 25) console.error(`- …and ${problems.length - 25} more.`);
  process.exit(1);
}

console.log("College launch gate passed for all 678 colleges.");
