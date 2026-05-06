import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { apiFetch, getApiBase } from "./api";

describe("getApiBase", () => {
  it("defaults when NEXT_PUBLIC_API_URL is unset", () => {
    expect(getApiBase()).toMatch(/localhost:8000$/);
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve({ ok: true }),
        } as Response),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("prefixes relative paths and returns JSON", async () => {
    const data = await apiFetch<{ ok: boolean }>("/api/v1/health", {
      auth: false,
    });
    expect(data.ok).toBe(true);
    const call = vi.mocked(fetch).mock.calls[0];
    expect(String(call[0])).toContain("api/v1/health");
  });

  it("maps FastAPI error detail to message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          headers: new Headers(),
          text: () => Promise.resolve(JSON.stringify({ detail: "Invalid" })),
        } as Response),
      ),
    );
    await expect(apiFetch("/api/v1/x", { auth: false })).rejects.toThrow(
      "Invalid",
    );
  });

  it("maps validation error array detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 422,
          headers: new Headers(),
          text: () =>
            Promise.resolve(
              JSON.stringify({
                detail: [{ msg: "field required", loc: ["body", "email"] }],
              }),
            ),
        } as Response),
      ),
    );
    await expect(apiFetch("/x", { auth: false })).rejects.toThrow(/field/);
  });

  it("returns undefined on 204", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          headers: new Headers(),
          text: () => Promise.resolve(""),
        } as Response),
      ),
    );
    const out = await apiFetch<void>("/x", { auth: false });
    expect(out).toBeUndefined();
  });

  it("returns plain text when content-type is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "text/plain" }),
          text: () => Promise.resolve("ok"),
        } as Response),
      ),
    );
    const out = await apiFetch<string>("/x", { auth: false });
    expect(out).toBe("ok");
  });

  it("attaches Authorization when token in localStorage", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((k: string) => (k === "token" ? "abc" : null)),
    });
    const data = await apiFetch<{ a: number }>("/api/v1/orders", {
      method: "GET",
    });
    expect(data).toEqual({ ok: true });
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    const h = new Headers(init.headers);
    expect(h.get("Authorization")).toBe("Bearer abc");
  });
});
