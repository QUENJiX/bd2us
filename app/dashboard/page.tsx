import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { JourneyRail } from "@/components/journey-rail";

export const metadata = { title: "My Plan", description: "Track your BD2US roadmap, saved colleges, and personal deadlines." };

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Student workspace</p>
      <h1 className="font-display mt-4 text-6xl leading-[.94] text-emerald-950 sm:text-7xl">Keep the moving parts under control.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Your public reading experience works without an account. Sign in only when you want a private, synced planning workspace.</p>
      <div className="mt-8"><JourneyRail compact /></div>
      <div className="mt-9"><DashboardWorkspace /></div>
    </main>
  );
}
