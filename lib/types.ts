export type ReviewStatus = "draft" | "in_review" | "published" | "stale";
export type FactStatus = "reported" | "calculated" | "not_published" | "unreviewed";
export type AidPolicy = "Need-blind" | "Need-aware" | "Merit-focused" | "Not classified";
export type InstitutionType = "University" | "Liberal arts college" | "College" | "Specialized institution" | "Institution";
export type InstitutionControl = "Private" | "Public" | "Unknown";
export type RankingCategory = "university" | "liberal-arts-college" | "other";

export type Source = {
  label: string;
  url: string;
  lastVerifiedAt: string;
};

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "html"; html: string }
  | { type: "callout"; tone: "note" | "warning" | "tip"; title: string; text: string }
  | { type: "checklist"; title: string; items: string[] }
  | {
      type: "list";
      ordered: boolean;
      marker?: "decimal" | "lower-alpha" | "lower-roman" | "disc" | "circle" | "square";
      items: Array<{ text: string; children?: ContentBlock[] }>;
    };

export type ContentSection = {
  id: string;
  title: string;
  level: "basic" | "core" | "advanced" | "bangladesh";
  blocks: ContentBlock[];
  sources?: Source[];
  review: ReviewMetadata;
};

export type GuideEntry = {
  slug: string;
  order: number;
  title: string;
  eyebrow: string;
  summary: string;
  readMinutes: number;
  lastVerifiedAt: string;
  reviewStatus: ReviewStatus;
  takeaways: string[];
  blocks: ContentBlock[];
  sources: Source[];
  relatedTaskIds: string[];
  nextSlug?: string;
};

export type BlogEntry = {
  slug: string;
  title: string;
  category: string;
  author: string;
  summary: string;
  readMinutes: number;
  publishedAt: string;
  updatedAt: string;
  blocks: ContentBlock[];
  relatedGuideSlug?: string;
};

export type RoadmapTask = {
  id: string;
  stageId: string;
  title: string;
  description: string;
  dueHint: string;
  guideSlug: string;
  priority: "Core" | "Recommended";
  audiences?: string[];
};

export type RoadmapStage = {
  id: string;
  number: number;
  title: string;
  summary: string;
  accent: string;
  taskIds: string[];
};

export type CycleWindow = {
  opensAt: string;
  dueAt: string;
  label: string;
};

export type RoadmapMilestone = {
  id: string;
  stageId: string;
  title: string;
  description: string;
  window: CycleWindow;
  dependencyIds: string[];
  guideSlug: string;
  priority: "Core" | "Recommended";
};

export type College = {
  slug: string;
  name: string;
  shortName: string;
  aliases?: string[];
  location: string;
  city?: string | null;
  state?: string | null;
  region?: string | null;
  type: InstitutionType;
  rankingCategory?: RankingCategory;
  control?: InstitutionControl;
  setting?: string | null;
  enrollmentBand?: string | null;
  aidPolicy: AidPolicy;
  meetsFullNeed: boolean | null;
  meritAid: boolean | null;
  testingPolicy: string;
  englishTests: string[];
  applicationPlans: string[];
  feeWaiver: string;
  themes: string[];
  budgetFit: "full-need" | "partial-need" | "merit" | "research";
  summary: string;
  source: Source;
  sourceScope?: string;
  originalDescription?: string;
  costOfAttendance?: number | null;
  acceptanceRate?: number | null;
  internationalAidPercent?: number | null;
  averageInternationalAid?: number | null;
  specialNote?: string | null;
  admissions?: AdmissionsProfile;
  testing?: TestingProfile;
  englishProficiency?: EnglishTestRequirement[];
  scholarships?: CollegeScholarship[];
  rankings?: CollegeRanking[];
  researchHighlights?: string[];
  researchHighlightOverride?: string | null;
  officialReview?: {
    status: "unreviewed" | "reviewed" | "needs_follow_up";
    reviewedAt?: string | null;
    reviewerNote?: string | null;
  };
  datasetReviewedAt?: string;
  lastVerifiedAt: string;
  reviewStatus: ReviewStatus;
};

