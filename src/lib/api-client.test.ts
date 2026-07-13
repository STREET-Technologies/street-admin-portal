import { describe, it, expect } from "vitest";
import { toQueryString } from "./api-client";

describe("toQueryString", () => {
  it("serializes defined params", () => {
    expect(toQueryString({ page: 2, limit: 20, search: "bob" })).toBe(
      "?page=2&limit=20&search=bob",
    );
  });

  it("skips undefined, null, and empty-string values", () => {
    expect(
      toQueryString({ search: undefined, status: "", name: null as unknown as string, page: 1 }),
    ).toBe("?page=1");
  });

  it("returns empty string when nothing survives", () => {
    expect(toQueryString({})).toBe("");
    expect(toQueryString({ a: undefined })).toBe("");
  });

  it("serializes booleans", () => {
    expect(toQueryString({ stuck: true })).toBe("?stuck=true");
  });

  it("URL-encodes values", () => {
    expect(toQueryString({ search: "a b&c" })).toBe("?search=a+b%26c");
  });
});
