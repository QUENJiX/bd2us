import { resources } from "@/lib/content";
import { SectionHeading, Surface, Tag } from "@/components/ui";

export const metadata = { title: "Resources", description: "Official resources for planning U.S. college applications, financial aid, testing, and student visas." };

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <SectionHeading eyebrow="Official resources" title="Keep the primary sources close." description="BD2US organizes the journey. These official links remain the final word for changing forms, requirements, and government steps." />
      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        {resources.map(([title, summary, url]) => (
          <Surface className="p-5" key={url}>
            <Tag tone="neutral">External resource</Tag>
            <h2 className="font-display mt-3 text-2xl text-emerald-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{summary}</p>
            <a className="mt-4 inline-flex text-sm font-bold text-emerald-900 underline decoration-emerald-300 underline-offset-4" href={url} rel="noreferrer" target="_blank">Open official page ↗</a>
          </Surface>
        ))}
      </div>
    </main>
  );
}
