import type { College, SearchResult, StudentProfile } from "@/lib/types";

export function expandedTerms(query: string): string[];
export function trigramSimilarity(left: string, right: string): number;
export function rankSearch(index: SearchResult[], query: string): Array<SearchResult & { score: number }>;
export function estimateBudget(input: {
  monthlyIncomeBdt?: number;
  savingsBdt?: number;
  assetsBdt?: number;
  exchangeRate?: number;
}): { planningAmount: number; band: string; disclaimer: string };
export function collegeFitReasons(college: College, profile: StudentProfile): string[];
export function isContentStale(input: {
  lastVerifiedAt: string;
  nextReviewAt?: string;
  today?: string;
  maxAgeDays?: number;
}): boolean;
