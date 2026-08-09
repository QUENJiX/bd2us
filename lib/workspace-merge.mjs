export function deadlineKey(item) {
  return `${String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}:${item.dueAt}`;
}

export function mergeDeadlineRows(localActive, localMeta, remote, now = new Date().toISOString()) {
  const remoteById = new Map(remote.map((item) => [item.id, normalizeDeadline(item, now)]));
  const localById = new Map(localActive.map((item) => [item.id, normalizeDeadline(item, now)]));
  const ids = new Set([...remoteById.keys(), ...localById.keys(), ...Object.keys(localMeta)]);
  const merged = [];

  for (const id of ids) {
    const cloud = remoteById.get(id);
    const local = localById.get(id);
    const meta = localMeta[id];
    if (meta && (!cloud || meta.updatedAt > cloud.updatedAt)) {
      const source = local ?? cloud;
      if (!source) continue;
      merged.push({ ...source, updatedAt: meta.updatedAt, deletedAt: meta.deletedAt ?? null });
    } else if (cloud) {
      merged.push(cloud);
    } else if (local) {
      merged.push(local);
    }
  }

  const activeByMeaning = new Map();
  for (const item of merged.filter((entry) => !entry.deletedAt)) {
    const key = deadlineKey(item);
    const current = activeByMeaning.get(key);
    if (!current || item.updatedAt >= current.updatedAt) activeByMeaning.set(key, item);
  }
  const winnerIds = new Set([...activeByMeaning.values()].map((item) => item.id));

  return merged.map((item) => {
    if (item.deletedAt || winnerIds.has(item.id)) return item;
    return { ...item, updatedAt: now, deletedAt: now };
  }).sort((a, b) => a.dueAt.localeCompare(b.dueAt) || a.id.localeCompare(b.id));
}

function normalizeDeadline(item, fallbackUpdatedAt) {
  return {
    id: String(item.id),
    title: String(item.title),
    dueAt: String(item.dueAt),
    updatedAt: item.updatedAt ?? fallbackUpdatedAt,
    deletedAt: item.deletedAt ?? null
  };
}
