/**
 * Conversion between a picked calendar day and the YYYY-MM-DD string the
 * backend reads as a London calendar date (TT-447).
 *
 * This is the whole timezone contract of the date filter, which is why it
 * lives in its own module: a UTC round-trip anywhere here shifts the range by
 * a day, and the failure is invisible in the UI — it shows up only as an
 * order that should have matched and didn't.
 */

/**
 * Local calendar date as YYYY-MM-DD.
 *
 * Deliberately NOT toISOString().slice(0, 10): that converts to UTC first, so
 * a date picked late in the evening during BST would be sent as the next day.
 */
export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses YYYY-MM-DD as a local date — `new Date(str)` would read it as UTC. */
export function fromISODate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}
