import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("handles undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("merges tailwind classes without duplicates", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("returns empty string when no args", () => {
    expect(cn()).toBe("");
  });
});