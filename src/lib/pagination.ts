/**
 * The one definition of page sizing in the admin portal (TT-445).
 *
 * Previously the options lived inside DataTable and the default lived
 * separately inside useTableParams, so the two could — and did — disagree.
 * Everything that pages reads from here; nothing else declares a page size.
 */
export const PAGE_SIZE_OPTIONS = [10, 25] as const;

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Total pages for a row count, never less than 1 — a zero would render
 * "Page 1 of 0" and disable both arrows on an empty table.
 */
export function toPageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Inclusive 1-based row range for the current page, clamped to the total. */
export function toRowRange(
  pageIndex: number,
  pageSize: number,
  total: number,
): { start: number; end: number } {
  if (total <= 0) return { start: 0, end: 0 };
  const start = pageIndex * pageSize + 1;
  return { start, end: Math.min((pageIndex + 1) * pageSize, total) };
}
