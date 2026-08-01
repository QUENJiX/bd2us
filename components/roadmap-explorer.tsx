"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultProfile, roadmapStages, roadmapTasks } from "@/lib/content";
import { touchProgress } from "@/lib/local-workspace";
import type { StudentProfile } from "@/lib/types";

const stageDates: Record<string, { start: string; end: string; dependency: string }> = {
  orientation: { start: "2026-08-01", end: "2026-08-07", dependency: "Start here" },
  timeline: { start: "2026-08-01", end: "2026-08-15", dependency: "After choosing an intake" },
  research: { start: "2026-08-01", end: "2026-09-30", dependency: "After agreeing on a budget range" },
  academics: { start: "2026-08-15", end: "2026-10-15", dependency: "Before requesting school documents" },
  testing: { start: "2026-08-01", end: "2026-11-30", dependency: "After checking college policies" },
  profile: { start: "2026-08-01", end: "2026-10-15", dependency: "Before entering application activities" },
  essays: { start: "2026-09-01", end: "2026-12-20", dependency: "After building an evidence inventory" },
  applications: { start: "2026-10-01", end: "2027-01-05", dependency: "After finalizing the college list" },
  aid: { start: "2026-10-01", end: "2027-02-15", dependency: "Alongside every application" },
  decisions: { start: "2027-03-01", end: "2027-05-01", dependency: "After decisions and aid offers arrive" },
  visa: { start: "2027-05-01", end: "2027-07-15", dependency: "After enrolling and receiving an I-20" },
  arrival: { start: "2027-07-01", end: "2027-08-31", dependency: "After visa and housing are confirmed" }
};

function readProgress() {
  try { return new Set<string>(JSON.parse(window.localStorage.getItem("bd2us-roadmap-progress") ?? "[]")); } catch { return new Set<string>(); }
}

export function RoadmapExplorer() {
  const [complete, setComplete] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "open" | "complete">("all");
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setComplete(readProgress());
      try { const saved = window.localStorage.getItem("bd2us-profile"); if (saved) setProfile({ ...defaultProfile, ...JSON.parse(saved) }); } catch { /* Keep safe defaults. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const cycleYear = Number(profile.targetIntake.match(/\d{4}/)?.[0] ?? 2027);
  const shift = Number.isFinite(cycleYear) ? cycleYear - 2027 : 0;
  const percent = Math.round((complete.size / roadmapTasks.length) * 100);
  const visibleStages = useMemo(() => roadmapStages.map((stage) => ({
    ...stage,
    tasks: roadmapTasks.filter((task) => task.stageId === stage.id).filter((task) => filter === "all" || (filter === "complete" ? complete.has(task.id) : !complete.has(task.id)))
  })), [complete, filter]);

  function toggle(taskId: string) {
    const next = new Set(complete);
    if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
    setComplete(next);
    window.localStorage.setItem("bd2us-roadmap-progress", JSON.stringify([...next]));
    touchProgress(taskId, !complete.has(taskId));
  }

  return (
    <div>
      <section className="roadmap-status">
        <div><p className="eyebrow">{profile.curriculum} · {profile.targetIntake}</p><h2>{percent}% of your route is marked complete.</h2><p>{complete.size} of {roadmapTasks.length} core actions. Progress stays on this device until you choose to sign in.</p></div>
        <div className="roadmap-meter" aria-label={`${percent}% complete`}><span style={{ width: `${percent}%` }} /></div>
        <div className="view-controls">{(["all", "open", "complete"] as const).map((value) => <button key={value} className={filter === value ? "is-active" : ""} type="button" onClick={() => setFilter(value)}>{value === "all" ? "All actions" : value}</button>)}</div>
      </section>

      <div className="roadmap-stages">
        {visibleStages.map((stage, stageIndex) => {
          const dates = stageDates[stage.id];
          const done = stage.taskIds.filter((id) => complete.has(id)).length;
          return (
            <section id={`stage-${stage.id}`} key={stage.id} className="roadmap-stage">
              <div className="roadmap-stage-marker"><span>{stage.number}</span></div>
              <div className="roadmap-stage-body">
                <header>
                  <div><p className="eyebrow">{dateRange(dates.start, dates.end, shift)} · {done}/{stage.taskIds.length} complete</p><h2>{stage.title}</h2><p>{stage.summary}</p></div>
                  <small>{dates.dependency}{stageIndex > 0 ? ` · follows ${roadmapStages[stageIndex - 1].title.toLowerCase()}` : ""}</small>
                </header>
                {stage.tasks.length ? <div className="roadmap-task-list">{stage.tasks.map((task) => (
                  <div id={task.id} key={task.id} className={complete.has(task.id) ? "roadmap-task is-complete" : "roadmap-task"}>
                    <button type="button" onClick={() => toggle(task.id)} aria-label={`${complete.has(task.id) ? "Mark incomplete" : "Mark complete"}: ${task.title}`}><span aria-hidden="true">✓</span></button>
                    <div><p>{task.title}</p><span>{task.description}</span><small>{task.priority} · {task.dueHint}</small></div>
                    <Link href={`/guide/${task.guideSlug}`}>Open chapter →</Link>
                  </div>
                ))}</div> : <p className="roadmap-empty">No actions in this view.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function dateRange(start: string, end: string, shift: number) {
  const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${format.format(shiftDate(start, shift))}–${format.format(shiftDate(end, shift))}`;
}
function shiftDate(value: string, years: number) { const date = new Date(`${value}T00:00:00`); date.setFullYear(date.getFullYear() + years); return date; }
