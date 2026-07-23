/**
 * optionValues fallback rendering. Orders created 2026-07-15..22 (TT-372
 * enrichment outage) have no metadata.variantTitle, so the portal falls back
 * to optionValues — stored as {value, option: {name}} objects, which the old
 * string[].join rendered as "[object Object]".
 */
import { describe, expect, it } from "vitest";
import { formatOptionValues } from "./types";

describe("formatOptionValues", () => {
  it("renders {value} objects (variant_option_values shape)", () => {
    expect(
      formatOptionValues([
        { id: "x", value: "Regular", option: { id: "o1", name: "Length" } },
        { id: "y", value: "4", option: { id: "o2", name: "Size" } },
      ]),
    ).toBe("Regular / 4");
  });

  it("renders plain strings (oldest orders)", () => {
    expect(formatOptionValues(["Large", "Blue"])).toBe("Large / Blue");
  });

  it("handles mixed and malformed entries without [object Object]", () => {
    expect(
      formatOptionValues(["8", { value: "Petite" }, { option: { name: "Size" } }, null, 42]),
    ).toBe("8 / Petite");
  });

  it("returns null for empty, non-array, or unrenderable input", () => {
    expect(formatOptionValues([])).toBeNull();
    expect(formatOptionValues(undefined)).toBeNull();
    expect(formatOptionValues("Large")).toBeNull();
    expect(formatOptionValues([{ id: "x" }])).toBeNull();
  });
});
