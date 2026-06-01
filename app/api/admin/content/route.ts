import { NextResponse } from "next/server";
import { getCurrentRole, getCurrentUser, getServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const role = await getCurrentRole();
  if (!role || !["admin", "editor", "reviewer"].includes(role)) return NextResponse.json({ error: "Editorial access required." }, { status: 403 });
  const payload = (await request.json()) as { slug?: string; contentType?: string; title?: string; summary?: string; body?: string; sourceUrl?: string; status?: string };
  if (!payload.slug || !payload.title || !payload.summary || !payload.contentType) return NextResponse.json({ error: "Complete the required fields." }, { status: 400 });
  if (payload.status === "published" && !["admin", "editor"].includes(role)) return NextResponse.json({ error: "Reviewer accounts cannot publish entries." }, { status: 403 });
  let body: unknown = [];
  try { body = JSON.parse(payload.body ?? "[]"); } catch { return NextResponse.json({ error: "Body blocks must be valid JSON." }, { status: 400 }); }
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "Supabase service credentials are required to save editorial content." }, { status: 503 });
  const now = new Date().toISOString();
  const { data: entry, error } = await supabase.from("content_entries").upsert({
    slug: payload.slug,
    content_type: payload.contentType,
    title: payload.title,
    summary: payload.summary,
    body: body as never,
    status: payload.status ?? "draft",
    published_at: payload.status === "published" ? now : null,
    updated_at: now
  }, { onConflict: "slug" }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const user = await getCurrentUser();
  await supabase.from("content_versions").insert({ content_entry_id: entry.id, editor_id: user?.id ?? null, snapshot: { ...payload, body } as never });
  await supabase.from("audit_log").insert({ actor_id: user?.id ?? null, action: "content.saved", entity_type: "content_entry", entity_id: entry.id, payload: { status: payload.status ?? "draft" } });
  if (payload.sourceUrl) await supabase.from("content_sources").insert({ content_entry_id: entry.id, label: "Official source", url: payload.sourceUrl, last_verified_at: now.slice(0, 10) });
  return NextResponse.json({ ok: true });
}
