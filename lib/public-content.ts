import type { College, ContentBlock, GuideEntry, Source } from "@/lib/types";
import { colleges, getCollege, getGuide } from "@/lib/content";
import { getServiceSupabase } from "@/lib/supabase/server";

let collegeOverridesPromise: Promise<Map<string, Partial<College>>> | undefined;

export async function getPublishedGuide(slug: string): Promise<GuideEntry | undefined> {
  const baseline = getGuide(slug);
  if (!baseline) return undefined;
  const supabase = getServiceSupabase();
  if (!supabase) return baseline;
  const { data: entry } = await supabase
    .from("content_entries")
    .select("id,title,summary,body,last_verified_at,status")
    .eq("slug", slug)
    .eq("content_type", "guide")
    .eq("status", "published")
    .maybeSingle();
  if (!entry) return baseline;
  const { data: sourceRows } = await supabase.from("content_sources").select("label,url,last_verified_at").eq("content_entry_id", entry.id);
  const sources: Source[] = sourceRows?.map((item) => ({ label: item.label, url: item.url, lastVerifiedAt: item.last_verified_at })) ?? baseline.sources;
  return {
    ...baseline,
    title: entry.title,
    summary: entry.summary,
    blocks: validContentBlocks(entry.body) ? entry.body : baseline.blocks,
    lastVerifiedAt: entry.last_verified_at ?? baseline.lastVerifiedAt,
    sources,
    reviewStatus: "published"
  };
}

export async function getPublishedCollege(slug: string): Promise<College | undefined> {
  const baseline = getCollege(slug);
  if (!baseline) return undefined;
  const overrides = await getCollegeOverrides();
  return mergeCollegeOverride(baseline, overrides.get(slug));
}

export async function getPublishedColleges(): Promise<College[]> {
  const overrides = await getCollegeOverrides();
  return colleges.map((college) => mergeCollegeOverride(college, overrides.get(college.slug)));
}

async function getCollegeOverrides() {
  if (collegeOverridesPromise) return collegeOverridesPromise;
  collegeOverridesPromise = (async () => {
    const supabase = getServiceSupabase();
    const result = new Map<string, Partial<College>>();
    if (!supabase) return result;
    const { data } = await supabase.from("colleges").select("id,slug,name,short_name,aliases,location,city,state,region,institution_type,ranking_category,institution_control,campus_setting,enrollment_band,aid_policy,meets_full_need,merit_aid,cost_of_attendance,acceptance_rate,international_aid_percent,average_international_aid,special_note,source_scope,original_description,dataset_reviewed_at,research_highlight_override,official_review_status,official_reviewed_at,summary,last_verified_at,status").eq("status", "published");
    const slugById = new Map<string, string>();
    for (const row of data ?? []) {
      slugById.set(row.id, row.slug);
      result.set(row.slug, {
        name: row.name,
        shortName: row.short_name,
        aliases: row.aliases,
        location: row.location,
        city: row.city,
        state: row.state,
        region: row.region,
        type: row.institution_type as College["type"],
        rankingCategory: row.ranking_category as College["rankingCategory"],
        control: row.institution_control as College["control"],
        setting: row.campus_setting,
        enrollmentBand: row.enrollment_band,
        aidPolicy: row.aid_policy as College["aidPolicy"],
        meetsFullNeed: row.meets_full_need,
        meritAid: row.merit_aid,
        costOfAttendance: row.cost_of_attendance,
        acceptanceRate: row.acceptance_rate,
        internationalAidPercent: row.international_aid_percent,
        averageInternationalAid: row.average_international_aid,
        specialNote: row.special_note,
        sourceScope: row.source_scope ?? undefined,
        originalDescription: row.original_description ?? undefined,
        datasetReviewedAt: row.dataset_reviewed_at ?? undefined,
        researchHighlightOverride: row.research_highlight_override,
        ...(row.research_highlight_override ? { researchHighlights: [row.research_highlight_override] } : {}),
        officialReview: { status: row.official_review_status as NonNullable<College["officialReview"]>["status"], reviewedAt: row.official_reviewed_at, reviewerNote: null },
        summary: row.summary,
        ...(row.last_verified_at ? { lastVerifiedAt: row.last_verified_at } : {}),
        reviewStatus: "published"
      });
    }
    const collegeIds = [...slugById.keys()];
    if (collegeIds.length) {
      const { data: facts } = await supabase.from("college_facts").select("college_id,fact_key,fact_value,fact_status,data_year,cycle,last_verified_at").in("college_id", collegeIds).eq("status", "published");
      for (const fact of facts ?? []) {
        const slug = slugById.get(fact.college_id);
        if (!slug) continue;
        const current = result.get(slug) ?? {};
        applyFactOverride(current, fact.fact_key, fact.fact_value);
        result.set(slug, current);
      }
    }
    return result;
  })();
  return collegeOverridesPromise;
}

function validContentBlocks(value: unknown): value is ContentBlock[] {
  if (!Array.isArray(value)) return false;
  return value.every((block) => {
    if (!block || typeof block !== "object" || !("type" in block)) return false;
    const type = (block as { type?: unknown }).type;
    return ["paragraph", "heading", "html", "callout", "checklist", "list"].includes(String(type));
  });
}

function mergeCollegeOverride(baseline: College, override?: Partial<College>): College {
  if (!override) return baseline;
  return {
    ...baseline,
    ...override,
    admissions: override.admissions ? { ...baseline.admissions, ...override.admissions } as College["admissions"] : baseline.admissions,
    testing: override.testing ? { ...baseline.testing, ...override.testing } as College["testing"] : baseline.testing,
    aliases: override.aliases ?? baseline.aliases,
    scholarships: override.scholarships ?? baseline.scholarships,
    rankings: override.rankings ?? baseline.rankings,
    englishProficiency: override.englishProficiency ?? baseline.englishProficiency,
    researchHighlights: override.researchHighlights ?? baseline.researchHighlights
  };
}

function applyFactOverride(target: Partial<College>, factKey: string, value: unknown) {
  const directKeys = new Set(["admissions", "testing", "englishProficiency", "scholarships", "rankings", "researchHighlights"]);
  if (directKeys.has(factKey)) {
    (target as Record<string, unknown>)[factKey] = value;
    return;
  }
  const [section, field] = factKey.split(".");
  if (!field || !["admissions", "testing"].includes(section)) return;
  const record = ((target as Record<string, unknown>)[section] ?? {}) as Record<string, unknown>;
  record[field] = value;
  (target as Record<string, unknown>)[section] = record;
}
