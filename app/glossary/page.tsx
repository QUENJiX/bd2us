import { JourneyRail } from "@/components/journey-rail";
import { GlossaryExplorer } from "@/components/glossary-explorer";
import { glossary } from "@/lib/glossary";

export const metadata = { title: "Admissions Glossary", description: "Plain-English U.S. admissions definitions with concise Bangla explanations for Bangladeshi applicants." };

export default function GlossaryPage() {
  return (
    <main id="main-content">
      <section className="catalog-hero"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"><p className="eyebrow">English + বাংলা explanations · {glossary.length} terms</p><h1 className="font-display mt-3 max-w-4xl text-5xl leading-[.96] text-emerald-950 sm:text-7xl">Admissions language, made less mysterious.</h1><p className="catalog-deck">Search the language of college research, applications, testing, money, decisions, visa processing, and student status—then open the chapter where the term matters.</p></div></section>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6"><JourneyRail compact /></div>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <GlossaryExplorer terms={glossary} />
      </section>
    </main>
  );
}
