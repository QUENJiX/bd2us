"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ActionButton } from "@/components/ui";

type Workflow = "draft" | "in_review" | "published" | "stale";
export type EditorialEntry = { slug: string; contentType: string; title: string; summary: string; body: string; status: Workflow; lastVerifiedAt: string; nextReviewAt: string };
const blank: EditorialEntry = { slug: "", contentType: "guide", title: "", summary: "", body: '[\n  { "type": "paragraph", "text": "Start with a clear explanation." },\n  { "type": "checklist", "title": "Next steps", "items": ["Verify the official source"] }\n]', status: "draft", lastVerifiedAt: "2026-08-01", nextReviewAt: "" };

export function AdminEditor({ role, entries }: { role: string; entries: EditorialEntry[] }) {
  const [entry, setEntry] = useState<EditorialEntry>(blank);
  const [sourceLabel, setSourceLabel] = useState("Official source");
  const [sourceUrl, setSourceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const parsed = useMemo(() => { try { return JSON.parse(entry.body) as Array<Record<string, unknown>>; } catch { return null; } }, [entry.body]);

  function choose(slug: string) { setEntry(entries.find((item) => item.slug === slug) ?? blank); setMessage(""); }
  function update<Key extends keyof EditorialEntry>(key: Key, value: EditorialEntry[Key]) { setEntry((current) => ({ ...current, [key]: value })); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!parsed) return setMessage("Body blocks must be valid JSON before saving.");
    setMessage("Saving a versioned draft…");
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...entry, sourceLabel, sourceUrl }) });
    const payload = (await response.json()) as { error?: string };
    setMessage(response.ok ? "Saved. Published entries now feed the public chapter layer." : payload.error ?? "Could not save.");
  }

  return (
    <div className="editorial-workspace">
      <aside className="editorial-index">
        <p className="eyebrow">Content library</p>
        <button type="button" className={!entry.slug ? "is-active" : ""} onClick={() => choose("")}>+ New entry</button>
        {entries.map((item) => <button type="button" className={entry.slug === item.slug ? "is-active" : ""} onClick={() => choose(item.slug)} key={item.slug}><strong>{item.title}</strong><span>{item.contentType} · {item.status.replace("_", " ")}</span></button>)}
      </aside>
      <form className="editorial-form" onSubmit={save}>
        <div className="editorial-form-heading"><div><p className="eyebrow">Structured, sourced, versioned</p><h2>{entry.slug ? `Edit ${entry.title}` : "Create a guidance entry"}</h2></div><button className="button-secondary" onClick={() => setPreview(!preview)} type="button">{preview ? "Return to fields" : "Preview draft"}</button></div>
        {preview ? <EditorPreview entry={entry} blocks={parsed} /> : <>
          <Field label="Title" value={entry.title} onChange={(value) => update("title", value)} required />
          <div className="editorial-pair"><Field label="Slug" value={entry.slug} onChange={(value) => update("slug", value)} required /><Field label="Content type" value={entry.contentType} onChange={(value) => update("contentType", value)} required /></div>
          <label><span>Summary</span><textarea value={entry.summary} onChange={(event) => update("summary", event.target.value)} required /></label>
          <label><span>Structured body blocks</span><textarea className="code-field" value={entry.body} onChange={(event) => update("body", event.target.value)} required /></label>
          <div className="editorial-pair"><Field label="Source label" value={sourceLabel} onChange={setSourceLabel} /><Field label="Official source URL" type="url" value={sourceUrl} onChange={setSourceUrl} /></div>
          <div className="editorial-pair"><Field label="Last verified" type="date" value={entry.lastVerifiedAt} onChange={(value) => update("lastVerifiedAt", value)} /><Field label="Next review" type="date" value={entry.nextReviewAt} onChange={(value) => update("nextReviewAt", value)} /></div>
        </>}
        <div className="editorial-actions"><label><span>Workflow</span><select value={entry.status} onChange={(event) => update("status", event.target.value as Workflow)}><option value="draft">Draft</option><option value="in_review">In review</option><option value="published">Published</option><option value="stale">Stale</option></select></label><ActionButton type="submit">Save version</ActionButton><p aria-live="polite">{message}</p></div>
      </form>
      <aside className="editorial-checks"><p className="eyebrow">Signed-in role</p><h2>{role}</h2><p>Publishing checklist</p><ul><li>Official source attached where facts change</li><li>Last-reviewed date is accurate</li><li>Plain-language next action exists</li><li>Bangladesh context is specific</li><li>Mobile preview remains readable</li></ul></aside>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>; }
function EditorPreview({ entry, blocks }: { entry: EditorialEntry; blocks: Array<Record<string, unknown>> | null }) { return <div className="editor-preview"><p className="eyebrow">{entry.contentType} · {entry.status.replace("_", " ")}</p><h3>{entry.title || "Untitled entry"}</h3><p>{entry.summary || "Add a useful summary."}</p><div>{blocks?.map((block, index) => <div key={index}>{block.type === "heading" ? <h4>{String(block.text ?? "")}</h4> : block.type === "checklist" ? <ul>{Array.isArray(block.items) ? block.items.map((item) => <li key={String(item)}>{String(item)}</li>) : null}</ul> : <p>{String(block.text ?? "")}</p>}</div>) ?? <p className="text-red-800">Body JSON is invalid.</p>}</div></div>; }
