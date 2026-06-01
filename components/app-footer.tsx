import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-20 border-t border-emerald-950/10 bg-[#f4f0e6]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <Link href="/" className="font-display text-3xl font-bold text-emerald-950">
            BD<span className="text-amber-700">2</span>US
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Clear, Bangladesh-specific guidance for the long road from first research to your first week in the U.S.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="grid content-start gap-3">
            <p className="font-bold text-emerald-950">Explore</p>
            <Link href="/roadmap">Roadmap</Link>
            <Link href="/colleges">Colleges</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <div className="grid content-start gap-3">
            <p className="font-bold text-emerald-950">Trust</p>
            <Link href="/about">About</Link>
            <Link href="/success-stories">Success stories</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-emerald-950/10 px-4 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} BD2US. Verify changing admissions requirements on each college&apos;s official site.
      </div>
    </footer>
  );
}
