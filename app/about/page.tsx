import Image from "next/image";
import { ButtonLink, SectionHeading, Surface, Tag } from "@/components/ui";

const principles = [
  ["Experience made useful", "The guide turns the team's practical knowledge, mentoring experience, and inside understanding of the process into clear action."],
  ["Sources where they matter", "Changing college facts, deadlines, and government procedures should point back to the institution or agency responsible for them."],
  ["Bangladesh-specific context", "The advice is written for the questions, constraints, curricula, and planning realities Bangladeshi students actually face."],
  ["A complete public guide", "BD2US remains independently useful. ColApp, built by the same team, is available when a student wants a more personalized companion."]
];

const team = [
  {
    name: "Hasibul Islam",
    role: "Founder and lead developer",
    photo: "/assets/images/team/mentor1.png",
    focalPosition: "50% 24%",
    text: "Product direction, platform development, and student-first editorial systems.",
    credentials: ["Lead mentor", "SAT 1480 / 1600"]
  },
  {
    name: "Samin Rahman",
    role: "Lead mentor",
    photo: "/assets/images/team/founder.jpg",
    focalPosition: "50% 20%",
    text: "Application journey guidance and practical student context.",
    credentials: ["The University of Texas at Dallas", "SAT 1550 / 1600"]
  },
  {
    name: "Muaz Bin Anis",
    role: "Admissions and visa mentor",
    photo: "/assets/images/team/mentor4.jpg",
    focalPosition: "50% 22%",
    text: "Post-admission preparation and visa-focused guidance.",
    credentials: ["The University of Alabama", "SAT 1460 / 1600"]
  },
  {
    name: "Mohtasim Hafiz",
    role: "SAT and admissions mentor",
    photo: "/assets/images/team/mentor3.jpg",
    focalPosition: "50% 18%",
    text: "Testing strategy and application planning.",
    credentials: ["Georgetown University", "SAT 1540 / 1600"]
  }
];

export const metadata = { title: "About", description: "Learn how BD2US creates source-backed, Bangladesh-specific U.S. college application guidance." };

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-emerald-900/10 bg-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Tag tone="amber">About BD2US</Tag>
          <h1 className="font-display mt-6 max-w-5xl text-6xl leading-[.93] sm:text-8xl">Make the process clearer. Keep the truth visible.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-100/85">BD2US is a public-first guide for Bangladeshi students navigating U.S. college applications, financial aid, visa steps, and arrival with fewer blind spots.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <SectionHeading eyebrow="Editorial standard" title="Trust is a product feature." description="A beautiful guide is not enough. Students need to understand which statements are stable guidance, which facts can change, and where to verify them." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {principles.map(([title, description]) => <Surface className="p-6" key={title}><h2 className="font-display text-3xl text-emerald-950">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{description}</p></Surface>)}
        </div>
      </section>
      <section className="border-y border-emerald-900/10 bg-[#f4f0e6]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <SectionHeading eyebrow="Methodology" title="How the guide stays grounded." />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Method number="01" title="Organize" text="Turn the full journey into readable guidance, roadmap tasks, and college research records." />
            <Method number="02" title="Source" text="Attach official links and verification dates to changing facts. Keep assumptions labeled as assumptions." />
            <Method number="03" title="Review" text="Publish through draft, review, and verified states. Flag stale records for editorial attention." />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <SectionHeading eyebrow="Team" title="A small team with a practical brief." description="We are the BD2US team: mentors and builders turning direct experience into a clearer path for students." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <Surface className="overflow-hidden" key={member.name}>
              <Image className="h-60 w-full bg-[var(--surface-inset)] object-cover" style={{ objectPosition: member.focalPosition }} src={member.photo} alt={`${member.name} portrait`} width={640} height={480} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
              <div className="p-5">
                <h2 className="font-display text-2xl text-emerald-950">{member.name}</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-amber-700">{member.role}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{member.text}</p>
                <ul className="mt-4 space-y-2 border-t border-emerald-900/10 pt-4 text-xs font-bold leading-5 text-emerald-900">
                  {member.credentials.map((credential) => <li key={credential}>{credential}</li>)}
                </ul>
              </div>
            </Surface>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <Surface className="grid gap-5 border-emerald-900/15 bg-emerald-50 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Built by the same team</p><h2 className="font-display mt-2 text-4xl text-emerald-950">BD2US stands on its own. ColApp goes deeper.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">BD2US is the complete public guide. ColApp is our companion app for students who want a more personalized layer of support.</p></div>
          <ButtonLink href="/contact" variant="secondary">Contact the team</ButtonLink>
        </Surface>
      </section>
    </main>
  );
}

function Method({ number, title, text }: { number: string; title: string; text: string }) {
  return <div><p className="font-display text-5xl text-amber-700">{number}</p><h3 className="font-display mt-2 text-3xl text-emerald-950">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></div>;
}
