import type { ContentBlock } from "@/lib/types";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-bd2us">
      {blocks.map((block, index) => {
        if (block.type === "html") return <div className="legacy-content" dangerouslySetInnerHTML={{ __html: block.html }} key={index} />;
        if (block.type === "heading") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "paragraph") return <p key={index}>{block.text}</p>;
        if (block.type === "checklist") {
          return (
            <div key={index} className="my-7 rounded-2xl border border-emerald-900/15 bg-emerald-50/70 p-5">
              <h3 className="!mt-0">{block.title}</h3>
              <ul className="mt-3">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          );
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag className={block.marker ? `list-${block.marker}` : undefined} key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item.text}-${itemIndex}`}>
                  {item.text}
                  {item.children?.length ? <ContentBlocks blocks={item.children} /> : null}
                </li>
              ))}
            </Tag>
          );
        }
        const styles = {
          note: "border-sky-700/20 bg-sky-50 text-sky-950",
          warning: "border-amber-700/20 bg-amber-50 text-amber-950",
          tip: "border-emerald-800/20 bg-emerald-50 text-emerald-950"
        };
        return (
          <aside key={index} className={`my-7 rounded-2xl border p-5 ${styles[block.tone]}`}>
            <p className="!m-0 !text-sm font-bold uppercase tracking-[0.14em] !text-current">{block.title}</p>
            <p className="!mb-0 !mt-2 !text-base !leading-7 !text-current">{block.text}</p>
          </aside>
        );
      })}
    </div>
  );
}
