import { describe, it, expect } from "vitest";
import { toISODate, fromISODate } from "@/lib/date-range-params";

/**
 * These two functions are the whole timezone contract of the date filter.
 * The backend reads the strings as London calendar dates (TT-447), so a
 * UTC round-trip anywhere here silently shifts the range by a day — the
 * failure is invisible in the UI and only shows as a missing order.
 */
describe("date filter conversion", () => {
  describe("toISODate", () => {
    it("sends the day the user clicked, not the UTC day", () => {
      // 23:30 local on 13 Aug. toISOString() would yield 2026-08-13 only if
      // the machine is at or behind UTC; during BST it rolls to the 14th.
      const picked = new Date(2026, 7, 13, 23, 30);

      expect(toISODate(picked)).toBe("2026-08-13");
    });

    it("is unaffected by the time of day", () => {
      expect(toISODate(new Date(2026, 7, 13, 0, 1))).toBe("2026-08-13");
      expect(toISODate(new Date(2026, 7, 13, 12, 0))).toBe("2026-08-13");
      expect(toISODate(new Date(2026, 7, 13, 23, 59))).toBe("2026-08-13");
    });

    it("zero-pads single-digit months and days", () => {
      expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
    });
  });

  describe("fromISODate", () => {
    it("parses as a local date, so the calendar highlights the right day", () => {
      // `new Date("2026-08-13")` is midnight UTC, which is 13 Aug 01:00 in
      // BST but 12 Aug in any negative offset — the calendar would then
      // highlight the wrong cell.
      const parsed = fromISODate("2026-08-13");

      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(7);
      expect(parsed?.getDate()).toBe(13);
    });

    it("round-trips through toISODate unchanged", () => {
      expect(toISODate(fromISODate("2026-01-05")!)).toBe("2026-01-05");
      expect(toISODate(fromISODate("2026-08-13")!)).toBe("2026-08-13");
    });

    it("returns undefined for absent or malformed input", () => {
      expect(fromISODate(undefined)).toBeUndefined();
      expect(fromISODate("")).toBeUndefined();
      expect(fromISODate("not-a-date")).toBeUndefined();
    });
  });
});
