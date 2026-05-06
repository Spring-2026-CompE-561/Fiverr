import { expect, test } from "@playwright/test";

test.describe("Browse page (frontend → API)", () => {
  test("loads marketplace and finishes gig fetch without error", async ({
    page,
  }) => {
    const gigsResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/gigs") &&
        res.request().method() === "GET" &&
        res.ok(),
      { timeout: 30_000 },
    );

    await page.goto("/browse");

    await expect(
      page.getByRole("heading", { name: "Browse Services" }),
    ).toBeVisible();

    await gigsResponse;

    await expect(page.getByTestId("browse-error")).toHaveCount(0);

    const gigCard = page.getByRole("link", { name: /Open gig/i }).first();
    const emptyState = page.getByRole("heading", {
      name: "No services found",
    });
    await expect(gigCard.or(emptyState)).toBeVisible({ timeout: 15_000 });
  });
});
