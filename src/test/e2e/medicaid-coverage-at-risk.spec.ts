import { test, expect } from "@playwright/test";

test.describe("Medicaid Coverage at Risk — V2 Feature 3", () => {
  // T1: Page loads and county table renders
  test("data page renders h1, stat cards, and county table rows", async ({ page }) => {
    await page.goto("/data/medicaid-coverage-at-risk");
    await expect(page.locator("h1")).toContainText("Medicaid Coverage at Risk");
    await expect(page.getByTestId("medicaid-stat-urban")).toBeVisible();
    await expect(page.getByTestId("medicaid-stat-urban")).toContainText("171,000");
    await expect(page.getByTestId("medicaid-stat-urban")).toContainText("355,000");
    await expect(page.getByTestId("medicaid-stat-kff")).toContainText("$31.6");
    await expect(page.getByTestId("medicaid-stat-counties")).toContainText("83");
    await expect(page.getByTestId("medicaid-county-table")).toBeVisible();
    await expect(page.getByTestId("medicaid-county-table").locator("tbody tr")).toHaveCount(83);
  });

  // T2: Scope qualifier labels visible on stat cards
  test("stat cards display scope qualifier labels", async ({ page }) => {
    await page.goto("/data/medicaid-coverage-at-risk");
    await expect(page.getByTestId("medicaid-stat-urban")).toContainText("Work requirement provisions only");
    await expect(page.getByTestId("medicaid-stat-kff")).toContainText("All P.L. 119-21 Medicaid provisions");
    await expect(page.getByTestId("medicaid-stat-counties")).toContainText("Statewide coverage");
  });

  // T3: Amber callout contains disclaimer text
  test("amber callout shows 'Exposure is not disenrollment'", async ({ page }) => {
    await page.goto("/data/medicaid-coverage-at-risk");
    await expect(page.getByTestId("medicaid-callout-heading")).toHaveText("Exposure is not disenrollment");
  });

  // T4: Cross-feature navigation — Related analyses block links to SNAP page
  test("related analyses block links to SNAP coverage at risk", async ({ page }) => {
    await page.goto("/data/medicaid-coverage-at-risk");
    const snapLink = page.locator("a[href='/data/snap-coverage-at-risk']");
    await expect(snapLink).toBeVisible();
    await snapLink.click();
    await expect(page).toHaveURL(/snap-coverage-at-risk/);
    await expect(page.locator("h1")).toContainText("SNAP Coverage at Risk");
  });

  // T5: CSV download button is present and clickable
  test("CSV export button is visible in county breakdown section", async ({ page }) => {
    await page.goto("/data/medicaid-coverage-at-risk");
    const csvBtn = page.locator("button[title='Download county data as CSV']");
    await expect(csvBtn).toBeVisible();
    // Set up download listener to confirm it fires without error
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      csvBtn.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/michigan-medicaid-coverage-at-risk-\d{4}-\d{2}-\d{2}\.csv/);
  });

  // T6: Mobile breadcrumb does not overflow viewport
  test("breadcrumb does not overflow on 375px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/data/medicaid-coverage-at-risk");
    const breadcrumb = page.locator("nav[aria-label='Breadcrumb']");
    await expect(breadcrumb).toBeVisible();
    const box = await breadcrumb.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  // T7: /data-and-insights hub shows Medicaid Coverage at Risk card
  test("/data-and-insights shows Medicaid Coverage at Risk card", async ({ page }) => {
    await page.goto("/data-and-insights");
    await expect(page.locator("text=Medicaid Coverage at Risk")).toBeVisible();
  });

  // T8: Home page features P.L. 119-21 section with Medicaid link
  test("home page shows P.L. 119-21 Impact Projections section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=P.L. 119-21 Impact Projections")).toBeVisible();
    await expect(page.locator("a[href='/data/medicaid-coverage-at-risk']")).toBeVisible();
  });

  // T9: JSON-LD Dataset schema appears in HTML source
  test("JSON-LD Dataset schema is injected for the data page", async ({ page }) => {
    await page.goto("/data/medicaid-coverage-at-risk");
    // Wait for React to hydrate
    await page.waitForLoadState("networkidle");
    const jsonLdContent = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[data-page-jsonld]'));
      return scripts.map((s) => s.textContent).join("");
    });
    expect(jsonLdContent).toContain('"@type":"Dataset"');
    expect(jsonLdContent).toContain("medicaid-coverage-at-risk");
  });
});

test.describe("SNAP Coverage at Risk — V3 Feature cross-checks", () => {
  // T-SNAP-1: CSV export on SNAP page
  test("SNAP CSV export button fires download", async ({ page }) => {
    await page.goto("/data/snap-coverage-at-risk");
    const csvBtn = page.locator("button[title='Download county data as CSV']");
    await expect(csvBtn).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      csvBtn.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/michigan-snap-coverage-at-risk-\d{4}-\d{2}-\d{2}\.csv/);
  });

  // T-SNAP-2: SNAP callout h2 is text-xl (not text-lg)
  test("SNAP callout h2 renders at correct size (text-xl class)", async ({ page }) => {
    await page.goto("/data/snap-coverage-at-risk");
    const h2 = page.locator(".text-xl").filter({ hasText: "Exposure does not equal loss" });
    await expect(h2).toBeVisible();
  });
});
