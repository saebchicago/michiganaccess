import { test, expect } from "@playwright/test";

test.describe("Critical User Flows", () => {
  test("Homepage loads and has ZIP input", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Access Michigan/i);
    const body = await page.textContent("body");
    expect(body).toContain("Michigan");
  });

  test("ZIP Intelligence page loads", async ({ page }) => {
    await page.goto("/zip-intelligence?zip=48126");
    await page.waitForTimeout(5000);
    const body = await page.textContent("body");
    expect(body).toContain("Know Your Neighborhood");
  });

  test("Health Equity Atlas page loads", async ({ page }) => {
    await page.goto("/health-equity-atlas");
    await page.waitForTimeout(3000);
    const body = await page.textContent("body");
    expect(body).toContain("Health Equity");
  });

  test("County Comparison loads", async ({ page }) => {
    await page.goto("/compare");
    await page.waitForTimeout(3000);
    const body = await page.textContent("body");
    expect(body).toContain("Compare");
  });

  test("Financial Help has screener", async ({ page }) => {
    await page.goto("/financial-help");
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toContain("Financial");
  });

  test("Reentry page loads", async ({ page }) => {
    await page.goto("/reentry");
    await expect(page.locator("body")).toContainText("Coming Home");
  });

  test("Tax Comparison loads", async ({ page }) => {
    await page.goto("/tax-comparison");
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toContain("Tax Comparison");
  });

  test("Data Sources page loads", async ({ page }) => {
    await page.goto("/data-sources");
    const body = await page.textContent("body");
    expect(body).toContain("Data Sources");
  });

  test("Equity page loads", async ({ page }) => {
    await page.goto("/equity");
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toContain("Equity");
  });
});
