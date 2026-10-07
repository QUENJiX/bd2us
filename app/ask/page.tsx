import type { Metadata } from "next";
import Link from "next/link";
import { PikuMascot } from "@/components/piku-mascot";
import { ButtonLink } from "@/components/ui";
import { founderEmail, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ask Piku",
  description: "Meet Piku, BD2US’s college application companion being built with Claude. Integration is in development.",
  alternates: { canonical: `${siteUrl}/ask` }
};

export default function AskPage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
      <Link href="/" className="text-sm font-bold text-emerald-900">← Back to BD2US</Link>
      <section className="mt-8 grid gap-8 border-b border-emerald-950/10 pb-10 md:grid-cols-[1fr_12rem] md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-700">Your BD2US companion</p>
          <h1 className="font-display mt-3 text-5xl text-emerald-950 sm:text-6xl">Ask Piku.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Personalized U.S. college application guidance, grounded in BD2US&apos;s curated admissions resources.</p>
          <p className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald-950/15 px-4 py-2 text-sm text-emerald-950">Claude integration <span className="text-slate-500">· In development</span></p>
        </div>
        <PikuMascot className="mx-auto w-44" />
      </section>
      <section aria-labelledby="piku-context" className="grid gap-6 border-t border-emerald-950/10 py-8 sm:grid-cols-2">
        <div>
          <h2 id="piku-context" className="font-display text-2xl text-emerald-950">Guidance with context, not guesswork.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">We&apos;re building Piku to pair Claude with BD2US&apos;s guides, glossary and college research. The goal: explain unfamiliar terms, help you compare options and turn a question into a practical next step—with links you can check.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-emerald-950">Building with us?</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">For product questions, partnerships or feedback, reach the founder directly.</p>
          <a className="mt-3 inline-flex min-h-11 items-center break-all text-sm font-bold text-emerald-900 underline underline-offset-4" href={`mailto:${founderEmail}`}>{founderEmail} →</a>
        </div>
      </section>
      <section aria-labelledby="availability" className="py-10">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-700">Coming soon</p>
        <h2 id="availability" className="font-display mt-3 text-3xl text-emerald-950">Piku is getting ready to help.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">Chat is not available yet. Once connected to Claude, Piku will help you explore college selection, financial aid, essays and application strategy using BD2US&apos;s resources as context.</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">AI guidance can make mistakes. Always confirm deadlines and requirements with the college&apos;s official website. Piku will not predict admission chances or promise financial aid.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/guide/timeline">Read the guide →</ButtonLink>
          <ButtonLink href="/colleges" variant="secondary">Explore colleges</ButtonLink>
        </div>
      </section>
    </main>
  );
}
