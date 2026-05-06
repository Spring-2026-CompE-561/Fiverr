import { expect, test } from "@playwright/test";

test.describe("Home", () => {
  test("renders GigLink landing content", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Find a gig without the noise." }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Browse Gigs" }),
    ).toBeVisible();
  });
});
