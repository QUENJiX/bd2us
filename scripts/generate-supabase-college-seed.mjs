import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalog = JSON.parse(readFileSync(resolve(root, "lib/college-catalog.generated.json"), "utf8"));
const ledger = JSON.parse(readFileSync(resolve(root, "data/college-official-reviews.json"), "utf8"));
const outputPath = resolve(root, "supabase/seeds/colleges.generated.sql");
const reviewByName = new Map(ledger.records.map((record) => [record.name, record]));

if (catalog.colleges.length !== 678 || ledger.records.length !== 678) throw new Error("College catalog and official-review ledger must both contain 678 colleges.");

const collegeRows = catalog.colleges.map((college) => ({
  slug: college.slug,
  name: college.name,
  short_name: college.shortName,
  aliases: college.aliases ?? [],
  location: college.location,
  city: college.city ?? null,
  state: college.state ?? null,
  region: college.region ?? null,
  institution_type: college.type,
  ranking_category: college.rankingCategory ?? "other",
  institution_control: college.control ?? null,
  campus_setting: college.setting ?? null,
  enrollment_band: college.enrollmentBand ?? null,
  aid_policy: college.aidPolicy,
  meets_full_need: college.meetsFullNeed,
  merit_aid: college.meritAid,
  cost_of_attendance: college.costOfAttendance ?? null,
  acceptance_rate: college.acceptanceRate ?? null,
  international_aid_percent: college.internationalAidPercent ?? null,
  average_international_aid: college.averageInternationalAid ?? null,
  special_note: college.specialNote ?? null,
  source_scope: "Information checked against the linked official sources; changing policies still require cycle confirmation.",
  original_description: college.originalDescription ?? college.summary,
  dataset_reviewed_at: college.datasetReviewedAt ?? catalog.generatedAt,
  research_highlight_override: college.researchHighlightOverride ?? null,
  official_review_status: "reviewed",
  official_reviewed_at: college.officialReview?.reviewedAt ?? catalog.generatedAt,
  summary: college.summary,
  status: "published",
  last_verified_at: college.lastVerifiedAt
}));

const factKeys = ["admissions", "testing", "englishProficiency", "scholarships", "rankings", "researchHighlights", "applicationRequirements", "deadlines", "campusContext"];
const factRows = catalog.colleges.flatMap((college) => factKeys
  .filter((key) => college[key] !== undefined)
  .map((key) => ({
    slug: college.slug,
    fact_key: key,
    fact_value: college[key],
    fact_status: sectionStatus(college[key]),
    last_verified_at: college.lastVerifiedAt
  })));

const sourceRows = catalog.colleges.flatMap((college) => {
  const review = reviewByName.get(college.name);
  const sources = Object.values(review?.fields ?? {}).flatMap((field) => field.sources ?? []);
  return [...new Map(sources.filter((source) => /^https:\/\//i.test(source.url)).map((source) => [source.url, {
    slug: college.slug,
    label: source.label || "Official college source",
    url: source.url,
    last_verified_at: source.reviewedAt || catalog.generatedAt,
    source_scope: "official"
  }])).values()];
});

const aliasRows = catalog.colleges.flatMap((college) => (college.slugAliases ?? []).map((alias) => ({ slug: college.slug, alias })));

