import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const government = JSON.parse(readFileSync(resolve(root, "data/college-government-facts.json"), "utf8"));
const catalog = JSON.parse(readFileSync(resolve(root, "lib/college-catalog.generated.json"), "utf8")).colleges;
const outputPath = resolve(root, "data/college-official-page-index.json");
const previous = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, "utf8")) : { records: [] };
const previousBySlug = new Map(previous.records.map((record) => [record.slug, record]));
const governmentByName = new Map(government.records.map((record) => [record.name, record]));
const args = parseArgs(process.argv.slice(2));
const topicPatterns = {
  internationalAid: [/international (?:student|applicant)s?.{0,80}(?:financial aid|scholarship)/i, /(?:financial aid|need[- ]based aid).{0,80}international/i, /css profile/i],
  scholarships: [/scholarships?/i, /merit[- ]based (?:aid|award)/i, /full tuition|full ride/i],
  internationalAdmission: [/international (?:admission|applicant|student)/i, /foreign credential|international transcript/i],
  applicationPlansAndDeadlines: [/early decision|early action|restrictive early action|single[- ]choice early action/i, /regular decision|rolling admission|priority deadline/i, /application deadline/i],
  applicationRequirements: [/application requirements?|required materials?/i, /recommendation|school report|midyear report/i, /common application|coalition application/i],
  testingPolicy: [/test[- ]optional|test[- ]required|test[- ]flexible/i, /\bSAT\b.{0,40}\bACT\b|\bACT\b.{0,40}\bSAT\b/i, /superscor/i],
  englishProficiency: [/english (?:language )?proficiency/i, /toefl|ielts|duolingo english test/i, /cambridge english/i],
  climate: [/average temperatures?|weather averages?|coldest month|warmest month/i]
};
const topicNames = Object.keys(topicPatterns);
const selected = args.retryLow === null && args.retryPagesUnder === null
  ? catalog.slice(args.start, args.start + args.limit)
  : catalog.filter((college) => {
      const review = previousBySlug.get(college.slug);
      return (args.retryLow !== null && (review?.topicsFound?.length ?? -1) <= args.retryLow)
        || (args.retryPagesUnder !== null && (review?.pages?.length ?? 0) < args.retryPagesUnder);
    }).slice(args.start, args.start + args.limit);
const records = [...previous.records];
const recordIndex = new Map(records.map((record, index) => [record.slug, index]));

console.log(`Reviewing official pages for ${selected.length} colleges from catalog position ${args.start + 1}.`);
await runPool(selected, args.concurrency, async (college, offset) => {
  if (!args.refresh && previousBySlug.get(college.slug)?.reviewStatus === "pages_checked") {
    console.log(`[${args.start + offset + 1}/${catalog.length}] ${college.name}: already checked`);
    return;
  }
  const official = governmentByName.get(college.name);
  const attempted = await reviewCollege(college, official?.officialLinks ?? {});
  const existing = previousBySlug.get(college.slug);
  const result = existing && reviewScore(existing) > reviewScore(attempted) ? existing : attempted;
  const index = recordIndex.get(college.slug);
  if (index === undefined) {
    recordIndex.set(college.slug, records.length);
    records.push(result);
  } else records[index] = result;
  writeOutput(records);
  console.log(`[${args.start + offset + 1}/${catalog.length}] ${college.name}: ${result.pages.length} pages, ${result.topicsFound.length} topics`);
});
writeOutput(records);
console.log(`Saved ${records.length} resumable official-site reviews to data/college-official-page-index.json.`);

