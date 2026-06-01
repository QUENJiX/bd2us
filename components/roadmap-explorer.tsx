"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultProfile, roadmapStages, roadmapTasks } from "@/lib/content";
import type { StudentProfile } from "@/lib/types";

function readProgress() {
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem("bd2us-roadmap-progress") ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

export function RoadmapExplorer() {
  const [complete, setComplete] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "open" | "complete">("all");
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setComplete(readProgress());
      try {
        const saved = window.localStorage.getItem("bd2us-profile");
        if (saved) setProfile(JSON.parse(saved));
      } catch {
        // Keep safe defaults when local profile data is malformed.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const percent = Math.round((complete.size / roadmapTasks.length) * 100);
  const visibleStages = useMemo(
    () =>
      roadmapStages.map((stage) => ({
        ...stage,
        tasks: roadmapTasks
          .filter((task) => task.stageId === stage.id)
          .filter((task) => filter === "all" || (filter === "complete" ? complete.has(task.id) : !complete.has(task.id)))
      })),
    [complete, filter]
  );

  function toggle(taskId: string) {
    const next = new Set(complete);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setComplete(next);
    window.localStorage.setItem("bd2us-roadmap-progress", JSON.stringify([...next]));
  }

  return (
    <div>
      <div className="card grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">{profile.curriculum} · {profile.targetIntake}</p>
          <p className="font-display mt-2 text-3xl font-bold text-emerald-950">Your progress: {percent}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-950/10">
            <div className="h-full rounded-full bg-emerald-700 transition-[width]" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{complete.size} of {roadmapTasks.length} tasks complete. Guest progress stays on this device until you sign in.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "open", "complete"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`min-h-10 rounded-full px-4 text-sm font-bold capitalize ${filter === value ? "bg-emerald-900 text-white" : "border border-emerald-950/15 bg-white text-emerald-950"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-10 grid gap-6 before:absolute before:bottom-4 before:left-[1.15rem] before:top-4 before:w-px before:bg-emerald-950/15 sm:before:left-[1.4rem]">
        {visibleStages.map((stage) => (
          <section key={stage.id} className="relative grid grid-cols-[2.4rem_1fr] gap-4 sm:grid-cols-[3rem_1fr]">
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow sm:h-12 sm:w-12" style={{ background: stage.accent }}>
              {stage.number}
            </div>
            <div className="card overflow-hidden">
              <div className="border-b border-emerald-950/10 p-5">
                <h2 className="font-display text-3xl font-bold text-emerald-950">{stage.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{stage.summary}</p>
              </div>
              {stage.tasks.length ? (
                <div className="grid divide-y divide-emerald-950/10">
                  {stage.tasks.map((task) => (
                    <div id={task.id} key={task.id} className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                      <button
                        type="button"
                        onClick={() => toggle(task.id)}
                        aria-label={`${complete.has(task.id) ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
                        className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold ${complete.has(task.id) ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-950/20 bg-white text-transparent"}`}
                      >
                        ✓
                      </button>
                      <div>
                        <p className={`font-bold text-emerald-950 ${complete.has(task.id) ? "line-through opacity-60" : ""}`}>{task.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{task.description}</p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-amber-700">{task.dueHint}</p>
                      </div>
                      <Link href={`/guide/${task.guideSlug}`} className="text-sm font-bold text-emerald-800 underline underline-offset-4">
                        Read guide
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm text-slate-500">No tasks in this view.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
