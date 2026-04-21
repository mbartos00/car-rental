import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("review a finished rental from the profile panel", async ({ page }) => {
  await login(page);

  await page.goto("/user");

  const reviewTrigger = page.getByRole("button", {
    name: /leave a review|edit review/i,
  });
  await expect(reviewTrigger.first()).toBeVisible();

  const isEdit = (await reviewTrigger.first().innerText()).match(/edit/i);

  await reviewTrigger.first().click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Rate 5 stars" }).click();
  await dialog
    .locator("#review-description")
    .fill("Fantastic rental experience, would repeat.");
  await dialog
    .getByRole("button", { name: isEdit ? "Update review" : "Submit review" })
    .click();

  await expect(
    page.getByText(isEdit ? "Review updated" : "Review added")
  ).toBeVisible({ timeout: 15_000 });

  await expect(
    page.getByRole("button", { name: "Edit review" }).first()
  ).toBeVisible();
});
