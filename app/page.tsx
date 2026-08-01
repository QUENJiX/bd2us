import Link from "next/link";
import Image from "next/image";
import { HeroPlanner } from "@/components/hero-planner";
import { JourneyRail } from "@/components/journey-rail";
import { ButtonLink, SectionHeading, Surface, Tag } from "@/components/ui";
import { colleges, roadmapStages } from "@/lib/content";

const featuredCollegeNames = [
  "Harvard University",
  "Massachusetts Institute of Technology",
  "Stanford University",
  "Princeton University",
  "Williams College",
  "Amherst College"
];

const featuredColleges = featuredCollegeNames.flatMap((name) => {
  const college = colleges.find((item) => item.name === name || item.name.startsWith(`${name} (`));
  return college ? [college] : [];
});

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BD2US",
    url: "https://www.bd2us.app",
    description: "Bangladesh-specific U.S. college application guidance, roadmap planning, and reviewed college research.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.bd2us.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  return (
    <main id="main-content">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
      <section className="paper-grid overflow-hidden border-b border-emerald-950/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <Tag>Built for Bangladesh</Tag>
            <h1 className="font-display mt-5 max-w-4xl text-5xl leading-[.96] text-emerald-950 sm:text-7xl">
              A calmer way to navigate the long road to a U.S. college.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              One source-backed guide, one interactive roadmap, and one curated college explorer from first research
              through your first week in the U.S.
            </p>
            <HeroPlanner />
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600">
              <Link className="text-emerald-900 underline decoration-amber-500 underline-offset-4" href="/colleges">
                Explore reviewed colleges
              </Link>
              <span>Public guide · Optional account · No admission-odds theater</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-amber-400/25 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
            <Surface className="relative overflow-hidden p-5 shadow-[var(--shadow)]">
              <div className="flex items-center justify-between border-b border-emerald-950/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Your route</p>
                  <p className="font-display mt-1 text-3xl font-bold text-emerald-950">12 clear stages</p>
                </div>
                <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-bold text-white">Free to use</span>
              </div>
              <div className="mt-5 grid gap-2">
                {roadmapStages.slice(0, 6).map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3 rounded-xl border border-emerald-950/8 bg-white/60 px-3 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: stage.accent }}>
                      {stage.number}
                    </span>
                    <p className="text-sm font-bold text-slate-700">{stage.title}</p>
                  </div>
                ))}
              </div>
              <Link href="/roadmap" className="mt-5 block rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-900 hover:bg-emerald-100">
                Open the complete roadmap →
              </Link>
            </Surface>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6"><JourneyRail compact /></div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="The three questions to answer first"
          title="Know where to start this August."
          description="Fall 2027 applicants do not need more scattered advice. They need the right sequence, a realistic funding strategy, and a next action."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Where should I start?", `Use the ${roadmapStages.length}-stage route to find the first unfinished action for your intake.`, "/roadmap"],
            ["What matters in August?", "Agree on a budget range, build the first college list, plan tests, and begin the school-document process.", "/guide/timeline"],
            ["How does funding shape the list?", `Compare ${colleges.length} colleges by cost and international-aid evidence before falling for a logo.`, "/colleges"]
          ].map(([title, body, href]) => (
            <Link key={title} href={href} className="card group p-6 hover:-translate-y-1 hover:border-emerald-800/30 hover:shadow-lg">
              <p className="font-display text-3xl font-bold text-emerald-950">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              <p className="mt-5 text-sm font-bold text-emerald-800">Explore →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">A better college list</p>
            <h2 className="font-display mt-3 text-4xl leading-none sm:text-5xl">Research funding before falling for a logo.</h2>
            <p className="mt-5 max-w-lg leading-7 text-emerald-100/80">
              Compare international aid policy, full-need commitments, official sources, and last-verified dates. The
              explorer explains fit without pretending to predict admission.
            </p>
            <ButtonLink href="/colleges" variant="secondary" className="mt-7">
              Open college explorer
            </ButtonLink>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredColleges.map((college) => (
              <Link key={college.slug} href={`/colleges/${college.slug}`} className="rounded-2xl border border-white/10 bg-white/7 p-4 hover:bg-white/12">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{college.aidPolicy}</p>
                <p className="mt-2 font-display text-2xl font-bold">{featuredName(college.name)}</p>
                <p className="mt-2 text-xs leading-5 text-emerald-100/75">{college.location}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="colapp-panel grid gap-6 overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-[#f4f0e6] p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] lg:items-center">
          <div className="rounded-2xl border border-emerald-950/10 bg-white/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Need a more personal answer?</p>
            <p className="font-display mt-2 text-2xl font-bold text-emerald-950">ColApp is our companion app, not a gate.</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              BD2US remains independently useful. When you need personalized AI guidance, our ColApp companion is available as an optional next step.
            </p>
            <a className="mt-4 inline-flex text-sm font-bold text-emerald-900 underline decoration-amber-500 underline-offset-4" href="https://www.colapp.tech" target="_blank" rel="noreferrer">
              Visit ColApp →
            </a>
          </div>
          <div className="colapp-media"><Image src="/assets/images/colapp-placeholder.png" alt="Abstract planning route and checklist placeholder for ColApp" width={960} height={720} sizes="(min-width: 1024px) 24rem, 90vw" priority={false} /></div>
        </div>
      </section>
    </main>
  );
}

function featuredName(name: string) {
  if (name.startsWith("Massachusetts Institute of Technology")) return "MIT";
  return name.replace(/ University$| College$/, "");
}
