import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBlocks } from "@/components/content-blocks";
import { GuideEnhancements } from "@/components/guide-enhancements";
import { JourneyRail } from "@/components/journey-rail";
import { ReaderTools } from "@/components/reader-tools";
import { ButtonLink } from "@/components/ui";
import { guides, roadmapTasks } from "@/lib/content";
import { getPublishedGuide } from "@/lib/public-content";
import { guideEnhancements } from "@/lib/guide-enhancements";
import { getLegacyGuideHtml } from "@/lib/legacy-content";

export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = await getPublishedGuide((await params).slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.summary, alternates: { canonical: `/guide/${guide.slug}` }, openGraph: { title: guide.title, description: guide.summary } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = await getPublishedGuide((await params).slug);
  if (!guide) notFound();
  const tasks = roadmapTasks.filter((task) => guide.relatedTaskIds.includes(task.id));
  const legacyHtml = getLegacyGuideHtml(guide.slug);
  const enhancement = guideEnhancements[guide.slug];

  return (
    <main id="main-content" className="guide-page">
      <section className="guide-masthead">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav className="guide-breadcrumb"><Link href="/">Home</Link><Link href="/roadmap">Fall 2027 field guide</Link><span>{guide.eyebrow}</span></nav>
          <div className="guide-title-grid">
            <div><p className="eyebrow">{guide.eyebrow} · Fall 2027</p><h1>{guide.title}</h1><p>{guide.summary}</p></div>
            <dl><div><dt>Reading time</dt><dd>{guide.readMinutes} minutes + deep dive</dd></div><div><dt>Reviewed</dt><dd>{formatDate(guide.lastVerifiedAt)}</dd></div><div><dt>Use this chapter to</dt><dd>{tasks.map((task) => task.title).join(" and ")}</dd></div></dl>
          </div>
          <ReaderTools slug={guide.slug} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6"><JourneyRail compact /></div>

      <div className="guide-layout mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <article className="guide-article">
          <section className="chapter-takeaways" aria-labelledby="takeaways-title"><p className="eyebrow">Three things to remember</p><h2 id="takeaways-title">The short version</h2><ul>{guide.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}</ul></section>
          {enhancement ? <GuideEnhancements enhancement={enhancement} /> : null}
          <section id="full-chapter" className="full-chapter"><div className="full-chapter-heading"><p className="eyebrow">Complete chapter</p><h2>Read the full field notes</h2><p>Use the sections above for orientation; use this detailed chapter when you are actively doing the work.</p></div><ContentBlocks blocks={legacyHtml ? [{ type: "html", html: legacyHtml }] : guide.blocks} /></section>
          {guide.sources.length ? <section id="official-sources" className="official-sources"><p className="eyebrow">Dated evidence</p><h2>Official sources</h2><p>Policies can change after the review date. Open the live source before you submit or pay.</p><div>{guide.sources.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer"><span>{item.label}</span><small>Reviewed {formatDate(item.lastVerifiedAt)}</small><b>↗</b></a>)}</div></section> : null}
          {guide.nextSlug ? <div className="chapter-next"><p className="eyebrow">Continue the journey</p><ButtonLink href={`/guide/${guide.nextSlug}`}>Open the next chapter →</ButtonLink></div> : null}
        </article>

        <aside className="guide-sidebar">
          <nav aria-label="On this page" className="chapter-contents"><p className="eyebrow">On this page</p><a href="#start-here">Plain-language start</a><a href="#deeper-explanation">Deeper explanation</a><a href="#bangladesh-context">Bangladesh context</a><a href="#common-mistakes">Common mistakes</a><a href="#worksheet">Practical worksheet</a><a href="#full-chapter">Complete chapter</a>{guide.sources.length ? <a href="#official-sources">Official sources</a> : null}</nav>
          <div className="related-actions"><p className="eyebrow">Related actions</p>{tasks.map((task) => <Link key={task.id} href={`/roadmap#${task.id}`}><span>{task.priority}</span><strong>{task.title}</strong><small>{task.dueHint}</small></Link>)}</div>
        </aside>
      </div>
    </main>
  );
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
