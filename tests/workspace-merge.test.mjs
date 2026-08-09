import assert from "node:assert/strict";
import test from "node:test";
import { deadlineKey, mergeDeadlineRows } from "../lib/workspace-merge.mjs";

test("deadline merging keeps a newer offline deletion as a cloud tombstone", () => {
  const rows = mergeDeadlineRows([], {
    deadline1: { updatedAt: "2026-08-02T12:00:00.000Z", deletedAt: "2026-08-02T12:00:00.000Z" }
  }, [{
    id: "deadline1", title: "CSS Profile", dueAt: "2026-11-15",
    updatedAt: "2026-08-01T12:00:00.000Z", deletedAt: null
  }], "2026-08-03T00:00:00.000Z");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].deletedAt, "2026-08-02T12:00:00.000Z");
});

test("deadline merging uses newest values and deduplicates normalized title and date", () => {
  const rows = mergeDeadlineRows([
    { id: "local", title: "CSS Profile deadline", dueAt: "2026-11-15", updatedAt: "2026-08-03T00:00:00.000Z" }
  ], {}, [
    { id: "cloud", title: "CSS profile deadline", dueAt: "2026-11-15", updatedAt: "2026-08-02T00:00:00.000Z", deletedAt: null }
  ], "2026-08-04T00:00:00.000Z");
  assert.equal(rows.filter((row) => !row.deletedAt).length, 1);
  assert.equal(rows.find((row) => !row.deletedAt).id, "local");
  assert.equal(rows.find((row) => row.id === "cloud").deletedAt, "2026-08-04T00:00:00.000Z");
  assert.equal(deadlineKey(rows[0]), "css-profile-deadline:2026-11-15");
});
