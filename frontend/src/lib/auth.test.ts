import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getStoredUser,
  getToken,
  logout,
  saveToken,
  saveUser,
  validateSession,
  type UserPublic,
} from "./auth";

const sampleUser: UserPublic = {
  id: "u1",
  name: "Test",
  email: "t@example.com",
  role: "buyer",
  bio: null,
  avatar_url: null,
  email_verified: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("auth storage", () => {
  const mem: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(mem).forEach((k) => {
      delete mem[k];
    });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => (k in mem ? mem[k] : null),
      setItem: (k: string, v: string) => {
        mem[k] = v;
      },
      removeItem: (k: string) => {
        delete mem[k];
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists token via saveToken and getToken", () => {
    saveToken("jwt-here");
    expect(getToken()).toBe("jwt-here");
  });

  it("logout clears token and user", () => {
    saveToken("x");
    saveUser(sampleUser);
    logout();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it("getStoredUser returns parsed user", () => {
    saveUser(sampleUser);
    expect(getStoredUser()).toEqual(sampleUser);
  });

  it("validateSession returns user when token exists", async () => {
    saveToken("t");
    saveUser(sampleUser);
    await expect(validateSession()).resolves.toEqual(sampleUser);
  });

  it("validateSession returns null without token", async () => {
    await expect(validateSession()).resolves.toBeNull();
  });
});
