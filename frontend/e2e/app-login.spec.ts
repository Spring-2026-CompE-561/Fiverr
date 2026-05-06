import { expect, test } from "@playwright/test";

function apiBase(): string {
  return (
    process.env.PLAYWRIGHT_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000"
  );
}

test.describe("Login (UI + API)", () => {
  test("registers via API then signs in through the browser", async ({
    page,
    request,
  }) => {
    const email = `pw-e2e-${Date.now()}@test.com`;
    const password = "E2E_login_99!";
    const register = await request.post(`${apiBase()}/api/v1/auth/register`, {
      data: {
        name: "Playwright User",
        email,
        password,
        role: "buyer",
      },
    });
    expect(
      register.ok(),
      `register failed: ${register.status()} ${await register.text()}`,
    ).toBeTruthy();

    await page.goto("/login");

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: "Find a gig without the noise." }),
    ).toBeVisible();
  });
});
