import type { Metadata } from "next";
import { JourneyRail } from "@/components/journey-rail";
import { RoadmapExplorer } from "@/components/roadmap-explorer";
import { Tag } from "@/components/ui";

export const metadata: Metadata = {
  title: "Interactive Roadmap",
  description: "A personalized, Bangladesh-specific U.S. college application roadmap from orientation through arrival."
};

export default function RoadmapPage() {
  return (
    <main id="main-content">
      <section className="paper-grid border-b border-emerald-950/10">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <Tag>Interactive planning workspace</Tag>
          <h1 className="font-display mt-5 max-w-4xl text-5xl leading-[.96] text-emerald-950 sm:text-7xl">The whole journey, made workable.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Move stage by stage from first research to arrival in the U.S. Mark tasks complete, return to the right guide, and keep momentum without turning your life into a spreadsheet maze.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6"><JourneyRail compact /></div>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <RoadmapExplorer />
      </section>
    </main>
  );
}
