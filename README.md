# BD2US Guide - U.S. College Application Roadmap for Bangladeshi Students

This repository contains the source code for the BD2US Guide website, a comprehensive roadmap designed to help Bangladeshi students navigate the U.S. college application process.

## Description
A practical, end‑to‑end website and reference for students in Bangladesh who want to apply to U.S. colleges. It translates the full process into clear steps aligned to local context, timelines, and constraints, and is built as a lightweight, mobile‑first static site for fast browsing on low bandwidth.

What you’ll find
- Stepwise roadmap from exploration to enrollment, with checklists and timelines
- Topic pages covering research, strategy (ED/EA/REA/RD), platforms, funding, academics, testing, profile building, essays, and curated resources
- Bangladesh‑specific guidance (SSC/HSC and GCE nuances, transcript handling, counselor coordination, test centers, fee waiver paths)
- Templates, examples, and links to tools to accelerate execution
- Cross‑links between chapters, breadcrumbing, and simple search to keep context
- Social cards, structured data, sitemap, and RSS to aid discoverability

Who it’s for
- Applicants (secondary and gap‑year), mentors, counselors, and parents seeking a clear, locally relevant playbook

How to use it
- Read sequentially for a complete plan or jump to a topic for quick answers
- Follow the embedded checklists and timelines; save pages for offline reference
- Track updates via the blog/RSS; propose improvements through issues and PRs

Technical notes
- Static HTML/CSS/JS with no framework dependency, optimized for speed and maintainability
- Content organized into modular chapters and assets for easy contribution and review

Outcome
- Make confident decisions, build an authentic profile, craft stronger applications, and maximize financial aid opportunities while avoiding common pitfalls.

## Project Structure

```
bd2us/
├── assets/           # Images and static assets
├── chapters/         # Chapter content pages  
├── css/             # Stylesheets
├── docs/            # Documentation
├── js/              # JavaScript files
├── .github/         # GitHub configurations
└── [HTML pages]     # Main site pages
```

For detailed structure documentation, see [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md).

## Tech Stack

*   HTML5
*   CSS3 (with CSS Variables, Animations, Transitions)
*   JavaScript (Vanilla JS for interactions, scroll effects, and animations)
*   Font Awesome (for icons)

## Viewing the Site

### Option 1: Live Site (GitHub Pages)

The live, deployed version of this guide can be viewed at:
**https://www.bd2us.app/**

*(Deployment is handled automatically via GitHub Actions whenever changes are pushed to the `main` branch).*

### Option 2: Local Development

1.  Clone this repository: `git clone https://github.com/QuenJix/bd2us.git`
2.  Navigate into the directory: `cd bd2us`
3.  Open the `index.html` file directly in your web browser.

For development guidelines, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Content Coverage

The guide provides comprehensive coverage of:

*   **Foundation**: Introduction and mindset shifts
*   **Research**: College selection and fit analysis  
*   **Strategy**: Application plans (ED/EA/REA/RD)
*   **Platforms**: Common App, Scoir, and other systems
*   **Financial**: Fee waivers and aid strategies
*   **Academic**: Transcripts and grade presentation
*   **Testing**: SAT/ACT and English proficiency 
*   **Profile**: Extracurriculars, awards, and honors
*   **Essays**: Personal statements and supplements
*   **Aid**: In-depth financial assistance guide
*   **Resources**: Tools, links, and references

## Contributing

Contributions, issues, and feature requests are welcome. Please feel free to check the [issues page](https://github.com/QuenJix/bd2us/issues) if you want to contribute.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

*   Content created and curated by the dedicated team at **Bangladeshis at Bideshi Universities (BABU)**.
*   Built with care to assist the next generation of Bangladeshi students aiming for U.S. universities.

---

*Copyright &copy; 2025 BD2US Guide. All rights reserved.* 

## SEO Implementation Overview

This site includes a lightweight technical SEO foundation optimized for a static deployment:

Implemented
1. Clean meta descriptions and canonical URLs on core pages
2. Open Graph + Twitter Card social sharing tags
3. JSON-LD Structured Data:
	 - `WebSite` + `Organization` (homepage) with internal SearchAction
	 - `Blog` (blog listing)
	 - `BlogPosting` + `BreadcrumbList` (pattern demonstrated on one post – replicate to others)
4. XML Sitemap (`/sitemap.xml`) & Robots.txt allowing full crawl
5. RSS feed (`/rss.xml`) with recent posts (add new items as posts are published)
6. Removed legacy `<meta name="keywords">` tags (no ranking value and potential noise)

To Replicate BlogPosting Schema
Add inside `<head>` of each blog post (adjust fields):
```
<script type="application/ld+json">
{
	"@context": "https://schema.org",
	"@type": "BlogPosting",
	"mainEntityOfPage": {"@type": "WebPage", "@id": "FULL_URL"},
	"headline": "VISIBLE PAGE H1",
	"description": "Concise 1–2 sentence summary",
	"image": "https://www.bd2us.app/assets/images/social/og-image.png",
	"author": {"@type": "Organization", "name": "BD2US"},
	"publisher": {"@type": "Organization", "name": "BD2US", "logo": {"@type": "ImageObject", "url": "https://www.bd2us.app/assets/images/social/og-image.png"}},
	"datePublished": "YYYY-MM-DD",
	"dateModified": "YYYY-MM-DD",
	"articleSection": "Category",
	"inLanguage": "en",
	"isFamilyFriendly": true
}
</script>
```

Breadcrumb Pattern
```
<script type="application/ld+json">
{
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	"itemListElement": [
		{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.bd2us.app/"},
		{"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.bd2us.app/blog.html"},
		{"@type": "ListItem", "position": 3, "name": "POST TITLE"}
	]
}
</script>
```

When Adding a New Post
1. Create the HTML page under `blog/`
2. Add proper `<title>`, meta description, canonical, Open Graph & Twitter tags
3. Insert JSON-LD (BlogPosting + BreadcrumbList). If no individual author identity is maintained, you may set `author` to the organization (as in example above).
4. Update `blog-data.js` (for dynamic listing/search)
5. Append new `<item>` to `rss.xml` (copy an existing block, update title/link/guid/date/description) OR run the feed generation script if automation added.
6. Update `sitemap.xml` with new `<url>` entry (lastmod in `YYYY-MM-DD`) OR regenerate via automation script.

Future Technical SEO Enhancements (Optional)
* Add `lastmod` automation via a simple build script instead of manual edits
* Generate RSS & sitemap programmatically from `blog-data.js`
* Add `Article` image variants (1200x630, 800x418) for richer cards
* Implement `hreflang` if multi-language versions launch
* Add `FAQPage` or `HowTo` structured data for suitable long-form guides
* Deploy simple server-side headers for caching + security (if moving beyond pure static hosting)
* Add page-level structured data for `College` entities if building a college database section (use `EducationalOrganization`)

Content Strategy Notes
* Cluster content around core intent: financial aid, essays, testing, application strategy
* Internal link each new post to at least 2 evergreen pillars (e.g., roadmap, financial aid main page)
* Maintain a changelog or updated date for long-living guides to justify freshness
* Avoid thin tag/category pages—keep blog listing strong via filtering already implemented

Monitoring
* Set up Google Search Console (coverage, enhancements, performance queries)
* Track impressions & refine titles/meta based on CTR for high-impression / low-CTR pages
* Use URL Inspection after publishing each new post for faster indexing

This section should be updated as automation or new structured data types are introduced.
