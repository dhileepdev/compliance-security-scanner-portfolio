import { test, expect } from "@playwright/test";

test("renders compliance, rules, and vulnerability cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Compliance Score", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rules", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vulnerabilities", exact: true })).toBeVisible();
});

test("renders rules page", async ({ page }) => {
  await page.goto("/rules");
  await expect(page.getByRole("heading", { name: "Rules" })).toBeVisible();
});

test("renders trend page", async ({ page }) => {
  await page.goto("/trend");
  await expect(page.getByRole("heading", { name: "Trend", exact: true })).toBeVisible();
});

test("renders vulnerabilities page", async ({ page }) => {
  await page.goto("/vulnerabilities");
  await expect(page.getByRole("heading", { name: "Vulnerabilities" })).toBeVisible();
});
