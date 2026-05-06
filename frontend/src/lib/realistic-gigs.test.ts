import { afterEach, describe, expect, it, vi } from "vitest";

import { pickRandom, SEARCH_PLACEHOLDERS } from "./realistic-gigs";

describe("realistic-gigs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports search placeholders", () => {
    expect(SEARCH_PLACEHOLDERS.length).toBeGreaterThan(0);
    expect(SEARCH_PLACEHOLDERS[0]).toContain("Search");
  });

  it("pickRandom returns an element using Math.random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(pickRandom([10, 20, 30])).toBe(20);
  });
});
