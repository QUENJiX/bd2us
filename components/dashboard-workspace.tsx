"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AccountPanel } from "@/components/account-panel";
import { AuthPanel } from "@/components/auth-panel";
import { ActionButton, Surface, Tag } from "@/components/ui";
import { colleges, defaultProfile, roadmapTasks } from "@/lib/content";
import { markWorkspaceMerged, readWorkspaceMeta, touchDeadline, touchProfile } from "@/lib/local-workspace";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { StudentProfile } from "@/lib/types";

type Deadline = { id: string; title: string; dueAt: string; updatedAt?: string; deletedAt?: string | null };
type CollegeBucket = "Researching" | "Shortlisted" | "Applying" | "Submitted" | "Decision";

const keys = {
  profile: "bd2us-profile",
  progress: "bd2us-roadmap-progress",
  saved: "bd2us:saved-colleges",
  notes: "bd2us:college-notes",
  deadlines: "bd2us:deadlines",
  buckets: "bd2us:college-buckets",
  bookmarks: "bd2us-bookmarks"
};

export function DashboardWorkspace() {
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [progress, setProgress] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [buckets, setBuckets] = useState<Record<string, CollegeBucket>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("Guest plan stored on this device.");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const localProfile = readLocal<StudentProfile>(keys.profile, defaultProfile);
      const localProgress = readLocal<string[]>(keys.progress, []);
      const localSaved = readLocal<string[]>(keys.saved, []);
      const localNotes = readLocal<Record<string, string>>(keys.notes, {});
      const localDeadlines = readLocal<Deadline[]>(keys.deadlines, []);
      const localBuckets = readLocal<Record<string, CollegeBucket>>(keys.buckets, {});
      const localBookmarks = readLocal<string[]>(keys.bookmarks, []);
      const localCompletedReading = readLocal<string[]>("bd2us-guide-complete", []);
      const meta = readWorkspaceMeta();
      setProfile(localProfile);
      setProgress(localProgress);
      setSaved(localSaved);
      setDeadlines(localDeadlines);
      setBuckets(localBuckets);
      setBookmarks(localBookmarks);

      const supabase = getBrowserSupabase();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setAccount(data.user.email ?? "Signed-in student");
      setSyncMessage("Merging this device with your private workspace...");
      const now = new Date().toISOString();
      const { data: remoteProfile } = await supabase.from("profiles").select("curriculum,current_year,target_intake,aid_band,testing_status,interests,updated_at").eq("id", data.user.id).maybeSingle();
      const remoteIsNewer = remoteProfile?.updated_at && remoteProfile.updated_at > meta.profileUpdatedAt;
      const mergedProfile = remoteIsNewer ? {
        curriculum: remoteProfile.curriculum ?? localProfile.curriculum,
        currentYear: remoteProfile.current_year ?? localProfile.currentYear,
        targetIntake: remoteProfile.target_intake ?? localProfile.targetIntake,
        aidBand: remoteProfile.aid_band ?? localProfile.aidBand,
        testingStatus: remoteProfile.testing_status ?? localProfile.testingStatus,
        interests: remoteProfile.interests ?? localProfile.interests
      } : localProfile;
      setProfile(mergedProfile);
      writeLocal(keys.profile, mergedProfile);
      if (!remoteIsNewer) await supabase.from("profiles").upsert({ id: data.user.id, curriculum: mergedProfile.curriculum, current_year: mergedProfile.currentYear, target_intake: mergedProfile.targetIntake, aid_band: mergedProfile.aidBand, testing_status: mergedProfile.testingStatus, interests: mergedProfile.interests, updated_at: now });

      const progressResult = await supabase.from("user_task_progress").select("task_id,completed,completed_at,updated_at,deleted_at").eq("user_id", data.user.id);
      const remoteProgress = progressResult.error ? (await supabase.from("user_task_progress").select("task_id,completed,completed_at,updated_at").eq("user_id", data.user.id)).data ?? [] : progressResult.data ?? [];
      const mergedProgressRows = mergeProgress(localProgress, meta.progress, remoteProgress, now);
      if (mergedProgressRows.length) await supabase.from("user_task_progress").upsert(mergedProgressRows.map((row) => ({ user_id: data.user!.id, ...row })));
      const mergedProgress = mergedProgressRows.filter((row) => row.completed && !row.deleted_at).map((row) => row.task_id);
      setProgress(mergedProgress);
      writeLocal(keys.progress, mergedProgress);

      const savedResult = await supabase.from("saved_colleges").select("college_id,bucket,notes,created_at,updated_at,deleted_at").eq("user_id", data.user.id);
      const remoteSaved = savedResult.error ? (await supabase.from("saved_colleges").select("college_id,bucket,notes,created_at,updated_at").eq("user_id", data.user.id)).data ?? [] : savedResult.data ?? [];
      const remoteCollegeIds = remoteSaved.map((item) => item.college_id);
      const localCollegeRows = localSaved.length ? (await supabase.from("colleges").select("id,slug").in("slug", localSaved)).data ?? [] : [];
      const remoteCollegeRows = remoteCollegeIds.length ? (await supabase.from("colleges").select("id,slug").in("id", remoteCollegeIds)).data ?? [] : [];
      const collegeRows = [...new Map([...localCollegeRows, ...remoteCollegeRows].map((college) => [college.id, college])).values()];
      const idBySlug = new Map((collegeRows ?? []).map((college) => [college.slug, college.id]));
      const slugById = new Map((collegeRows ?? []).map((college) => [college.id, college.slug]));
      const mergedSaved = mergeSaved(localSaved, localNotes, localBuckets, meta.colleges, remoteSaved, slugById, now);
      const saveRows = mergedSaved.map((row) => ({ user_id: data.user!.id, college_id: idBySlug.get(row.slug) ?? remoteSaved.find((item) => slugById.get(item.college_id) === row.slug)?.college_id ?? "", bucket: row.bucket.toLowerCase(), notes: row.notes, created_at: row.created_at, updated_at: row.updated_at, deleted_at: row.deleted_at })).filter((row) => row.college_id);
      if (saveRows.length) await supabase.from("saved_colleges").upsert(saveRows);
      const activeSaved = mergedSaved.filter((row) => !row.deleted_at).map((row) => row.slug);
      const activeBuckets = Object.fromEntries(mergedSaved.filter((row) => !row.deleted_at).map((row) => [row.slug, titleBucket(row.bucket)]));
      setSaved(activeSaved); setBuckets(activeBuckets);
      writeLocal(keys.saved, activeSaved); writeLocal(keys.buckets, activeBuckets);
      writeLocal(keys.notes, Object.fromEntries(mergedSaved.filter((row) => !row.deleted_at && row.notes).map((row) => [row.slug, row.notes])));

      const deadlineResult = await supabase.from("user_deadlines").select("id,title,due_at,updated_at,deleted_at").eq("user_id", data.user.id);
      const remoteDeadlines = deadlineResult.error ? (await supabase.from("user_deadlines").select("id,title,due_at,created_at").eq("user_id", data.user.id)).data ?? [] : deadlineResult.data ?? [];
      const mergedDeadlines = mergeDeadlines(localDeadlines, remoteDeadlines.map((item) => ({ id: item.id, title: item.title, dueAt: item.due_at.slice(0, 10), updatedAt: "updated_at" in item ? String(item.updated_at) : "created_at" in item ? String(item.created_at) : now, deletedAt: "deleted_at" in item ? item.deleted_at : null })));
      if (mergedDeadlines.length) await supabase.from("user_deadlines").upsert(mergedDeadlines.map((item) => ({ id: item.id, user_id: data.user!.id, title: item.title, due_at: item.dueAt, stable_key: deadlineKey(item), updated_at: item.updatedAt ?? now, deleted_at: item.deletedAt ?? null })));
      setDeadlines(mergedDeadlines);
      writeLocal(keys.deadlines, mergedDeadlines);

      const { data: remoteReading } = await supabase.from("user_reading_state").select("content_type,content_slug,bookmarked,completed,updated_at,deleted_at").eq("user_id", data.user.id);
      const reading = mergeReading(localBookmarks, localCompletedReading, meta.reading, remoteReading ?? [], now);
      if (reading.length) await supabase.from("user_reading_state").upsert(reading.map((item) => ({ user_id: data.user!.id, ...item })));
      const mergedBookmarks = reading.filter((item) => item.bookmarked && !item.deleted_at).map((item) => item.content_slug);
      setBookmarks(mergedBookmarks); writeLocal(keys.bookmarks, mergedBookmarks);
      writeLocal("bd2us-guide-complete", reading.filter((item) => item.completed && !item.deleted_at).map((item) => item.content_slug));
      markWorkspaceMerged(data.user.id);
      setSyncMessage("Synced securely with your account.");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const nextTasks = roadmapTasks.filter((task) => !progress.includes(task.id)).slice(0, 4);
  const savedColleges = colleges.filter((college) => saved.includes(college.slug));
  const percent = Math.round((progress.length / roadmapTasks.length) * 100);
  const pipeline = (["Researching", "Shortlisted", "Applying", "Submitted", "Decision"] as CollegeBucket[]).map((bucket) => ({
    bucket,
    colleges: savedColleges.filter((college) => (buckets[college.slug] ?? "Researching") === bucket)
  }));

  function updateProfile(key: Exclude<keyof StudentProfile, "interests">, value: string) {
    const next = { ...profile, [key]: value };
    setProfile(next);
    writeLocal(keys.profile, next);
    touchProfile();
    if (account) void syncProfile(next);
  }

  async function syncProfile(next: StudentProfile) {
    const supabase = getBrowserSupabase();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    if (!supabase || !user) return;
    const updatedAt = new Date().toISOString();
    await supabase.from("profiles").upsert({ id: user.id, curriculum: next.curriculum, current_year: next.currentYear, target_intake: next.targetIntake, aid_band: next.aidBand, testing_status: next.testingStatus, interests: next.interests, updated_at: updatedAt });
  }

  async function addDeadline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = { id: crypto.randomUUID(), title: String(data.get("title")), dueAt: String(data.get("dueAt")), updatedAt: new Date().toISOString(), deletedAt: null };
    const updated = [...deadlines, next].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    setDeadlines(updated);
    writeLocal(keys.deadlines, updated);
    touchDeadline(next.id);
    const supabase = getBrowserSupabase();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    if (supabase && user) await supabase.from("user_deadlines").insert({ id: next.id, user_id: user.id, title: next.title, due_at: next.dueAt, stable_key: deadlineKey(next), updated_at: next.updatedAt });
    form.reset();
  }

  async function removeDeadline(deadline: Deadline) {
    const deletedAt = new Date().toISOString();
    const updated = deadlines.filter((item) => item.id !== deadline.id);
    setDeadlines(updated); writeLocal(keys.deadlines, updated); touchDeadline(deadline.id, true);
    const supabase = getBrowserSupabase();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    if (supabase && user) await supabase.from("user_deadlines").update({ updated_at: deletedAt, deleted_at: deletedAt }).eq("id", deadline.id).eq("user_id", user.id);
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
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">College-list pipeline</p><h2 className="font-display mt-2 text-3xl text-emerald-950">Move research toward a decision.</h2></div><Link className="text-sm font-bold text-emerald-800 underline underline-offset-4" href="/colleges">Open all 678 colleges</Link></div>
          {savedColleges.length ? <div className="pipeline-board mt-5">{pipeline.map((group) => <section key={group.bucket}><header><span>{group.bucket}</span><b>{group.colleges.length}</b></header><div>{group.colleges.map((college) => <Link href={`/colleges/${college.slug}`} key={college.slug}><strong>{college.shortName}</strong><small>{college.location}</small></Link>)}{!group.colleges.length ? <p>No colleges here yet.</p> : null}</div></section>)}</div> : <p className="mt-3 text-sm text-slate-600">Save colleges from the explorer, then assign each one a research stage on its profile.</p>}
        </Surface>
        <Surface className="p-6">
          <h2 className="font-display text-3xl text-emerald-950">Deadline calendar</h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]" onSubmit={addDeadline}><input className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm" name="title" placeholder="CSS Profile deadline" required /><input className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm" name="dueAt" required type="date" /><ActionButton type="submit">Add</ActionButton></form>
          <div className="mt-4 grid gap-2">{deadlines.map((deadline) => <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm" key={deadline.id}><strong>{deadline.title}</strong><span className="ml-auto text-slate-500">{deadline.dueAt}</span><button className="min-h-11 px-2 font-bold text-rose-700 underline underline-offset-4" onClick={() => removeDeadline(deadline)} type="button">Remove</button></div>)}</div>
        </Surface>
        <Surface className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Saved reading</p><h2 className="font-display mt-2 text-3xl text-emerald-950">Return to the chapters you marked.</h2></div><Link href="/guide/orientation" className="text-sm font-bold text-emerald-800 underline underline-offset-4">Open field guide</Link></div>
          {bookmarks.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{bookmarks.map((slug) => <Link className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3 text-sm font-bold text-emerald-950 capitalize" href={`/guide/${slug}`} key={slug}>{slug.replaceAll("-", " ")} →</Link>)}</div> : <p className="mt-3 text-sm text-slate-600">Use “Save for later” in any chapter to build this reading list.</p>}
        </Surface>
      </div>
      <aside className="grid content-start gap-6">
        <Surface className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Workspace status</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{syncMessage}</p>
          {account ? <p className="mt-3 text-xs font-bold text-emerald-900">{account}</p> : null}
        </Surface>
        {account ? <AccountPanel email={account} onSignedOut={() => { setAccount(null); setSyncMessage("Guest plan stored on this device."); }} /> : <AuthPanel />}
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
function mergeDeadlines(left: Deadline[], right: Deadline[]) {
  const byId = new Map<string, Deadline>();
  for (const item of [...left, ...right]) {
    const current = byId.get(item.id);
    if (!current || (item.updatedAt ?? "1970") >= (current.updatedAt ?? "1970")) byId.set(item.id, item);
  }
  const byMeaning = new Map<string, Deadline>();
  for (const item of byId.values()) {
    const key = deadlineKey(item);
    const current = byMeaning.get(key);
    if (!current || (item.updatedAt ?? "1970") >= (current.updatedAt ?? "1970")) byMeaning.set(key, item);
  }
  return [...byMeaning.values()].filter((item) => !item.deletedAt).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}
function deadlineKey(item: Pick<Deadline, "title" | "dueAt">) { return `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}:${item.dueAt}`; }
function titleBucket(value: string): CollegeBucket {
  const normalized = value.toLowerCase();
  return normalized === "shortlisted" ? "Shortlisted" : normalized === "applying" ? "Applying" : normalized === "submitted" ? "Submitted" : normalized === "decision" ? "Decision" : "Researching";
}

type ProgressRow = { task_id: string; completed: boolean; completed_at: string | null; updated_at: string; deleted_at?: string | null };
function mergeProgress(localActive: string[], localMeta: ReturnType<typeof readWorkspaceMeta>["progress"], remote: ProgressRow[], now: string): ProgressRow[] {
  const remoteById = new Map(remote.map((row) => [row.task_id, row]));
  const ids = new Set([...localActive, ...Object.keys(localMeta), ...remoteById.keys()]);
  return [...ids].map((taskId) => {
    const cloud = remoteById.get(taskId);
    const local = localMeta[taskId];
    if (local && (!cloud || local.updatedAt > cloud.updated_at)) return { task_id: taskId, completed: localActive.includes(taskId), completed_at: localActive.includes(taskId) ? local.updatedAt : null, updated_at: local.updatedAt, deleted_at: local.deletedAt ?? null };
    if (cloud) return cloud;
    return { task_id: taskId, completed: true, completed_at: now, updated_at: now, deleted_at: null };
  });
}

type SavedRow = { college_id: string; bucket: string; notes: string | null; created_at: string; updated_at: string; deleted_at?: string | null };
function mergeSaved(localActive: string[], localNotes: Record<string, string>, localBuckets: Record<string, CollegeBucket>, localMeta: ReturnType<typeof readWorkspaceMeta>["colleges"], remote: SavedRow[], slugById: Map<string, string>, now: string) {
  const remoteBySlug = new Map(remote.map((row) => [slugById.get(row.college_id), row]).filter((entry): entry is [string, SavedRow] => Boolean(entry[0])));
  const slugs = new Set([...localActive, ...Object.keys(localMeta), ...remoteBySlug.keys()]);
  return [...slugs].map((slug) => {
    const cloud = remoteBySlug.get(slug);
    const local = localMeta[slug];
    if (local && (!cloud || local.updatedAt > cloud.updated_at)) return { slug, bucket: local.bucket ?? localBuckets[slug] ?? "Researching", notes: local.note ?? localNotes[slug] ?? null, created_at: cloud?.created_at ?? local.updatedAt, updated_at: local.updatedAt, deleted_at: local.deletedAt ?? (localActive.includes(slug) ? null : local.updatedAt) };
    if (cloud) return { slug, ...cloud };
    return { slug, bucket: localBuckets[slug] ?? "Researching", notes: localNotes[slug] ?? null, created_at: now, updated_at: now, deleted_at: null };
  });
}

type ReadingRow = { content_type: string; content_slug: string; bookmarked: boolean; completed: boolean; updated_at: string; deleted_at?: string | null };
function mergeReading(localBookmarks: string[], localCompleted: string[], localMeta: ReturnType<typeof readWorkspaceMeta>["reading"], remote: ReadingRow[], now: string): ReadingRow[] {
  const remoteByKey = new Map(remote.map((row) => [`${row.content_type}:${row.content_slug}`, row]));
  const legacyKeys = [...new Set([...localBookmarks, ...localCompleted])].map((slug) => `guide:${slug}`);
  const keysToMerge = new Set([...legacyKeys, ...Object.keys(localMeta), ...remoteByKey.keys()]);
  return [...keysToMerge].map((key) => {
    const [contentType, ...slugParts] = key.split(":");
    const contentSlug = slugParts.join(":");
    const cloud = remoteByKey.get(key);
    const local = localMeta[key];
    if (local && (!cloud || local.updatedAt > cloud.updated_at)) return { content_type: contentType, content_slug: contentSlug, bookmarked: local.bookmarked ?? localBookmarks.includes(contentSlug), completed: local.completed ?? localCompleted.includes(contentSlug), updated_at: local.updatedAt, deleted_at: local.deletedAt ?? null };
    if (cloud) return cloud;
    return { content_type: contentType, content_slug: contentSlug, bookmarked: localBookmarks.includes(contentSlug), completed: localCompleted.includes(contentSlug), updated_at: now, deleted_at: null };
  });
}
