import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const legacyRedirects = [
  ["/index.html", "/"],
  ["/roadmap.html", "/roadmap"],
  ["/college-list.html", "/colleges"],
  ["/financial-aid.html", "/guide/financial-aid"],
  ["/resources.html", "/resources"],
  ["/faq.html", "/faq"],
  ["/about.html", "/about"],
  ["/contact.html", "/contact"],
  ["/success-stories.html", "/success-stories"],
  ["/blog.html", "/blog"],
  ["/chapters/introduction.html", "/guide/orientation"],
  ["/chapters/application-timeline.html", "/guide/timeline"],
  ["/chapters/college-research.html", "/guide/college-research"],
  ["/chapters/application-strategy-ea-ed.html", "/guide/timeline"],
  ["/chapters/application-platforms.html", "/guide/application-platforms"],
  ["/chapters/fee-waivers.html", "/guide/application-platforms"],
  ["/chapters/academics.html", "/guide/academics"],
  ["/chapters/standardized-testing.html", "/guide/standardized-testing"],
  ["/chapters/english-proficiency-test.html", "/guide/standardized-testing"],
  ["/chapters/extracurriculars.html", "/guide/activities"],
  ["/chapters/awards-honors.html", "/guide/activities"],
  ["/chapters/essays.html", "/guide/essays"],
  ["/blog/will-you-get-into-harvard-mit-stanford.html", "/blog/will-you-get-into-harvard-mit-stanford"],
  ["/blog/what-are-your-chances-getting-into-harvard.html", "/blog/what-are-your-chances-getting-into-harvard"],
  ["/blog/international-application-top-10-mistakes.html", "/blog/international-application-top-10-mistakes"],
  ["/blog/full-scholarship-colleges-financial-aid-data.html", "/blog/full-scholarship-colleges-financial-aid-data"],
  ["/blog/cover-expenses-full-tuition-scholarship.html", "/blog/cover-expenses-full-tuition-scholarship"]
] as const;

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: true
    }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }]
      }
    ];
  }
};

export default nextConfig;
