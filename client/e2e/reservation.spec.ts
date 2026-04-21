import { expect, test } from "@playwright/test";
import { login, pickDate } from "./helpers";

test("reserve a car with stripe test card and cancel it", async ({ page }) => {
  test.setTimeout(120_000);

  await login(page);

  await page.goto("/cars");
  await page
    .getByRole("link", { name: "Rent Now" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/cars\/[a-f\d]{24}/);

  await page.getByRole("link", { name: "Rent Now" }).first().click();
  await expect(page).toHaveURL(/\/reservation\/[a-f\d]{24}/);

  await page.getByLabel("Name").fill("E2e Billing");
  await page.getByLabel("Phone Number").fill("+48123456789");
  await page.getByLabel("Address").fill("Testing Street 12");
  await page.getByLabel("Town / City").fill("Warsaw");

  const pickupDate = new Date(Date.now() + 60 * 86_400_000);
  const dropoffDate = new Date(Date.now() + 62 * 86_400_000);

  const selects = page.getByRole("combobox");
  await selects.nth(0).click();
  await page.getByRole("option").first().click();
  await pickDate(page, pickupDate);
  await selects.nth(1).click();
  await page.getByRole("option", { name: "10:00" }).click();

  await selects.nth(2).click();
  await page.getByRole("option").last().click();
  await pickDate(page, dropoffDate);
  await selects.nth(3).click();
  await page.getByRole("option", { name: "12:00" }).click();

  const cardFrame = page.frameLocator('iframe[title="Secure card payment input frame"]');
  await cardFrame.locator('[name="cardnumber"]').fill("4242424242424242");
  await cardFrame.locator('[name="exp-date"]').fill("12/30");
  await cardFrame.locator('[name="cvc"]').fill("123");

  await page.getByLabel(/terms and conditions/i).click();

  await page.getByRole("button", { name: "Rent Now" }).click();

  await expect(page.getByText("Reservation confirmed")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page).toHaveURL(/\/user/, { timeout: 15_000 });

  const reservationRow = page
    .locator("div")
    .filter({ has: page.getByRole("button", { name: "Cancel" }) })
    .last();
  await expect(reservationRow).toBeVisible();

  await page.getByRole("button", { name: "Cancel", exact: true }).first().click();
  await page
    .getByRole("button", { name: "Cancel reservation", exact: true })
    .click();

  await expect(
    page.getByText("Reservation cancelled and payment refunded")
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("CANCELLED").first()).toBeVisible();
});
