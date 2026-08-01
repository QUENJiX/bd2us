import Link from "next/link";

export const metadata = { title: "Privacy", description: "How BD2US handles account, planning, contact, and device data." };

export default function PrivacyPage() {
  return (
    <main className="legal-page mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow">Privacy</p>
      <h1>What BD2US stores—and what stays on your device.</h1>
      <p className="legal-updated">Effective August 1, 2026</p>
      <section><h2>Using BD2US without an account</h2><p>You can read guides, search, explore colleges, and plan as a guest. Guest progress, saved colleges, notes, bookmarks, and preferences are stored in your browser. Clearing site data or changing devices can remove that local information.</p></section>
      <section><h2>Optional accounts</h2><p>If you create an account, BD2US uses Supabase to provide authentication and synchronize the profile and planning information you choose to save. This can include roadmap progress, saved colleges, list stages, private notes, custom deadlines, bookmarks, and chapter completion.</p></section>
      <section><h2>Contact messages</h2><p>The contact form stores your name, email address, subject, and message so the BD2US team can respond. Do not submit passwords, financial documents, passport details, or other highly sensitive information.</p></section>
      <section><h2>Search privacy</h2><p>BD2US does not store the words you type into search as analytics. A search request may still pass through normal hosting and database infrastructure needed to return results.</p></section>
      <section><h2>Service providers and links</h2><p>BD2US relies on service providers including Vercel for hosting and Supabase for optional accounts and stored messages. Official-resource and college links take you to third-party websites with their own privacy practices.</p></section>
      <section><h2>Retention, deletion, and age</h2><p>Account information is kept while your account is active or as reasonably needed to provide and protect the service. You can request deletion through the account controls or <Link href="/contact">contact form</Link>. BD2US is for people aged 13 or older; applicants under the age of legal majority should involve a parent or guardian when sharing personal information or making application decisions.</p></section>
      <section><h2>Questions and changes</h2><p>Use the <Link href="/contact">contact form</Link> for privacy requests. Material changes will be reflected on this page with a new effective date.</p></section>
    </main>
  );
}
