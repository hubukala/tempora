import { test, expect } from "@playwright/test";

test.describe("auth flow", () => {
  test("register → dashboard → logout → login → dashboard", async ({
    page,
  }) => {
    const email = `e2e+${Date.now()}@example.com`;
    const password = "password123";
    const name = "E2E User";

    // REGISTER
    await page.goto("/register");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /create account/i }).click();

    // Auto sign-in after registration lands on dashboard
    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();

    // LOGOUT — dashboard form posts to /api/auth/signout without a CSRF token,
    // so NextAuth shows its confirmation page. Second click completes sign-out.
    await page.getByRole("button", { name: /log out/i }).click();
    await expect(
      page.getByRole("heading", { name: "Signout" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^sign out$/i }).click();
    await page.waitForURL("**/login");

    // LOGIN with the same credentials
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /^log in$/i }).click();

    await page.waitForURL("**/dashboard");
    await expect(page.getByText(email)).toBeVisible();
  });

  test("login with wrong password shows inline error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("wrongpass123");
    await page.getByRole("button", { name: /^log in$/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
