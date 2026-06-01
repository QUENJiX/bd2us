import { searchIndex } from "@/lib/content";
import { rankSearch } from "@/lib/domain.mjs";
import type { SearchResult } from "@/lib/types";

type SearchOptions = {
  types?: string[];
  limit?: number;
  offset?: number;
};

export function localSearch(query: string, { types = [], limit = 10, offset = 0 }: SearchOptions = {}) {
  const allowedTypes = new Set(types.map((type) => type.toLowerCase()));
  const ranked = rankSearch(searchIndex, query).filter((result: SearchResult) => !allowedTypes.size || allowedTypes.has(result.type.toLowerCase()));
  return ranked.slice(offset, offset + limit);
}

export function mergeSearchResults(primary: SearchResult[], secondary: SearchResult[], limit = 10, query?: string) {
  const merged = [...secondary, ...primary];
  const deduplicated = [...new Map(merged.map((result) => [`${result.type}|${result.href}|${result.title}`, result])).values()];
  return (query ? rankSearch(deduplicated, query) : deduplicated).slice(0, limit);
}
