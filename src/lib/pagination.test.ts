import { describe, it, expect } from "vitest";
import {
  PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  toPageCount,
  toRowRange,
} from "./pagination";

describe("pagination", () => {
  it("offers 10 and 25", () => {
    expect(PAGE_SIZE_OPTIONS).toEqual([10, 25]);
  });

  it("defaults to a size the picker actually offers", () => {
    // A default outside the options renders a blank Select — this is exactly
    // how the old default of 20 would have broken against a 10/25 picker.
    expect(PAGE_SIZE_OPTIONS).toContain(DEFAULT_PAGE_SIZE);
  });

  it("opens on 10 rows, not 25", () => {
    // Deliberate: support scans a short list and pages, rather than
    // scrolling past 25 rows to reach the pager. Pinned so a future
    // "sensible default" tweak has to be an explicit decision.
    expect(DEFAULT_PAGE_SIZE).toBe(10);
  });

  describe("toPageCount", () => {
    it("rounds a partial last page up", () => {
      expect(toPageCount(26, 25)).toBe(2);
    });

    it("never returns zero for an empty table", () => {
      // "Page 1 of 0" reads as broken and disables both arrows.
      expect(toPageCount(0, 25)).toBe(1);
    });

    it("survives a nonsense page size", () => {
      expect(toPageCount(10, 0)).toBe(1);
    });
  });

  describe("toRowRange", () => {
    it("is 1-based on the first page", () => {
      expect(toRowRange(0, 25, 179)).toEqual({ start: 1, end: 25 });
    });

    it("clamps the final page to the total", () => {
      expect(toRowRange(7, 25, 179)).toEqual({ start: 176, end: 179 });
    });

    it("collapses to zero when there are no rows", () => {
      expect(toRowRange(0, 25, 0)).toEqual({ start: 0, end: 0 });
    });
  });
});
