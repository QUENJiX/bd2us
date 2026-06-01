import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const guideFiles = {
  orientation: ["chapters/introduction.html"],
  timeline: ["chapters/application-timeline.html"],
  "college-research": ["chapters/college-research.html", "chapters/application-strategy-ea-ed.html"],
  academics: ["chapters/academics.html"],
  "standardized-testing": ["chapters/standardized-testing.html", "chapters/english-proficiency-test.html"],
  activities: ["chapters/extracurriculars.html", "chapters/awards-honors.html"],
  essays: ["chapters/essays.html"],
  "application-platforms": ["chapters/application-platforms.html", "chapters/fee-waivers.html"],
  "financial-aid": ["financial-aid.html"]
};
const blogFiles = {
  "will-you-get-into-harvard-mit-stanford": "blog/will-you-get-into-harvard-mit-stanford.html",
  "what-are-your-chances-getting-into-harvard": "blog/what-are-your-chances-getting-into-harvard.html",
  "international-application-top-10-mistakes": "blog/international-application-top-10-mistakes.html",
  "full-scholarship-colleges-financial-aid-data": "blog/full-scholarship-colleges-financial-aid-data.html",
  "cover-expenses-full-tuition-scholarship": "blog/cover-expenses-full-tuition-scholarship.html"
};
const guideRoutes = {
  "introduction": "orientation",
  "application-timeline": "timeline",
  "college-research": "college-research",
  "application-strategy-ea-ed": "college-research",
  "academics": "academics",
  "standardized-testing": "standardized-testing",
  "english-proficiency-test": "standardized-testing",
  "extracurriculars": "activities",
  "awards-honors": "activities",
  "essays": "essays",
  "application-platforms": "application-platforms",
  "fee-waivers": "application-platforms"
};
const continuationTitles = {
  "chapters/application-strategy-ea-ed.html": "Application plans: ED, EA, REA, and RD",
  "chapters/english-proficiency-test.html": "English tests: TOEFL, IELTS, and the Duolingo lifeline",
  "chapters/awards-honors.html": "Awards and honors: your trophy shelf",
  "chapters/fee-waivers.html": "Fee waivers: how to reduce application costs"
};

const generated = {
  generatedAt: new Date().toISOString(),
  guides: Object.fromEntries(Object.entries(guideFiles).map(([slug, files]) => [slug, combine(files)])),
  blogs: Object.fromEntries(Object.entries(blogFiles).map(([slug, file]) => [slug, extract(file)]))
};

writeFileSync(resolve(root, "lib/legacy-content.generated.json"), JSON.stringify(generated, null, 2) + "\n");
console.log(`Generated ${Object.keys(generated.guides).length} guide bodies and ${Object.keys(generated.blogs).length} blog bodies.`);

function combine(files) {
  return files.map((file, index) => `${index ? `<hr class="legacy-divider"><h2>${continuationTitles[file] ?? "Continue reading"}</h2>` : ""}${extract(file)}`).join("");
}

function extract(file) {
  const html = readFileSync(resolve(root, file), "utf8");
  const article = html.match(/<article[^>]*class=["'][^"']*blog-post-article[^"']*["'][^>]*>([\s\S]*?)<\/article>/i)?.[1];
  if (!article) throw new Error(`Could not find article body in ${file}`);
  return clean(article, file);
}

function clean(value, file) {
  let html = value;
  if (file === "financial-aid.html") {
    html = html.replace(/<!-- Expected Family Contribution[\s\S]*?(?=\s*<\/div>\s*<div class="content-block animate-on-scroll">\s*<h2><i class="fas fa-globe-asia")/i, "");
  }
  html = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<div class="dataset-toggle"[\s\S]*?<\/div>/gi, "")
    .replace(/<div class="data-tools"[\s\S]*?<\/div>/gi, "")
    .replace(/<i\b[^>]*><\/i>/gi, "")
    .replace(/\sstyle=(["'])[\s\S]*?\1/gi, "")
    .replace(/\son\w+=(["'])[\s\S]*?\1/gi, "")
    .replace(/\sclass=(["'])([^"']*)\1/gi, (_, quote, classes) => {
      const cleaned = classes.split(/\s+/).filter((name) => name && name !== "animate-on-scroll").join(" ");
      return cleaned ? ` class=${quote}${cleaned}${quote}` : "";
    })
    .replace(/href=(["'])([^"']+)\1/gi, (_, quote, href) => `href=${quote}${rewriteHref(href, file)}${quote}`)
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
  return html;
}

function rewriteHref(href, file) {
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  const hash = href.includes("#") ? `#${href.split("#")[1]}` : "";
  const path = href.split("#")[0].replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
  if (path === "index.html") return `/${hash}`;
  if (path === "blog.html") return `/blog${hash}`;
  if (path === "roadmap.html") return `/roadmap${hash}`;
  if (path === "college-list.html") return `/colleges${hash}`;
  if (path === "financial-aid.html") return `/guide/financial-aid${hash}`;
  const chapter = path.match(/(?:chapters\/)?([^/]+)\.html$/)?.[1];
  if (file.startsWith("chapters/") && chapter && guideRoutes[chapter]) return `/guide/${guideRoutes[chapter]}${hash}`;
  const blog = path.match(/(?:blog\/)?([^/]+)\.html$/)?.[1];
  if (blogFiles[blog]) return `/blog/${blog}${hash}`;
  return href;
}