async function reviewCollege(college, links) {
  const allowedDomains = new Set([registrableDomain(links.homepage), registrableDomain(links.admissions), registrableDomain(links.financialAid)].filter(Boolean));
  const seedUrls = unique([links.homepage, links.admissions, links.financialAid, isAllowed(links.application, allowedDomains) ? links.application : null]);
  const pages = [];
  const discovered = [];
  for (const url of seedUrls) {
    const page = await fetchPage(url);
    if (!page) continue;
    pages.push(compactPage(page));
    for (const link of page.links) if (isAllowed(link.url, allowedDomains)) discovered.push({ ...link, score: linkScore(link) });
  }
  discovered.push(...await discoverSitemapLinks(seedUrls, allowedDomains));
  if (pages.length < 8) discovered.push(...await discoverSearchLinks(college.name, allowedDomains));
  for (const link of uniqueBy(discovered.filter((link) => link.score > 0).sort((a, b) => b.score - a.score), (item) => item.url).slice(0, args.maxPages - pages.length)) {
    const page = await fetchPage(link.url);
    if (page) pages.push(compactPage(page));
  }
  const uniquePages = uniqueBy(pages, (page) => page.url);
  const topicsFound = topicNames.filter((topic) => uniquePages.some((page) => page.topics.includes(topic)));
  return {
    slug: college.slug,
    name: college.name,
    reviewStatus: seedUrls.length ? "pages_checked" : "no_official_site_link",
    reviewedAt: new Date().toISOString(),
    officialDomains: [...allowedDomains],
    seedUrls,
    topicsFound,
    pages: uniquePages
  };
}

async function fetchPage(input) {
  if (!input) return null;
  let url;
  try { url = new URL(input.startsWith("http") ? input : `https://${input}`); } catch { return null; }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeout);
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal, headers: browserHeaders("text/html,application/xhtml+xml") });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
    const html = (await response.text()).slice(0, 3_000_000);
    const finalUrl = response.url;
    const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "Official college page").slice(0, 180);
    const text = cleanText(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
    return { url: finalUrl, title, text, links: extractLinks(html, finalUrl) };
  } catch { return null; } finally { clearTimeout(timer); }
}

async function discoverSitemapLinks(seedUrls, allowedDomains) {
  const candidates = [];
  for (const origin of unique(seedUrls.map((value) => { try { return new URL(value).origin; } catch { return null; } }))) {
    const first = await fetchXml(`${origin}/sitemap.xml`);
    if (!first) continue;
    let locations = sitemapLocations(first);
    const childMaps = locations.filter((url) => /\.xml(?:\?|$)/i.test(url) && !/image|video|news/i.test(url)).slice(0, 8);
    locations = locations.filter((url) => !/\.xml(?:\?|$)/i.test(url));
    for (const child of childMaps) {
      const xml = await fetchXml(child);
      if (xml) locations.push(...sitemapLocations(xml));
    }
    for (const url of unique(locations)) {
      if (!isAllowed(url, allowedDomains)) continue;
      const link = { url, text: "" };
      const score = linkScore(link);
      if (score > 0) candidates.push({ ...link, score: score + 4 });
    }
  }
  return candidates.sort((a, b) => b.score - a.score).slice(0, 120);
}

async function discoverSearchLinks(collegeName, allowedDomains) {
  const domain = [...allowedDomains][0];
  if (!domain) return [];
  const query = `site:${domain} "${collegeName}" undergraduate admission international financial aid scholarships deadlines testing English proficiency`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(args.timeout, 15000));
  try {
    const response = await fetch(`https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`, { signal: controller.signal, headers: browserHeaders("text/html") });
    if (!response.ok) return [];
    const html = await response.text();
    return uniqueBy(extractLinks(html, "https://search.brave.com/")
      .filter((link) => isAllowed(link.url, allowedDomains))
      .map((link) => ({ ...link, score: linkScore(link) + 8 }))
      .filter((link) => link.score > 8)
      .sort((a, b) => b.score - a.score), (link) => link.url).slice(0, 120);
  } catch { return []; } finally { clearTimeout(timer); }
}

async function fetchXml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(args.timeout, 12000));
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal, headers: browserHeaders("application/xml,text/xml,text/plain") });
    if (!response.ok) return null;
    return (await response.text()).slice(0, 5_000_000);
  } catch { return null; } finally { clearTimeout(timer); }
}

function sitemapLocations(xml) { return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => decodeEntities(match[1].trim())); }

function compactPage(page) {
  const topics = topicNames.filter((topic) => topicPatterns[topic].some((pattern) => pattern.test(page.text)));
  return { url: page.url, title: page.title, topics, evidence: Object.fromEntries(topics.map((topic) => [topic, evidenceFor(page.text, topicPatterns[topic])])) };
}

