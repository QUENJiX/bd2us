import Link from "next/link";
import { glossaryTerm } from "@/lib/glossary";
import type { GuideEnhancement } from "@/lib/guide-enhancements";

export function GuideEnhancements({ enhancement }: { enhancement: GuideEnhancement }) {
  return (
    <div className="guide-layers">
      <section id="start-here" className="guide-layer is-beginner">
        <p className="eyebrow">Start here · plain-language version</p>
        <h2>The idea before the details</h2>
        <p>{enhancement.beginner}</p>
        {enhancement.vocabulary.length ? (
          <div className="glossary-strip">
            <p className="eyebrow">Essential vocabulary</p>
            <div>{enhancement.vocabulary.map((term) => {
              const item = glossaryTerm(term);
              return item ? <details key={term}><summary>{item.term}</summary><p>{item.definition}</p><p lang="bn">{item.bangla}</p></details> : null;
            })}</div>
          </div>
        ) : null}
      </section>

      <details id="deeper-explanation" className="advanced-layer" open>
        <summary><span>Deeper explanation</span><small>Nuance, tradeoffs, and exceptions</small></summary>
        <div>{enhancement.deeper.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </details>

      <section id="bangladesh-context" className="guide-layer bangladesh-layer">
        <p className="eyebrow">Bangladesh context</p>
        <h2>Translate the advice into your reality</h2>
        <p>{enhancement.bangladesh}</p>
      </section>

      <aside className="community-perspective">
        <p className="eyebrow">Community perspective · not official policy</p>
        <p>{enhancement.communityInsight}</p>
      </aside>

      <section id="common-mistakes" className="guide-layer mistakes-layer">
        <p className="eyebrow">Common mistakes</p>
        <h2>Know the traps before they cost you time.</h2>
        <ul>{enhancement.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
      </section>

      <section id="worksheet" className="worksheet-layer">
        <div><p className="eyebrow">Practical artifact</p><h2>{enhancement.worksheetTitle}</h2><p>Copy this into your notes, print the page, or use it as the next-action checklist.</p></div>
        <ol>{enhancement.worksheetItems.map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <p className="guide-integrity-note">Community guides and admissions discussions informed the editorial questions behind this section. BD2US has synthesized the ideas in its own words; changing requirements must be confirmed through the dated official sources below. <Link href="/about">How BD2US handles evidence →</Link></p>
    </div>
  );
}
