"use client";

export const workspaceMetaKey = "bd2us:workspace-v2";

export type LocalChange = {
  updatedAt: string;
  deletedAt?: string | null;
  bucket?: string;
  note?: string;
};

export type LocalWorkspaceMeta = {
  version: 2;
  profileUpdatedAt: string;
  lastMergedUserId?: string | null;
  colleges: Record<string, LocalChange>;
  progress: Record<string, LocalChange>;
  deadlines: Record<string, LocalChange>;
  reading: Record<string, LocalChange & { bookmarked?: boolean; completed?: boolean }>;
};

export function readWorkspaceMeta(): LocalWorkspaceMeta {
  const empty: LocalWorkspaceMeta = { version: 2, profileUpdatedAt: "1970-01-01T00:00:00.000Z", colleges: {}, progress: {}, deadlines: {}, reading: {} };
  if (typeof window === "undefined") return empty;
  try {
    const value = JSON.parse(window.localStorage.getItem(workspaceMetaKey) ?? "null") as Partial<LocalWorkspaceMeta> | null;
    return value?.version === 2 ? { ...empty, ...value, colleges: value.colleges ?? {}, progress: value.progress ?? {}, deadlines: value.deadlines ?? {}, reading: value.reading ?? {} } : empty;
  } catch { return empty; }
}

export function updateWorkspaceMeta(updater: (current: LocalWorkspaceMeta) => LocalWorkspaceMeta) {
  const next = updater(readWorkspaceMeta());
  window.localStorage.setItem(workspaceMetaKey, JSON.stringify(next));
  return next;
}

export function touchProfile() {
  updateWorkspaceMeta((current) => ({ ...current, profileUpdatedAt: new Date().toISOString() }));
}

export function touchCollege(slug: string, change: Partial<LocalChange>) {
  const updatedAt = new Date().toISOString();
  updateWorkspaceMeta((current) => ({ ...current, colleges: { ...current.colleges, [slug]: { ...current.colleges[slug], ...change, updatedAt } } }));
}

export function touchProgress(taskId: string, completed: boolean) {
  const updatedAt = new Date().toISOString();
  updateWorkspaceMeta((current) => ({ ...current, progress: { ...current.progress, [taskId]: { updatedAt, deletedAt: completed ? null : updatedAt } } }));
}

export function touchDeadline(id: string, deleted = false) {
  const updatedAt = new Date().toISOString();
  updateWorkspaceMeta((current) => ({ ...current, deadlines: { ...current.deadlines, [id]: { updatedAt, deletedAt: deleted ? updatedAt : null } } }));
}

export function touchReading(contentType: "guide" | "blog", slug: string, change: { bookmarked?: boolean; completed?: boolean }) {
  const key = `${contentType}:${slug}`;
  const updatedAt = new Date().toISOString();
  updateWorkspaceMeta((current) => ({ ...current, reading: { ...current.reading, [key]: { ...current.reading[key], ...change, updatedAt, deletedAt: null } } }));
}

export function markWorkspaceMerged(userId: string) {
  updateWorkspaceMeta((current) => ({ ...current, lastMergedUserId: userId }));
}
