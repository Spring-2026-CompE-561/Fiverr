/**
 * Integration test: verifies the backend API is reachable from the frontend.
 * Run with: npm run test:integration
 * Requires a running API (e.g. docker compose up backend) or local uvicorn.
 */

import { describe, expect, it } from "vitest";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

describe("Backend health integration", () => {
  it("should reach the health endpoint", async () => {
    const res = await fetch(`${API_URL}/api/v1/health`);
    expect(res.status).toBe(200);
  });

  it("should return a list from gigs endpoint", async () => {
    const res = await fetch(`${API_URL}/api/v1/gigs`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should reject unauthenticated gig creation", async () => {
    const res = await fetch(`${API_URL}/api/v1/gigs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Unauthorized",
        description: "Should fail",
        price: 10,
        tags: ["test"],
      }),
    });
    expect(res.status).toBe(401);
  });
});
