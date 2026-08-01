import Link from "next/link";

export const metadata = { title: "Terms", description: "The terms for using BD2US guidance, planning tools, and college information." };

export default function TermsPage() {
  return (
    <main className="legal-page mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow">Terms</p>
      <h1>Use BD2US as a guide, then verify every decision.</h1>
      <p className="legal-updated">Effective August 1, 2026</p>
      <section><h2>What the service provides</h2><p>BD2US provides educational guidance, college research, planning tools, and links to official sources. Accounts are optional. Features may change as the guide is improved.</p></section>
      <section><h2>No admissions or financial-aid guarantee</h2><p>BD2US does not predict admission, guarantee a scholarship, replace a college&apos;s instructions, or provide legal, immigration, or financial advice. Acceptance rates and rankings describe institutions; they are not personal probabilities or recommendations.</p></section>
      <section><h2>Changing information</h2><p>Deadlines, costs, testing rules, aid policies, visa procedures, and scholarship terms can change. Check the responsible college or government source before applying, paying, traveling, or relying on a date.</p></section>
      <section><h2>Your account and content</h2><p>You are responsible for protecting your sign-in access and for the accuracy of information you save. Private notes remain your content. Do not upload unlawful material, malicious code, or information you do not have the right to share.</p></section>
      <section><h2>Third-party services</h2><p>Links to colleges, agencies, rankings, application platforms, and testing services are provided for convenience. BD2US does not control those services or their availability, terms, decisions, or content.</p></section>
      <section><h2>Age and family involvement</h2><p>You must be at least 13 to use BD2US. Applicants under the age of legal majority should use the service with a parent or guardian, especially for accounts, payments, financial information, and binding application choices.</p></section>
      <section><h2>Availability and responsibility</h2><p>BD2US is provided on an as-available basis. To the extent permitted by law, BD2US is not responsible for decisions or losses caused by relying on outdated, incomplete, or third-party information when official verification was available.</p></section>
      <section><h2>Questions and updates</h2><p>Use the <Link href="/contact">contact form</Link> for legal questions. Continuing to use BD2US after updated terms take effect means you accept the revised terms.</p></section>
    </main>
  );
}