const sql = `-- Generated deterministically by scripts/generate-supabase-college-seed.mjs.
-- Upserts by stable slug and fact key; existing college UUIDs are never replaced.

begin;

with input as (
  select * from jsonb_to_recordset(${jsonLiteral(collegeRows)}) as x(
    slug text, name text, short_name text, aliases jsonb, location text, city text, state text, region text,
    institution_type text, ranking_category text, institution_control text, campus_setting text,
    enrollment_band text, aid_policy text, meets_full_need boolean, merit_aid boolean,
    cost_of_attendance integer, acceptance_rate numeric, international_aid_percent numeric,
    average_international_aid integer, special_note text, source_scope text, original_description text,
    dataset_reviewed_at date, research_highlight_override text, official_review_status text,
    official_reviewed_at date, summary text, status public.review_status, last_verified_at date
  )
)
insert into public.colleges (
  slug, name, short_name, aliases, location, city, state, region, institution_type, ranking_category,
  institution_control, campus_setting, enrollment_band, aid_policy, meets_full_need, merit_aid,
  cost_of_attendance, acceptance_rate, international_aid_percent, average_international_aid,
  special_note, source_scope, original_description, dataset_reviewed_at, research_highlight_override,
  official_review_status, official_reviewed_at, summary, status, last_verified_at
)
select slug, name, short_name, array(select jsonb_array_elements_text(aliases)), location, city, state, region,
  institution_type, ranking_category, institution_control, campus_setting, enrollment_band, aid_policy,
  meets_full_need, merit_aid, cost_of_attendance, acceptance_rate, international_aid_percent,
  average_international_aid, special_note, source_scope, original_description, dataset_reviewed_at,
  research_highlight_override, official_review_status, official_reviewed_at, summary, status, last_verified_at
from input
on conflict (slug) do update set
  name = excluded.name, short_name = excluded.short_name, aliases = excluded.aliases,
  location = excluded.location, city = excluded.city, state = excluded.state, region = excluded.region,
  institution_type = excluded.institution_type, ranking_category = excluded.ranking_category,
  institution_control = excluded.institution_control, campus_setting = excluded.campus_setting,
  enrollment_band = excluded.enrollment_band, aid_policy = excluded.aid_policy,
  meets_full_need = excluded.meets_full_need, merit_aid = excluded.merit_aid,
  cost_of_attendance = excluded.cost_of_attendance, acceptance_rate = excluded.acceptance_rate,
  international_aid_percent = excluded.international_aid_percent,
  average_international_aid = excluded.average_international_aid, special_note = excluded.special_note,
  source_scope = excluded.source_scope, original_description = excluded.original_description,
  dataset_reviewed_at = excluded.dataset_reviewed_at,
  research_highlight_override = excluded.research_highlight_override,
  official_review_status = excluded.official_review_status, official_reviewed_at = excluded.official_reviewed_at,
  summary = excluded.summary, status = excluded.status, last_verified_at = excluded.last_verified_at,
  updated_at = now();

with input as (
  select * from jsonb_to_recordset(${jsonLiteral(factRows)}) as x(
    slug text, fact_key text, fact_value jsonb, fact_status text, last_verified_at date
  )
)
insert into public.college_facts (college_id, fact_key, fact_value, status, fact_status, last_verified_at)
select colleges.id, input.fact_key, input.fact_value, 'published', input.fact_status, input.last_verified_at
from input join public.colleges on colleges.slug = input.slug
on conflict (college_id, fact_key) do update set
  fact_value = excluded.fact_value, status = excluded.status, fact_status = excluded.fact_status,
  last_verified_at = excluded.last_verified_at;

with input as (
  select * from jsonb_to_recordset(${jsonLiteral(sourceRows)}) as x(
    slug text, label text, url text, last_verified_at date, source_scope text
  )
)
insert into public.college_sources (college_id, label, url, last_verified_at, source_scope)
select colleges.id, input.label, input.url, input.last_verified_at, input.source_scope
from input join public.colleges on colleges.slug = input.slug
on conflict (college_id, url) do update set
  label = excluded.label, last_verified_at = excluded.last_verified_at, source_scope = excluded.source_scope;

with input as (
  select * from jsonb_to_recordset(${jsonLiteral(aliasRows)}) as x(slug text, alias text)
)
insert into public.college_slug_aliases (alias, college_id)
select input.alias, colleges.id from input join public.colleges on colleges.slug = input.slug
on conflict (alias) do update set college_id = excluded.college_id;

commit;
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, sql);
console.log(`Generated Supabase seed for ${collegeRows.length} colleges, ${factRows.length} facts, ${sourceRows.length} official sources, and ${aliasRows.length} slug aliases.`);

function jsonLiteral(value) {
  return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
}

function sectionStatus(value) {
  const statuses = [];
  visit(value, (candidate) => {
    if (candidate && typeof candidate === "object" && typeof candidate.status === "string" && "value" in candidate) statuses.push(candidate.status);
  });
  if (statuses.some((status) => status === "reported" || status === "calculated")) return "reported";
  if (statuses.some((status) => status === "previous_cycle")) return "previous_cycle";
  if (statuses.length && statuses.every((status) => status === "not_published")) return "not_published";
  return "unreviewed";
}

function visit(value, callback) {
  if (!value || typeof value !== "object") return;
  callback(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) visit(child, callback);
}
