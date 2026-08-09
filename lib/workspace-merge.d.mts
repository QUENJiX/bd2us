export type DeadlineMergeRow = {
  id: string;
  title: string;
  dueAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export function deadlineKey(item: Pick<DeadlineMergeRow, "title" | "dueAt">): string;
export function mergeDeadlineRows(
  localActive: DeadlineMergeRow[],
  localMeta: Record<string, { updatedAt: string; deletedAt?: string | null }>,
  remote: DeadlineMergeRow[],
  now?: string
): Array<Required<Omit<DeadlineMergeRow, "deletedAt">> & { deletedAt: string | null }>;
