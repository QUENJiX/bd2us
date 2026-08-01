"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { roadmapStages, roadmapTasks } from "@/lib/content";

const stageWindows: Record<string, string> = {
  orientation: "Now",
  timeline: "Aug 2026",
  research: "Aug–Sep",
  academics: "Aug–Oct",
  testing: "Aug–Nov",
  profile: "Aug–Oct",
  essays: "Sep–Dec",
  applications: "Oct–Jan",
  aid: "Oct–Feb",
  decisions: "Mar–May 2027",
  visa: "May–Jul",
  arrival: "Aug 2027"
};

export function JourneyRail({ compact = false }: { compact?: boolean }) {
  const [complete, setComplete] = useState<string[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setComplete(JSON.parse(window.localStorage.getItem("bd2us-roadmap-progress") ?? "[]")); } catch { setComplete([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const activeIndex = useMemo(() => {
    const index = roadmapStages.findIndex((stage) => stage.taskIds.some((taskId) => !complete.includes(taskId)));
    return index < 0 ? roadmapStages.length - 1 : index;
  }, [complete]);
  const active = roadmapStages[activeIndex];
  const remaining = roadmapTasks.length - complete.length;

  return (
    <section className={compact ? "journey-rail is-compact" : "journey-rail"} aria-label="Fall 2027 application journey">
      <div className="journey-rail-heading">
        <div><p className="eyebrow">Fall 2027 field guide</p><p><strong>You are here:</strong> {active.title}</p></div>
        <Link href="/roadmap">{remaining > 0 ? `${remaining} actions left` : "Journey complete"} →</Link>
      </div>
      <ol>
        {roadmapStages.map((stage, index) => {
          const isComplete = stage.taskIds.every((taskId) => complete.includes(taskId));
          return (
            <li className={index === activeIndex ? "is-current" : isComplete ? "is-complete" : ""} key={stage.id}>
              <Link href={`/roadmap#stage-${stage.id}`} aria-current={index === activeIndex ? "step" : undefined}>
                <span>{isComplete ? "✓" : stage.number}</span>
                <div><strong>{stage.title}</strong><small>{stageWindows[stage.id]}</small></div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