export type SourcedFact<T> = {
  value: T | null;
  status: FactStatus;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
  dataYear?: string | null;
  cycle?: string | null;
  reviewedAt?: string | null;
  rawValue?: string | number | null;
  note?: string | null;
};

export type AcceptanceRateFact = SourcedFact<number> & {
  audience: "overall" | "international";
  applicants?: number | null;
  admitted?: number | null;
};

export type AdmissionsProfile = {
  overallAcceptanceRate: AcceptanceRateFact;
  internationalAcceptanceRate: AcceptanceRateFact;
  yieldRate?: SourcedFact<number>;
  internationalYieldRate?: SourcedFact<number>;
  earlyPlans?: Array<{
    plan: "EA" | "ED" | "ED2" | "REA" | "SCEA" | "RD" | "Other";
    acceptanceRate?: SourcedFact<number>;
    note?: string | null;
  }>;
};

export type ScoreRange = {
  low: number | null;
  high: number | null;
};

export type TestingProfile = {
  policy: SourcedFact<string>;
  satComposite?: SourcedFact<number>;
  satMathRange?: SourcedFact<ScoreRange>;
  satEbrwRange?: SourcedFact<ScoreRange>;
  satSubmissionPercent?: SourcedFact<number>;
  actSubmissionPercent?: SourcedFact<number>;
  context?: string | null;
};

export type EnglishTestRequirement = {
  test: "TOEFL" | "IELTS" | "Duolingo" | "PTE" | "Cambridge" | "Other";
  minimumScore: SourcedFact<string | number>;
  waiverNote?: string | null;
};

export type CollegeScholarship = {
  name: string;
  amount?: string | null;
  applicationMethod?: string | null;
  requirements?: string | null;
  restrictions?: string | null;
  notes?: string | null;
  source?: SourcedFact<string>;
};

export type CollegeRanking = {
  system: "QS World University Rankings" | "U.S. News National Liberal Arts Colleges";
  edition: string;
  globalRank?: number | null;
  countryPosition?: number | null;
  nationalRank?: number | null;
  tied?: boolean;
  sourceUrl: string;
  reviewedAt: string;
  countryPositionMethod?: "BD2US competition ranking";
};

export type CollegeEnrichmentRecord = {
  slug: string;
  aliases?: string[];
  rankingCategory?: RankingCategory;
  admissions?: Partial<AdmissionsProfile>;
  testing?: Partial<TestingProfile>;
  englishProficiency?: EnglishTestRequirement[];
  scholarships?: CollegeScholarship[];
  rankings?: CollegeRanking[];
  researchHighlightOverride?: string | null;
  officialReview: NonNullable<College["officialReview"]>;
};

export type CollegeFact = {
  key: string;
  label: string;
  value: string | number | boolean | null;
  source?: Source;
  lastVerifiedAt: string;
};

export type FactSource = Source & {
  scope: "dataset" | "official" | "community";
};

export type ReviewMetadata = {
  status: ReviewStatus;
  lastVerifiedAt: string;
  nextReviewAt?: string;
};

export type GlossaryTerm = {
  term: string;
  definition: string;
  bangla: string;
  relatedGuideSlug?: string;
};

export type StudentProfile = {
  curriculum: string;
  currentYear: string;
  targetIntake: string;
  aidBand: string;
  testingStatus: string;
  interests: string[];
};

export type ApplicantContext = StudentProfile & {
  familyContributionBand?: string;
};

export type SearchResult = {
  type: "Guide" | "Blog" | "Task" | "College" | "Glossary" | "FAQ" | "Resource";
  title: string;
  summary: string;
  href: string;
  keywords: string[];
};

export type OfficialResource = {
  title: string;
  summary: string;
  url: string;
  category: "Start in Bangladesh" | "College research" | "Applications" | "Testing" | "Financial aid" | "Visa and arrival";
  stage: string;
  caution?: string;
};
