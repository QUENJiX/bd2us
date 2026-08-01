import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = JSON.parse(readFileSync(resolve(root, "data/college-government-facts.json"), "utf8"));
const outputPath = resolve(root, "data/college-climate-facts.json");
const previousRaw = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, "utf8")) : { records: [] };
const previous = {
  ...previousRaw,
  records: previousRaw.records.map((sourceRecord) => {
    const record = Object.fromEntries(Object.entries(sourceRecord).filter(([key]) => !["coldestAverageLowCelsius", "warmestAverageHighCelsius"].includes(key)));
    return { ...record, sourceUrl: record.sourceUrl?.replace("T2M%2CT2M_MAX%2CT2M_MIN", "T2M") };
  })
};
const previousById = new Map(previous.records.map((record) => [record.ipedsId, record]));
const args = parseArgs(process.argv.slice(2));
const selected = source.records.slice(args.start, args.start + args.limit);
const records = [...previous.records];
const indexById = new Map(records.map((record, index) => [record.ipedsId, index]));

await runPool(selected, args.concurrency, async (college, offset) => {
  if (!args.refresh && previousById.get(college.ipedsId)?.status === "reported") return;
  const result = await fetchClimate(college);
  const index = indexById.get(college.ipedsId);
  if (index === undefined) { indexById.set(college.ipedsId, records.length); records.push(result); }
  else records[index] = result;
  safeWrite(records);
  console.log(`[${args.start + offset + 1}/${source.records.length}] ${college.name}: ${result.status}`);
});
safeWrite(records);

async function fetchClimate(college) {
  const { latitude, longitude } = college.identity;
  if (latitude == null || longitude == null) return base(college, "unreviewed", "Official coordinates were unavailable.");
  const url = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
  url.search = new URLSearchParams({ parameters: "T2M", community: "RE", longitude: String(longitude), latitude: String(latitude), format: "JSON" }).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeout);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "user-agent": "BD2US-Research/1.0 (+https://www.bd2us.app/about)", accept: "application/json" } });
    if (!response.ok) return base(college, "unreviewed", `NASA POWER returned HTTP ${response.status}; retry required.`);
    const payload = await response.json();
    const average = payload.properties?.parameter?.T2M;
    if (!average) return base(college, "unreviewed", "NASA POWER did not return monthly temperature values; retry required.");
    const months = Object.keys(average).filter((month) => month !== "ANN" && Number.isFinite(average[month]) && average[month] > -900);
    const coldestMonth = months.reduce((best, month) => average[month] < average[best] ? month : best, months[0]);
    const warmestMonth = months.reduce((best, month) => average[month] > average[best] ? month : best, months[0]);
    return {
      ...base(college, "reported", "Long-term monthly temperature context from NASA POWER."),
      latitude,
      longitude,
      climatologyPeriod: payload.header?.title?.match(/Climatology:\s*([^)]*)/i)?.[1]?.trim() ?? "NASA POWER climatology",
      annualAverageCelsius: round(average.ANN),
      coldestMonth: monthName(coldestMonth),
      warmestMonth: monthName(warmestMonth),
      sourceUrl: url.toString()
    };
  } catch (error) { return base(college, "unreviewed", `${error.name ?? "Request"} error; retry required.`); }
  finally { clearTimeout(timer); }
}

function base(college, status, note) { return { name: college.name, ipedsId: college.ipedsId, status, reviewedAt: new Date().toISOString().slice(0, 10), sourceLabel: "NASA POWER Climatology", sourcePage: "https://power.larc.nasa.gov/", note }; }
function round(value) { return Number.isFinite(value) && value > -900 ? Math.round(value * 10) / 10 : null; }
function monthName(value) { return ({ JAN: "January", FEB: "February", MAR: "March", APR: "April", MAY: "May", JUN: "June", JUL: "July", AUG: "August", SEP: "September", OCT: "October", NOV: "November", DEC: "December" })[value] ?? null; }
function safeWrite(nextRecords) {
  const body = `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), officialSource: "NASA POWER Climatology API", count: nextRecords.length, records: nextRecords.sort((a, b) => a.name.localeCompare(b.name)) }, null, 2)}\n`;
  for (let attempt = 1; attempt <= 8; attempt += 1) { try { writeFileSync(outputPath, body); return; } catch (error) { if (attempt === 8) throw error; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 40); } }
}
async function runPool(items, concurrency, worker) { let cursor = 0; await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => { while (cursor < items.length) { const index = cursor++; await worker(items[index], index); } })); }
function parseArgs(values) { const get = (name, fallback) => { const found = values.find((value) => value.startsWith(`--${name}=`)); return found ? Number(found.split("=")[1]) : fallback; }; return { start: Math.max(0, get("start", 0)), limit: Math.max(1, get("limit", 678)), concurrency: Math.max(1, Math.min(12, get("concurrency", 6))), timeout: Math.max(5000, get("timeout", 20000)), refresh: values.includes("--refresh") }; }
