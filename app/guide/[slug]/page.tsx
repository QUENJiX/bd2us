import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBlocks } from "@/components/content-blocks";
import { ReaderTools } from "@/components/reader-tools";
import { ButtonLink, Tag } from "@/components/ui";
import { getGuide, guides, roadmapTasks } from "@/lib/content";
import { getLegacyGuideHtml } from "@/lib/legacy-content";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guide/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.summary }
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const tasks = roadmapTasks.filter((task) => guide.relatedTaskIds.includes(task.id));
  const legacyHtml = getLegacyGuideHtml(guide.slug);

  return (
    <main id="main-content">
      <section className="border-b border-emerald-950/10 bg-[#f4f0e6]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <nav className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <Link href="/">Home</Link> <span className="px-2">/</span> <Link href="/roadmap">Guide</Link>
          </nav>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">{guide.eyebrow}</p>
          <h1 className="font-display mt-3 max-w-4xl text-5xl leading-[.98] text-emerald-950 sm:text-7xl">{guide.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{guide.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Tag>{guide.readMinutes} min read</Tag>
            <Tag tone="neutral">Reviewed {guide.lastVerifiedAt}</Tag>
          </div>
          <ReaderTools slug={guide.slug} />
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article>
          <div className="mb-8 rounded-2xl border border-emerald-900/15 bg-emerald-50/60 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Quick takeaways</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
              {guide.takeaways.map((takeaway) => (
                <li key={takeaway}>✓ {takeaway}</li>
              ))}
            </ul>
          </div>
          <ContentBlocks blocks={legacyHtml ? [{ type: "html", html: legacyHtml }] : guide.blocks} />
          {guide.sources.length ? (
            <section className="mt-10 border-t border-emerald-950/10 pt-6">
              <h2 className="font-display text-3xl font-bold text-emerald-950">Official sources</h2>
              <div className="mt-4 grid gap-2">
                {guide.sources.map((item) => (
                  <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-800 underline underline-offset-4">
                    {item.label} ↗
                  </a>
                ))}
              </div>
            </section>
          ) : null}
          {guide.nextSlug ? (
            <div className="mt-12">
              <ButtonLink href={`/guide/${guide.nextSlug}`}>Continue to the next chapter →</ButtonLink>
            </div>
          ) : null}
        </article>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Related roadmap tasks</p>
            <div className="mt-4 grid gap-3">
              {tasks.map((task) => (
                <Link key={task.id} href={`/roadmap#${task.id}`} className="rounded-xl border border-emerald-950/10 bg-white p-3 text-sm font-bold leading-5 text-emerald-950 hover:border-emerald-800/40">
                  {task.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
