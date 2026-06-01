import Link from "next/link";
import { Surface, Tag } from "@/components/ui";
import { blogs } from "@/lib/blog-content";

export const metadata = { title: "Blog", description: "Practical BD2US notes on U.S. college applications, financial aid, and planning from Bangladesh." };

export default function BlogPage() {
  return (
    <main>
      <section className="border-b border-emerald-900/10 bg-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <Tag tone="amber">BD2US blog</Tag>
          <h1 className="font-display mt-6 max-w-5xl text-6xl leading-[.93] sm:text-8xl">Notes for the decisions that deserve a closer look.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-100/85">Practical explanations, reality checks, and planning tools for Bangladeshi students navigating a complicated process.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {blogs.map((blog) => (
            <Link href={`/blog/${blog.slug}`} key={blog.slug} className="group">
              <Surface className="h-full p-6 transition group-hover:-translate-y-1 group-hover:border-emerald-700/35 group-hover:shadow-lg">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">{blog.category}</p>
                <h2 className="font-display mt-3 text-4xl leading-[1.02] text-emerald-950">{blog.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{blog.summary}</p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                  <span>{blog.author}</span><span>·</span><span>{blog.readMinutes} min read</span>
                </div>
              </Surface>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
