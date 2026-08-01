import { AdminEditor, type EditorialEntry } from "@/components/admin-editor";
import { AuthPanel } from "@/components/auth-panel";
import { Surface, Tag } from "@/components/ui";
import { getCurrentRole, getCurrentUser, getServiceSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Editorial Workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [user, role] = await Promise.all([getCurrentUser(), getCurrentRole()]);
  const allowed = role && ["admin", "editor", "reviewer"].includes(role);
  let entries: EditorialEntry[] = [];
  if (allowed) {
    const supabase = getServiceSupabase();
    const { data } = supabase ? await supabase.from("content_entries").select("slug,content_type,title,summary,body,status,last_verified_at,next_review_at").order("updated_at", { ascending: false }).limit(100) : { data: null };
    entries = (data ?? []).map((item) => ({
      slug: item.slug,
      contentType: item.content_type,
      title: item.title,
      summary: item.summary,
      body: JSON.stringify(item.body, null, 2),
      status: item.status as EditorialEntry["status"],
      lastVerifiedAt: item.last_verified_at ?? "2026-08-01",
      nextReviewAt: item.next_review_at ?? ""
    }));
  }
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 sm:py-14">
      <Tag tone="amber">Protected workspace</Tag>
      <h1 className="font-display mt-5 text-6xl leading-[.94] text-emerald-950 sm:text-7xl">Editorial control room.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Draft, review, source, version, and publish guidance without mixing unfinished work into the public field guide.</p>
      <div className="mt-9">{allowed ? <AdminEditor role={role} entries={entries} /> : <Surface className="max-w-xl p-6"><h2 className="font-display text-3xl text-emerald-950">{user ? "Your account does not have editorial access." : "Sign in with an editorial account."}</h2><p className="mt-3 text-sm leading-7 text-slate-600">The publishing workspace is restricted to the BD2US editorial team.</p>{!user ? <div className="mt-5"><AuthPanel /></div> : null}</Surface>}</div>
    </main>
  );
}
