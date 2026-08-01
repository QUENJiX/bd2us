import { ButtonLink, Surface, Tag } from "@/components/ui";

export const metadata = {
  title: "Success Stories",
  description: "A growing home for consented, verified BD2US student journeys and a reminder that your path can start here."
};

export default function SuccessStoriesPage() {
  return (
    <main>
      <section className="border-b border-emerald-900/10 bg-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Tag tone="amber">Success stories</Tag>
          <h1 className="font-display mt-6 max-w-5xl text-6xl leading-[.93] sm:text-8xl">Your story does not need to begin with certainty.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-100/85">It can begin with one honest conversation about cost, one researched college, and one task completed this week.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <Surface className="overflow-hidden border-emerald-900/15">
          <div className="story-invitation grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">A space worth earning</p>
              <h2 className="font-display mt-4 max-w-3xl text-5xl leading-[.96] text-emerald-950 sm:text-7xl">You could be here.</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">Not as a manufactured statistic or a perfect-profile myth. As a student who made thoughtful decisions, asked for help early, and built a path your family could sustain.</p>
            </div>
            <div className="rounded-3xl bg-emerald-950 p-6 text-emerald-50">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Start where you are</p>
              <p className="font-display mt-3 text-3xl leading-tight">Progress is quieter than hype. It is also more useful.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/roadmap" variant="secondary" className="story-cta-primary">Start my roadmap</ButtonLink>
                <ButtonLink href="/colleges" variant="ghost" className="story-cta-ghost">Explore colleges</ButtonLink>
              </div>
            </div>
          </div>
        </Surface>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <StoryPrinciple title="Real journeys only" text="Stories will be published only with student consent and evidence the team can review. Until then, the page stays honest about what is still being built." />
          <StoryPrinciple title="Useful over impressive" text="Future stories should show decisions, tradeoffs, mistakes, and practical lessons rather than flattening a student into scores and logos." />
          <StoryPrinciple title="Many valid outcomes" text="A sustainable, well-researched option matters more than prestige theater. There is no single correct shape for a successful journey." />
        </div>
      </section>
    </main>
  );
}

function StoryPrinciple({ title, text }: { title: string; text: string }) {
  return <Surface className="p-6"><h2 className="font-display text-3xl text-emerald-950">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></Surface>;
}
