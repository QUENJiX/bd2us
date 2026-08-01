declare module "@/lib/college-search.mjs" {
  import type { College } from "@/lib/types";

  export function collegeSearchScore(college: College, query: string): number;
  export function searchColleges(
    colleges: College[],
    query: string,
    tieBreaker?: (left: College, right: College) => number
  ): College[];
}
