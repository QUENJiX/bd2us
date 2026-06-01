import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Surface, Tag } from "@/components/ui";
import { colleges, getCollege } from "@/lib/content";

export function generateStaticParams() {
  return colleges.map((college) => ({ slug: college.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const college = getCollege((await params).slug);
  return college ? { title: college.name, description: college.summary } : {};
}

export default async function CollegePage({ params }: { params: Promise<{ slug: string }> }) {
  const college = getCollege((await params).slug);
  if (!college) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <Link className="text-sm font-bold text-emerald-800" href="/colleges">← Back to explorer</Link>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <article>
          <div className="flex flex-wrap gap-2"><Tag>{college.aidPolicy}</Tag>{college.meetsFullNeed ? <Tag tone="amber">Meets full need</Tag> : null}{college.meritAid ? <Tag tone="neutral">Merit aid</Tag> : null}</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{college.location}</p>
          <h1 className="font-display mt-3 text-6xl leading-[.94] text-emerald-950 sm:text-7xl">{college.name}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{college.summary}</p>
          <Surface className="mt-8 p-6">
            <h2 className="font-display text-3xl text-emerald-950">Research checklist</h2>
            <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
              <Fact label="Institution type" value={college.type} />
              <Fact label="Application plans" value={college.applicationPlans.join(", ")} />
              <Fact label="Testing policy" value={college.testingPolicy} />
              <Fact label="English tests" value={college.englishTests.join(", ")} />
              <Fact label="Fee waiver" value={college.feeWaiver} />
              <Fact label="Themes to investigate" value={college.themes.join(", ")} />
            </dl>
          </Surface>
        </article>
        <aside>
          <Surface className="p-6 lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Official-source record</p>
            <h2 className="font-display mt-3 text-3xl text-emerald-950">Verify before applying.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Policies and requirements can change by cycle. Use this profile to organize your research, then confirm the live college instructions.</p>
            <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-xs font-bold leading-5 text-emerald-950">Last reviewed: {college.lastVerifiedAt}</p>
            <a className="mt-5 inline-flex text-sm font-bold text-emerald-900 underline decoration-emerald-300 underline-offset-4" href={college.source.url} rel="noreferrer" target="_blank">{college.source.label} ↗</a>
            <ButtonLink className="mt-6 w-full" href="/colleges">Compare colleges</ButtonLink>
          </Surface>
        </aside>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</dt><dd className="mt-1.5 leading-6 text-slate-700">{value}</dd></div>;
}
