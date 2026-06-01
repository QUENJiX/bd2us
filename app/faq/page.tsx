import { faqs } from "@/lib/content";
import { SectionHeading, Tag } from "@/components/ui";

export const metadata = { title: "FAQ", description: "Straight answers about using BD2US and planning a U.S. college application from Bangladesh." };

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionHeading eyebrow="Frequently asked questions" title="Short answers. No fog." description="Start here when you need a quick answer, then use the guide for the full process." />
      <div className="mt-9 grid gap-3">
        {faqs.map((faq) => (
          <details className="card group p-5 sm:p-6" key={faq.question}>
            <summary className="cursor-pointer list-none font-display text-2xl text-emerald-950">{faq.question}<span className="float-right text-xl text-amber-700 group-open:rotate-45">+</span></summary>
            <Tag className="mt-4" tone="neutral">{faq.category}</Tag>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
