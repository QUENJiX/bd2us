import { JourneyRail } from "@/components/journey-rail";
import { resources } from "@/lib/content";
import type { OfficialResource } from "@/lib/types";

export const metadata = { title: "Official Admissions Resources", description: "Official resources for U.S. college research, applications, financial aid, testing, student visas, and arrival." };

const categories: OfficialResource["category"][] = ["Start in Bangladesh", "College research", "Applications", "Testing", "Financial aid", "Visa and arrival"];

export default function ResourcesPage() {
  return (
    <main id="main-content">
      <section className="catalog-hero"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"><p className="eyebrow">Primary-source desk · {resources.length} links</p><h1>Keep the official answer one click away.</h1><p className="catalog-deck">Use BD2US to understand the process, then use the institution, testing agency, application platform, or government page responsible for the rule before you act.</p></div></section>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6"><JourneyRail compact /></div>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="resource-use-strip">
          <div><span>01</span><strong>Learn</strong><p>Read the BD2US chapter for plain-language context.</p></div>
          <div><span>02</span><strong>Verify</strong><p>Open the official source for the current cycle and your applicant type.</p></div>
          <div><span>03</span><strong>Record</strong><p>Save the URL, requirement, and date you checked it in your notes.</p></div>
        </div>

        <nav className="resource-jump" aria-label="Resource categories">
          {categories.map((category) => <a href={`#${slug(category)}`} key={category}>{category}<span>{resources.filter((resource) => resource.category === category).length}</span></a>)}
        </nav>

        <div className="resource-directory">
          {categories.map((category, categoryIndex) => (
            <section id={slug(category)} key={category}>
              <header><p className="eyebrow">Desk {String(categoryIndex + 1).padStart(2, "0")}</p><h2>{category}</h2></header>
              <div>{resources.filter((resource) => resource.category === category).map((resource) => <ResourceRecord resource={resource} key={resource.url} />)}</div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

function ResourceRecord({ resource }: { resource: OfficialResource }) {
  return (
    <article>
      <div><p className="eyebrow">{resource.stage}</p><h3>{resource.title}</h3><p>{resource.summary}</p>{resource.caution ? <p className="resource-caution"><strong>Use with care:</strong> {resource.caution}</p> : null}</div>
      <a href={resource.url} rel="noreferrer" target="_blank">Open official page <span aria-hidden="true">↗</span></a>
    </article>
  );
}

function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
