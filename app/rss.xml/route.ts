import { blogs, guides } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bd2us.app";

export function GET() {
  const items = [...blogs.map((blog) => ({ title: blog.title, href: `/blog/${blog.slug}`, summary: blog.summary, date: blog.updatedAt })), ...guides.map((guide) => ({ title: guide.title, href: `/guide/${guide.slug}`, summary: guide.summary, date: guide.lastVerifiedAt }))].map((item) => `<item><title>${escapeXml(item.title)}</title><link>${siteUrl}${item.href}</link><description>${escapeXml(item.summary)}</description><pubDate>${new Date(item.date).toUTCString()}</pubDate><guid>${siteUrl}${item.href}</guid></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>BD2US Guide</title><link>${siteUrl}</link><description>Reviewed guidance for Bangladeshi students applying to U.S. colleges.</description>${items}</channel></rss>`, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
}
