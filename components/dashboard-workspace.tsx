"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AuthPanel } from "@/components/auth-panel";
import { ActionButton, Surface, Tag } from "@/components/ui";
import { colleges, defaultProfile, roadmapTasks } from "@/lib/content";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { StudentProfile } from "@/lib/types";

type Deadline = { id: string; title: string; dueAt: string };

const keys = {
  profile: "bd2us-profile",
  progress: "bd2us-roadmap-progress",
  saved: "bd2us:saved-colleges",
  notes: "bd2us:college-notes",
  deadlines: "bd2us:deadlines"
};

export function DashboardWorkspace() {
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [progress, setProgress] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("Guest plan stored on this device.");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const localProfile = readLocal<StudentProfile>(keys.profile, defaultProfile);
      const localProgress = readLocal<string[]>(keys.progress, []);
      const localSaved = readLocal<string[]>(keys.saved, []);
      const localNotes = readLocal<Record<string, string>>(keys.notes, {});
      const localDeadlines = readLocal<Deadline[]>(keys.deadlines, []);
      setProfile(localProfile);
      setProgress(localProgress);
      setSaved(localSaved);
      setDeadlines(localDeadlines);

      const supabase = getBrowserSupabase();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setAccount(data.user.email ?? "Signed-in student");
      setSyncMessage("Merging this device with your private workspace...");
      const now = new Date().toISOString();
      await supabase.from("profiles").upsert({
        id: data.user.id,
        curriculum: localProfile.curriculum,
        current_year: localProfile.currentYear,
        target_intake: localProfile.targetIntake,
        aid_band: localProfile.aidBand,
        testing_status: localProfile.testingStatus,
        interests: localProfile.interests,
        updated_at: now
      });
      const { data: remoteProgress } = await supabase.from("user_task_progress").select("task_id").eq("user_id", data.user.id).eq("completed", true);
      const mergedProgress = [...new Set([...localProgress, ...(remoteProgress ?? []).map((item) => item.task_id)])];
      if (mergedProgress.length) {
        await supabase.from("user_task_progress").upsert(mergedProgress.map((taskId) => ({
          user_id: data.user!.id, task_id: taskId, completed: true, completed_at: now, updated_at: now
        })));
      }
      setProgress(mergedProgress);
      writeLocal(keys.progress, mergedProgress);

      const { data: collegeRows } = await supabase.from("colleges").select("id, slug").in("slug", localSaved);
      if (collegeRows?.length) {
        await supabase.from("saved_colleges").upsert(collegeRows.map((college) => ({
          user_id: data.user!.id, college_id: college.id, bucket: "researching", notes: localNotes[college.slug] ?? null, updated_at: now, created_at: now
        })));
      }
      const { data: remoteDeadlines } = await supabase.from("user_deadlines").select("id, title, due_at").eq("user_id", data.user.id);
      const mergedDeadlines = mergeDeadlines(localDeadlines, (remoteDeadlines ?? []).map((item) => ({ id: item.id, title: item.title, dueAt: item.due_at.slice(0, 10) })));
      setDeadlines(mergedDeadlines);
      writeLocal(keys.deadlines, mergedDeadlines);
      setSyncMessage("Synced securely with your account.");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const nextTasks = roadmapTasks.filter((task) => !progress.includes(task.id)).slice(0, 4);
  const savedColleges = colleges.filter((college) => saved.includes(college.slug));
  const percent = Math.round((progress.length / roadmapTasks.length) * 100);

  function updateProfile(key: Exclude<keyof StudentProfile, "interests">, value: string) {
    const next = { ...profile, [key]: value };
    setProfile(next);
    writeLocal(keys.profile, next);
  }

  async function addDeadline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = { id: crypto.randomUUID(), title: String(data.get("title")), dueAt: String(data.get("dueAt")) };
    const updated = [...deadlines, next].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    setDeadlines(updated);
    writeLocal(keys.deadlines, updated);
    const supabase = getBrowserSupabase();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    if (supabase && user) await supabase.from("user_deadlines").insert({ id: next.id, user_id: user.id, title: next.title, due_at: next.dueAt });
    form.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-6">
        <Surface className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><Tag tone="amber">{profile.targetIntake}</Tag><h2 className="font-display mt-3 text-4xl text-emerald-950">Your plan is {percent}% complete.</h2></div><Link className="text-sm font-bold text-emerald-800 underline underline-offset-4" href="/roadmap">Open full roadmap</Link></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-emerald-950/10"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${percent}%` }} /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">{nextTasks.map((task) => <Link className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4" href={`/roadmap#${task.id}`} key={task.id}><p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-700">{task.dueHint}</p><p className="mt-2 font-bold text-emerald-950">{task.title}</p></Link>)}</div>
        </Surface>
        <Surface className="p-6">
          <h2 className="font-display text-3xl text-emerald-950">Saved colleges</h2>
          {savedColleges.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{savedColleges.map((college) => <Link className="rounded-2xl border border-slate-100 bg-white p-4" href={`/colleges/${college.slug}`} key={college.slug}><p className="font-bold text-emerald-950">{college.shortName}</p><p className="mt-1 text-xs text-slate-500">{college.aidPolicy} · {college.location}</p></Link>)}</div> : <p className="mt-3 text-sm text-slate-600">Save colleges from the explorer to build your research list.</p>}
        </Surface>
        <Surface className="p-6">
          <h2 className="font-display text-3xl text-emerald-950">Deadline calendar</h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]" onSubmit={addDeadline}><input className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm" name="title" placeholder="CSS Profile deadline" required /><input className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm" name="dueAt" required type="date" /><ActionButton type="submit">Add</ActionButton></form>
          <div className="mt-4 grid gap-2">{deadlines.map((deadline) => <div className="flex justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm" key={deadline.id}><strong>{deadline.title}</strong><span className="text-slate-500">{deadline.dueAt}</span></div>)}</div>
        </Surface>
      </div>
      <aside className="grid content-start gap-6">
        <Surface className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Workspace status</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{syncMessage}</p>
          {account ? <p className="mt-3 text-xs font-bold text-emerald-900">{account}</p> : null}
        </Surface>
        {!account ? <AuthPanel /> : null}
        <Surface className="p-5">
          <h2 className="font-display text-2xl text-emerald-950">Planning profile</h2>
          <div className="mt-4 grid gap-3">
            <ProfileSelect label="Curriculum" value={profile.curriculum} values={["SSC / HSC", "O Levels / A Levels", "IB", "Other curriculum"]} onChange={(value) => updateProfile("curriculum", value)} />
            <ProfileSelect label="Target intake" value={profile.targetIntake} values={["Fall 2027", "Fall 2028", "Fall 2029", "Still exploring"]} onChange={(value) => updateProfile("targetIntake", value)} />
            <ProfileSelect label="Aid need" value={profile.aidBand} values={["Need full funding", "Need substantial aid", "Can contribute partially", "Still discussing"]} onChange={(value) => updateProfile("aidBand", value)} />
          </div>
        </Surface>
      </aside>
    </div>
  );
}

function ProfileSelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}<select className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold normal-case tracking-normal text-slate-700" value={value} onChange={(event) => onChange(event.target.value)}>{values.map((item) => <option key={item}>{item}</option>)}</select></label>;
}

function readLocal<T>(key: string, fallback: T): T {
  try { return JSON.parse(window.localStorage.getItem(key) ?? JSON.stringify(fallback)); } catch { return fallback; }
}
function writeLocal(key: string, value: unknown) { window.localStorage.setItem(key, JSON.stringify(value)); }
function mergeDeadlines(left: Deadline[], right: Deadline[]) { return [...new Map([...left, ...right].map((item) => [item.id, item])).values()].sort((a, b) => a.dueAt.localeCompare(b.dueAt)); }
