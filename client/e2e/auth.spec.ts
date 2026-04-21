import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("register, login and logout round trip", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "E2ePass1!@#";

  await page.goto("/register");
  await page.getByLabel("First Name").fill("E2e");
  await page.getByLabel("Last Name").fill("Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Repeat Password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/login/);

  await login(page, email, password);

  await expect(page.getByRole("link", { name: "Log In" })).toHaveCount(0);

  await page.locator("header button").last().click();
  await expect(page.getByRole("link", { name: "Log In" })).toBeVisible();
});
