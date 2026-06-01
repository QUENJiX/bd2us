"use client";

import { useState, type FormEvent } from "react";
import { ActionButton, Surface, Tag } from "@/components/ui";

type Workflow = "draft" | "in_review" | "published" | "stale";

export function AdminEditor({ role }: { role: string }) {
  const [status, setStatus] = useState<Workflow>("draft");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving...");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, status })
    });
    const payload = (await response.json()) as { error?: string };
    setMessage(response.ok ? "Saved to the editorial workspace." : payload.error ?? "Could not save.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form className="card grid gap-5 p-6" onSubmit={save}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Tag tone="amber">Structured editor</Tag><h2 className="font-display mt-3 text-4xl text-emerald-950">Create a guidance entry</h2></div>
          <button className="rounded-full border border-emerald-900/15 px-4 py-2 text-sm font-bold text-emerald-900" onClick={() => setPreview(!preview)} type="button">{preview ? "Edit mode" : "Preview"}</button>
        </div>
        {preview ? <EditorPreview /> : <>
          <Field label="Title" name="title" placeholder="Write a direct, useful title" required />
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Slug" name="slug" placeholder="guide-slug" required /><Field label="Content type" name="contentType" placeholder="guide" required /></div>
          <label className="text-sm font-bold text-slate-700">Summary<textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm" name="summary" required /></label>
          <label className="text-sm font-bold text-slate-700">Body blocks<textarea className="mt-2 min-h-72 w-full rounded-xl border border-slate-200 p-3 font-mono text-sm" defaultValue={'[\n  { "type": "paragraph", "text": "Start with a clear explanation." },\n  { "type": "checklist", "title": "Next steps", "items": ["Verify official source"] }\n]'} name="body" required /></label>
          <Field label="Official source URL" name="sourceUrl" placeholder="https://..." type="url" />
        </>}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Workflow
            <select className="ml-2 min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold normal-case tracking-normal text-slate-700" value={status} onChange={(event) => setStatus(event.target.value as Workflow)}>
              <option value="draft">Draft</option><option value="in_review">In review</option><option value="published">Published</option><option value="stale">Stale</option>
            </select>
          </label>
          <ActionButton type="submit">Save entry</ActionButton>
          {message ? <p className="text-sm font-bold text-emerald-800">{message}</p> : null}
        </div>
      </form>
      <aside className="grid content-start gap-4">
        <Surface className="p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Signed-in role</p><p className="font-display mt-2 text-3xl capitalize text-emerald-950">{role}</p><p className="mt-2 text-sm leading-6 text-slate-600">Editors can draft and submit review entries. Only admin and editor roles can publish. Reviewers can inspect and return entries for changes.</p></Surface>
        <Surface className="p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Publishing checklist</p><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600"><li>✓ Official source attached</li><li>✓ Changing facts dated</li><li>✓ Clear next action</li><li>✓ Mobile preview checked</li></ul></Surface>
      </aside>
    </div>
  );
}

function Field({ label, ...props }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="text-sm font-bold text-slate-700">{label}<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" {...props} /></label>;
}

function EditorPreview() {
  return <div className="rounded-3xl border border-emerald-900/10 bg-[#fffdf8] p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Desktop and mobile preview</p><h3 className="font-display mt-3 text-4xl text-emerald-950">A readable entry begins with a clear promise.</h3><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Structured content blocks become consistent paragraphs, callouts, checklists, tables, cited resources, and restrained calls to action in the public reader.</p></div>;
}
