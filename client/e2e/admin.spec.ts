import { expect, test } from "@playwright/test";
import { login } from "./helpers";

const ADMIN = { email: "admin@morent.dev", password: "Admin1234!" };

const UNSPLASH = [
  "https://images.unsplash.com/photo-1722088386522-7cafb8a7e234",
  "https://images.unsplash.com/photo-1722088353797-ddfe6e2faf34",
  "https://images.unsplash.com/photo-1722088354368-5fc810337f77",
];

test("admin can create and delete a car from the dashboard", async ({
  page,
}) => {
  const carName = `E2E Test Car ${Date.now()}`;

  await login(page, ADMIN.email, ADMIN.password);

  await page.goto("/admin/cars");
  await expect(
    page.getByRole("heading", { name: "Cars", level: 1 })
  ).toBeVisible();

  await page.getByRole("button", { name: "Add car" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name").fill(carName);
  await dialog
    .getByLabel("Description")
    .fill(
      "An end to end test car created by the Playwright admin spec to verify the create flow."
    );
  await dialog.getByLabel("Price per day ($)").fill("111");
  await dialog.getByLabel("Seats").fill("5");
  await dialog.getByLabel("Tank capacity (L)").fill("50");

  const imageInputs = dialog.getByPlaceholder("https://images.unsplash.com/...");
  for (let i = 0; i < UNSPLASH.length; i++) {
    await imageInputs.nth(i).fill(UNSPLASH[i]);
  }

  await dialog.getByRole("button", { name: "Create car" }).click();

  const row = page.getByRole("row", { name: new RegExp(carName) });
  await expect(row).toBeVisible();

  await row.getByRole("button").last().click();
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(
    page.getByRole("row", { name: new RegExp(carName) })
  ).toHaveCount(0);
});
