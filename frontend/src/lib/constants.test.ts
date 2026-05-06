import { describe, expect, it } from "vitest";

import { GIG_CATEGORIES } from "./constants";

describe("constants", () => {
  it("lists marketplace categories", () => {
    expect(GIG_CATEGORIES).toContain("Design");
    expect(GIG_CATEGORIES.length).toBeGreaterThan(0);
  });
});
