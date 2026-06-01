"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { defaultProfile } from "@/lib/content";
import type { StudentProfile } from "@/lib/types";

export function HeroPlanner() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);

  function update(key: Exclude<keyof StudentProfile, "interests">, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function begin() {
    window.localStorage.setItem("bd2us-profile", JSON.stringify(profile));
    router.push("/roadmap");
  }

  return (
    <div className="card mt-8 grid gap-4 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5">
      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-900">
        Your curriculum
        <select
          value={profile.curriculum}
          onChange={(event) => update("curriculum", event.target.value)}
          className="min-h-12 rounded-xl border border-emerald-950/15 bg-white px-3 text-sm font-bold normal-case tracking-normal text-slate-700"
        >
          <option>SSC / HSC</option>
          <option>O Levels / A Levels</option>
          <option>IB</option>
          <option>Other curriculum</option>
        </select>
      </label>
      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-900">
        Target intake
        <select
          value={profile.targetIntake}
          onChange={(event) => update("targetIntake", event.target.value)}
          className="min-h-12 rounded-xl border border-emerald-950/15 bg-white px-3 text-sm font-bold normal-case tracking-normal text-slate-700"
        >
          <option>Fall 2027</option>
          <option>Fall 2028</option>
          <option>Fall 2029</option>
          <option>Still exploring</option>
        </select>
      </label>
      <button
        type="button"
        onClick={begin}
        className="min-h-12 rounded-xl bg-emerald-900 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(6,78,59,.2)] hover:-translate-y-0.5 hover:bg-emerald-800"
      >
        Start my roadmap
      </button>
    </div>
  );
}
