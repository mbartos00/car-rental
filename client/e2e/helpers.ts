import { Page, expect } from "@playwright/test";

export const TEST_USER = {
  email: "testauth@example.com",
  password: "Test123!@#",
};

export const login = async (
  page: Page,
  email = TEST_USER.email,
  password = TEST_USER.password
) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("link", { name: "Log In" })).toHaveCount(0);
};

export const pickDate = async (page: Page, date: Date) => {
  await page
    .getByRole("button", { name: /select your date/i })
    .first()
    .click();
  const dialog = page.getByRole("dialog").last();

  const monthLabel = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  for (let i = 0; i < 12; i++) {
    if (await dialog.getByText(monthLabel, { exact: true }).count()) break;
    await dialog.getByRole("button", { name: /next month/i }).click();
  }

  const month = date.toLocaleDateString("en-US", { month: "long" });
  const dayPattern = new RegExp(
    `${month} ${date.getDate()}(st|nd|rd|th), ${date.getFullYear()}`
  );

  await dialog.getByRole("button", { name: dayPattern }).click();
};