function evidenceFor(text, patterns) {
  const excerpts = [];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    pattern.lastIndex = 0;
    if (!match) continue;
    const start = Math.max(0, match.index - 180);
    const end = Math.min(text.length, match.index + match[0].length + 420);
    const excerpt = text.slice(start, end).replace(/^\S*\s/, "").replace(/\s\S*$/, "").trim();
    if (excerpt && !excerpts.some((item) => item.includes(excerpt) || excerpt.includes(item))) excerpts.push(excerpt.slice(0, 320));
    if (excerpts.length === 1) break;
  }
  return excerpts;
}

function extractLinks(html, base) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(decodeEntities(match[1]), base);
      if (!/^https?:$/.test(url.protocol)) continue;
      url.hash = "";
      links.push({ url: url.toString(), text: cleanText(match[2]).slice(0, 160) });
    } catch {}
  }
  return links;
}

function linkScore(link) {
  const value = `${link.text} ${link.url}`.toLowerCase();
  const positive = [
    /international.{0,20}(admission|applicant|student)/,
    /deadline|early[- ]decision|early[- ]action|regular[- ]decision|rolling/,
    /english.{0,20}(proficiency|language)|toefl|ielts|duolingo/,
    /test[- ]optional|standardized.{0,10}test|sat.{0,10}act/,
    /scholarship|financial[- ]aid|cost[- ]of[- ]attendance/,
    /first[- ]year.{0,20}(requirement|apply)|application.{0,15}requirement/,
    /common[- ]data[- ]set|\bcds\b/,
    /first[- ]year|undergraduate[- /]admission|how[- ]to[- ]apply|apply[- /]to/
  ].reduce((score, pattern, index) => score + (pattern.test(value) ? 20 - index : 0), 0);
  const penalty = /faculty|graduate|current[- ]student|satisfactory[- ]academic[- ]progress|appeal|research|student[- ]activities/.test(value) ? 35 : 0;
  return positive - penalty;
}

function isAllowed(value, domains) { return Boolean(value && domains.has(registrableDomain(value))); }
function registrableDomain(value) {
  if (!value) return null;
  try {
    const parts = new URL(value.startsWith("http") ? value : `https://${value}`).hostname.replace(/^www\./, "").split(".");
    return parts.slice(-2).join(".");
  } catch { return null; }
}
function cleanText(value) { return decodeEntities(String(value)).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }
function decodeEntities(value) { return String(value).replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#0*39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function reviewScore(review) { return (review.topicsFound?.length ?? 0) * 100 + (review.pages?.length ?? 0); }
function browserHeaders(accept) { return { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36 BD2US-Research/1.0", "accept-language": "en-US,en;q=0.8", accept }; }
function uniqueBy(values, key) { const seen = new Set(); return values.filter((value) => { const id = key(value); if (seen.has(id)) return false; seen.add(id); return true; }); }
async function runPool(items, concurrency, worker) { let cursor = 0; await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => { while (cursor < items.length) { const index = cursor++; await worker(items[index], index); } })); }
function writeOutput(nextRecords) {
  const body = `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), sourcePolicy: "Official college domains discovered from U.S. Department of Education links; compact excerpts retained for editorial verification.", count: nextRecords.length, records: nextRecords.sort((a, b) => a.name.localeCompare(b.name)) }, null, 2)}\n`;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try { writeFileSync(outputPath, body); return; }
    catch (error) {
      if (attempt === 8) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 40);
    }
  }
}
function parseArgs(values) {
  const get = (name, fallback) => { const found = values.find((value) => value.startsWith(`--${name}=`)); return found ? Number(found.split("=")[1]) : fallback; };
  const retry = values.find((value) => value.startsWith("--retry-low="));
  const retryPages = values.find((value) => value.startsWith("--retry-pages-under="));
  return { start: Math.max(0, get("start", 0)), limit: Math.max(1, get("limit", 10)), concurrency: Math.max(1, Math.min(12, get("concurrency", 4))), maxPages: Math.max(3, Math.min(16, get("max-pages", 10))), timeout: Math.max(5000, get("timeout", 18000)), refresh: values.includes("--refresh") || Boolean(retry) || Boolean(retryPages), retryLow: retry ? Number(retry.split("=")[1]) : null, retryPagesUnder: retryPages ? Number(retryPages.split("=")[1]) : null };
}
