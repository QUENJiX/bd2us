export type ReviewStatus = "draft" | "in_review" | "published" | "stale";
export type AidPolicy = "Need-blind" | "Need-aware" | "Merit-focused";
export type InstitutionType = "University" | "Liberal arts college";

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
  | { type: "checklist"; title: string; items: string[] };

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

export type College = {
  slug: string;
  name: string;
  shortName: string;
  location: string;
  type: InstitutionType;
  aidPolicy: AidPolicy;
  meetsFullNeed: boolean;
  meritAid: boolean;
  testingPolicy: string;
  englishTests: string[];
  applicationPlans: string[];
  feeWaiver: string;
  themes: string[];
  budgetFit: "full-need" | "partial-need" | "merit";
  summary: string;
  source: Source;
  lastVerifiedAt: string;
  reviewStatus: ReviewStatus;
};

export type StudentProfile = {
  curriculum: string;
  currentYear: string;
  targetIntake: string;
  aidBand: string;
  testingStatus: string;
  interests: string[];
};

export type SearchResult = {
  type: "Guide" | "Blog" | "Task" | "College" | "FAQ" | "Resource";
  title: string;
  summary: string;
  href: string;
  keywords: string[];
};
