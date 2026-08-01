import type { College, CollegeRanking as CollegeRankingFact } from "@/lib/types";

export type RankingGroup = "universities" | "liberal-arts" | "other" | "all";

export type CollegeRanking = CollegeRankingFact & {
  rank: number;
};

export function getCollegeRanking(college: College): CollegeRanking | null {
  const ranking = college.rankings?.find((item) =>
    college.rankingCategory === "liberal-arts-college"
      ? item.system === "U.S. News National Liberal Arts Colleges"
      : item.system === "QS World University Rankings"
  ) ?? college.rankings?.[0];
  if (!ranking) return null;
  const rank = ranking.globalRank ?? ranking.nationalRank;
  return rank == null ? null : { ...ranking, rank };
}

export function getRankingGroup(college: College): Exclude<RankingGroup, "all"> {
  if (college.rankingCategory === "liberal-arts-college" || college.type === "Liberal arts college") return "liberal-arts";
  if (college.rankingCategory === "university" || college.type === "University") return "universities";
  return "other";
}

export function rankingLabel(college: College) {
  const ranking = getCollegeRanking(college);
  if (!ranking) return getRankingGroup(college) === "liberal-arts" ? "No U.S. News LAC rank attached" : getRankingGroup(college) === "universities" ? "No QS rank attached" : "No applicable rank attached";
  if (ranking.system === "QS World University Rankings") {
    return `${ranking.tied ? "=" : "#"}${ranking.rank} global · #${ranking.countryPosition ?? "—"} U.S. (BD2US derived) · QS ${ranking.edition}`;
  }
  return `${ranking.tied ? "=" : "#"}${ranking.rank} · U.S. News liberal arts ${ranking.edition}`;
}

export function compareByRanking(left: College, right: College) {
  const leftGroup = getRankingGroup(left);
  const rightGroup = getRankingGroup(right);
  if (leftGroup !== rightGroup) return groupOrder(leftGroup) - groupOrder(rightGroup) || left.name.localeCompare(right.name);
  const leftRank = getCollegeRanking(left)?.rank ?? Number.POSITIVE_INFINITY;
  const rightRank = getCollegeRanking(right)?.rank ?? Number.POSITIVE_INFINITY;
  return leftRank - rightRank || left.name.localeCompare(right.name);
}

function groupOrder(group: Exclude<RankingGroup, "all">) {
  return group === "universities" ? 0 : group === "liberal-arts" ? 1 : 2;
}
