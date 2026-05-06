import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDateTime, formatRelativeTime } from "./format";

describe("formatDateTime", () => {
  it("includes year from ISO string", () => {
    const s = formatDateTime("2026-01-15T12:00:00.000Z");
    expect(s).toMatch(/2026/);
  });
});

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
  });

  it("returns just now for recent timestamps", () => {
    expect(formatRelativeTime("2026-06-01T11:59:30Z")).toBe("just now");
  });

  it("returns minutes ago", () => {
    expect(formatRelativeTime("2026-06-01T11:58:00Z")).toMatch(/^\d+m ago$/);
  });

  it("returns hours ago", () => {
    expect(formatRelativeTime("2026-06-01T09:00:00Z")).toMatch(/^\d+h ago$/);
  });

  it("returns days ago", () => {
    expect(formatRelativeTime("2026-05-28T12:00:00Z")).toMatch(/^\d+d ago$/);
  });

  it("returns months ago", () => {
    expect(formatRelativeTime("2026-03-01T12:00:00Z")).toMatch(/^\d+mo ago$/);
  });

  it("returns years ago for old dates", () => {
    expect(formatRelativeTime("2023-06-01T12:00:00Z")).toMatch(/^\d+y ago$/);
  });
});
