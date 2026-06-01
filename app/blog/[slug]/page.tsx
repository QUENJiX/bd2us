import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBlocks } from "@/components/content-blocks";
import { ButtonLink, Tag } from "@/components/ui";
import { blogs, getBlog } from "@/lib/blog-content";
import { getLegacyBlogHtml } from "@/lib/legacy-content";

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const blog = getBlog((await params).slug);
  if (!blog) return {};
  return {
    title: blog.title,
    description: blog.summary,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: { title: blog.title, description: blog.summary, type: "article" }
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const blog = getBlog((await params).slug);
  if (!blog) notFound();
  const legacyHtml = getLegacyBlogHtml(blog.slug);
  return (
    <main>
      <section className="border-b border-emerald-950/10 bg-[#f4f0e6]">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <nav className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500"><Link href="/">Home</Link><span className="px-2">/</span><Link href="/blog">Blog</Link></nav>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">{blog.category}</p>
          <h1 className="font-display mt-3 max-w-4xl text-5xl leading-[.98] text-emerald-950 sm:text-7xl">{blog.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{blog.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Tag>{blog.readMinutes} min read</Tag>
            <Tag tone="neutral">By {blog.author}</Tag>
            <Tag tone="neutral">Updated {blog.updatedAt}</Tag>
          </div>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <ContentBlocks blocks={legacyHtml ? [{ type: "html", html: legacyHtml }] : blog.blocks} />
        <div className="mt-12 flex flex-wrap gap-3 border-t border-emerald-950/10 pt-7">
          <ButtonLink href="/blog" variant="secondary">Back to the blog</ButtonLink>
          {blog.relatedGuideSlug ? <ButtonLink href={`/guide/${blog.relatedGuideSlug}`}>Continue in the guide</ButtonLink> : null}
        </div>
      </article>
    </main>
  );
}
