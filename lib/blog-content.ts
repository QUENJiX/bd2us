import type { BlogEntry } from "@/lib/types";

const updatedAt = "2026-06-01";

export const blogs: BlogEntry[] = [
  {
    slug: "will-you-get-into-harvard-mit-stanford",
    title: "Will you get into Harvard, MIT or Stanford?",
    category: "Admissions",
    author: "Hasibul Islam",
    summary: "Why perfect-looking credentials cannot guarantee admission to an extremely selective college.",
    readMinutes: 8,
    publishedAt: "2024-12-01",
    updatedAt,
    relatedGuideSlug: "college-research",
    blocks: []
  },
  {
    slug: "what-are-your-chances-getting-into-harvard",
    title: "What are Your Chances of Getting into Harvard?",
    category: "Admissions",
    author: "Hasibul Islam",
    summary: "A detailed look at the Harvard admissions rating framework and what it may teach applicants.",
    readMinutes: 12,
    publishedAt: "2024-11-28",
    updatedAt,
    relatedGuideSlug: "college-research",
    blocks: []
  },
  {
    slug: "international-application-top-10-mistakes",
    title: "Top 10 Application Mistakes International Students Make",
    category: "Application quality",
    author: "BD2US Editorial Team",
    summary: "Ten recurring mistakes international applicants should catch before submission.",
    readMinutes: 9,
    publishedAt: "2025-01-10",
    updatedAt,
    relatedGuideSlug: "application-platforms",
    blocks: []
  },
  {
    slug: "full-scholarship-colleges-financial-aid-data",
    title: "Colleges Offering Full Scholarships & Generous Aid ($0-$5K EFC)",
    category: "Financial-aid data",
    author: "BD2US Editorial Team",
    summary: "A detailed scholarship and financial-aid reference for international college research.",
    readMinutes: 14,
    publishedAt: "2024-12-12",
    updatedAt,
    relatedGuideSlug: "college-research",
    blocks: []
  },
  {
    slug: "cover-expenses-full-tuition-scholarship",
    title: "Can You Cover Your Expenses with Full Tuition Scholarship?",
    category: "Financial planning",
    author: "Safwan Bin Rashid",
    summary: "A breakdown of the expenses a full-tuition scholarship may leave uncovered.",
    readMinutes: 8,
    publishedAt: "2024-12-05",
    updatedAt,
    relatedGuideSlug: "financial-aid",
    blocks: []
  }
];

export function getBlog(slug: string) {
  return blogs.find((blog) => blog.slug === slug);
}
