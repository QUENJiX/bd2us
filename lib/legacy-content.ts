import generated from "@/lib/legacy-content.generated.json";

type ContentMap = Record<string, string>;

export function getLegacyGuideHtml(slug: string) {
  return (generated.guides as ContentMap)[slug];
}

export function getLegacyBlogHtml(slug: string) {
  return (generated.blogs as ContentMap)[slug];
}
