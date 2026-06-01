import type { MetadataRoute } from "next";
import { blogs, colleges, guides } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bd2us.app";
const staticRoutes = ["", "/roadmap", "/colleges", "/resources", "/faq", "/about", "/success-stories", "/contact", "/blog"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-01T00:00:00+06:00");
  return [
    ...staticRoutes.map((route) => ({ url: `${siteUrl}${route}`, lastModified })),
    ...guides.map((guide) => ({ url: `${siteUrl}/guide/${guide.slug}`, lastModified: new Date(guide.lastVerifiedAt) })),
    ...blogs.map((blog) => ({ url: `${siteUrl}/blog/${blog.slug}`, lastModified: new Date(blog.updatedAt) })),
    ...colleges.map((college) => ({ url: `${siteUrl}/colleges/${college.slug}`, lastModified: new Date(college.lastVerifiedAt) }))
  ];
}
