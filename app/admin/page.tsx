import { AdminEditor } from "@/components/admin-editor";
import { AuthPanel } from "@/components/auth-panel";
import { Surface, Tag } from "@/components/ui";
import { getCurrentRole, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Editorial Workspace", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const [user, role] = await Promise.all([getCurrentUser(), getCurrentRole()]);
  const allowed = role && ["admin", "editor", "reviewer"].includes(role);
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <Tag tone="amber">Protected workspace</Tag>
      <h1 className="font-display mt-5 text-6xl leading-[.94] text-emerald-950 sm:text-7xl">Editorial control room.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Draft, review, source, and publish guidance without mixing unverified work into the public platform.</p>
      <div className="mt-9">
        {allowed ? <AdminEditor role={role} /> : <Surface className="max-w-xl p-6"><h2 className="font-display text-3xl text-emerald-950">{user ? "Your account does not have editorial access." : "Sign in with an editorial account."}</h2><p className="mt-3 text-sm leading-7 text-slate-600">The publishing workspace is restricted to the BD2US editorial team.</p>{!user ? <div className="mt-5"><AuthPanel /></div> : null}</Surface>}
      </div>
    </main>
  );
}
