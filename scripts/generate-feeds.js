// Feed & sitemap generation script
// Run with: npm run generate:feeds
import { readFileSync, writeFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Dynamically import blog-data (convert to ESM-friendly load)
const blogDataPath = path.join(rootDir, 'js', 'blog-data.js');
let blogModule;
try {
  const raw = readFileSync(blogDataPath, 'utf-8');
  // Quick transform: wrap in export for ESM if needed
  if (!raw.includes('export const blogPosts')) {
    const transformed = raw + '\nexport { blogPosts };\n';
    // Use eval via data URL
    blogModule = await import('data:text/javascript;base64,' + Buffer.from(transformed, 'utf-8').toString('base64'));
  } else {
    blogModule = await import(blogDataPath + '?cacheBust=' + Date.now());
  }
} catch (e) {
  console.error('Failed to load blog-data.js', e);
  process.exit(1);
}

const { blogPosts } = blogModule;

// Helper functions
const formatRFC2822 = (dateStr) => new Date(dateStr + 'T00:00:00Z').toUTCString();
const today = new Date();
const todayISO = today.toISOString().split('T')[0];

// Static pages (add or adjust priorities as needed)
const staticPages = [
  { url: 'https://www.bd2us.app/', priority: 1.0, changefreq: 'monthly', file: 'index.html' },
  { url: 'https://www.bd2us.app/roadmap.html', priority: 0.9, changefreq: 'monthly', file: 'roadmap.html' },
  { url: 'https://www.bd2us.app/financial-aid.html', priority: 0.8, changefreq: 'monthly', file: 'financial-aid.html' },
  { url: 'https://www.bd2us.app/resources.html', priority: 0.8, changefreq: 'monthly', file: 'resources.html' },
  { url: 'https://www.bd2us.app/about.html', priority: 0.7, changefreq: 'monthly', file: 'about.html' },
  // Chapters directory
  ...Array.from({ length: 11 }).map((_, i) => i === 0
    ? { url: 'https://www.bd2us.app/chapters/introduction.html', priority: 0.6, changefreq: 'monthly', file: 'chapters/introduction.html' }
    : { url: `https://www.bd2us.app/chapters/chapter-${i}.html`, priority: 0.6, changefreq: 'monthly', file: `chapters/chapter-${i}.html` }
  ),
  { url: 'https://www.bd2us.app/college-list.html', priority: 0.8, changefreq: 'monthly', file: 'college-list.html' },
  { url: 'https://www.bd2us.app/blog.html', priority: 0.8, changefreq: 'weekly', file: 'blog.html' }
];

function getFileLastMod(relPath) {
  try {
    const stats = statSync(path.join(rootDir, relPath));
    return stats.mtime.toISOString().split('T')[0];
  } catch {
    return todayISO; // fallback
  }
}

// Build sitemap entries
const blogEntries = blogPosts.map(post => ({
  url: `https://www.bd2us.app/blog/${post.slug}.html`,
  priority: 0.7,
  changefreq: 'monthly',
  lastmod: post.date
}));

const sitemapItems = [
  ...staticPages.map(p => ({
    url: p.url,
    priority: p.priority,
    changefreq: p.changefreq,
    lastmod: getFileLastMod(p.file)
  })),
  ...blogEntries
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapItems.map(item => `  <url>\n    <loc>${item.url}</loc>\n    <lastmod>${item.lastmod}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;

writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXml, 'utf-8');
console.log('sitemap.xml generated');

// Build RSS
const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>BD2US Blog</title>\n    <link>https://www.bd2us.app/</link>\n    <description>Insights on US college applications, financial aid, testing, and essays for Bangladeshi students.</description>\n    <language>en-us</language>\n    <atom:link href="https://www.bd2us.app/rss.xml" rel="self" type="application/rss+xml" />\n    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n    <generator>generate-feeds.js</generator>\n${sortedPosts.map(post => `    <item>\n      <title><![CDATA[${post.title}]]></title>\n      <link>https://www.bd2us.app/blog/${post.slug}.html</link>\n      <guid isPermaLink=\"true\">https://www.bd2us.app/blog/${post.slug}.html</guid>\n      <pubDate>${formatRFC2822(post.date)}</pubDate>\n      <description><![CDATA[${post.excerpt}]]></description>\n    </item>`).join('\n')}\n  </channel>\n</rss>\n`;

writeFileSync(path.join(rootDir, 'rss.xml'), rss, 'utf-8');
console.log('rss.xml generated');

console.log('Feed & sitemap generation complete.');
