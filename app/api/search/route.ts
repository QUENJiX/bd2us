import { NextResponse } from "next/server";
import { localSearch, mergeSearchResults } from "@/lib/search";
import { getServiceSupabase } from "@/lib/supabase/server";
import type { SearchResult } from "@/lib/types";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const limit = clampNumber(params.get("limit"), 10, 1, 30);
  const offset = clampNumber(params.get("offset"), 0, 0, 200);
  const types = params.getAll("type").flatMap((value) => value.split(",")).map(normalizeResultType).filter(Boolean) as SearchResult["type"][];
  if (query.length < 2) return NextResponse.json({ results: [] });
  const supabase = getServiceSupabase();
  const localResults = localSearch(query, { types, limit, offset });
  if (supabase) {
    const { data } = await supabase.rpc("search_public_content", {
      search_query: query,
      search_types: types.length ? types.map(toDatabaseType) : undefined,
      result_limit: limit,
      result_offset: offset
    });
    if (data?.length) {
      const remoteResults = data.map((item) => ({
        type: normalizeResultType(item.content_type) ?? "Guide",
        title: item.title,
        summary: item.summary,
        href: item.href,
        keywords: []
      }));
      const results = mergeSearchResults(remoteResults, localResults, limit, query);
      return NextResponse.json({
        results
      });
    }
  }
  return NextResponse.json({ results: localResults });
}

function normalizeResultType(value: string): SearchResult["type"] | undefined {
  const normalized = String(value).trim().toLowerCase().replace(/s$/, "");
  return ({ guide: "Guide", blog: "Blog", task: "Task", college: "College", glossary: "Glossary", faq: "FAQ", resource: "Resource" } as const)[normalized];
}

function toDatabaseType(type: SearchResult["type"]) {
  if (type === "College") return "colleges";
  if (type === "Task") return "tasks";
  return type.toLowerCase();
}

function clampNumber(value: string | null, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, Math.floor(parsed))) : fallback;
}
