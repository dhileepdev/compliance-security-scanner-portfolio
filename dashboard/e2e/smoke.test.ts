import { test, expect } from "@playwright/test";

test("renders compliance, rules, and vulnerability cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Compliance Score", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rules", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vulnerabilities", exact: true })).toBeVisible();
});
