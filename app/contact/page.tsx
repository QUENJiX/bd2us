import { ContactForm } from "@/components/contact-form";
import { Surface, Tag } from "@/components/ui";
import { founderEmail } from "@/lib/site";

export const metadata = { title: "Contact", description: "Send corrections, questions, and partnership inquiries to the BD2US team." };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <Tag tone="amber">Contact BD2US</Tag>
          <h1 className="font-display mt-5 text-6xl leading-[.94] text-emerald-950">Help us keep the guide useful.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">Send a correction, flag a stale source, report a technical issue, or start a thoughtful partnership conversation.</p>
          <div className="mt-6 border-l-2 border-amber-700 pl-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Reach the founder directly</p>
            <a href={`mailto:${founderEmail}`} className="inline-flex min-h-11 items-center break-all text-lg font-bold text-emerald-900 underline underline-offset-4">{founderEmail}</a>
          </div>
          <Surface className="mt-7 p-5">
            <p className="text-sm font-bold text-emerald-950">A note on personalized advising</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">BD2US is a public guide, not an admissions consulting inbox. The fastest answers usually begin in the roadmap, FAQ, or search.</p>
          </Surface>
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
