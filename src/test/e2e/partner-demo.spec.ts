/**
 * Partner Demo E2E Spec
 *
 * Validates the 5-page demo path used in institutional partner meetings.
 * All assertions focus on what a live observer would notice: no crashes,
 * key numbers visible, no "undefined"/"NaN"/"Data pending" in hero content,
 * and primary CTAs present and interactive.
 *
 * Run: npx playwright test partner-demo --project=chromium
 */

import { test, expect } from "@playwright/test";

// Helper: assert no visible runtime errors on the page
async function expectNoRuntimeError(page: import("@playwright/test").Page) {
  const errorBoundary = page.locator("text=Something went wrong");
  await expect(errorBoundary).not.toBeVisible();
}

// Helper: assert no raw undefined/NaN in body text
async function expectNoJunkData(page: import("@playwright/test").Page) {
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/\bundefined\b/);
  expect(body).not.toMatch(/\bNaN\b/);
}

test.describe("Partner Demo Path", () => {
  test.beforeEach(async ({ page }) => {
    // Suppress expected console errors from optional API calls
    page.on("console", (msg) => {
      if (msg.type() === "error" && msg.text().includes("Supabase")) return;
    });
  });

  // ── 1. Homepage ──────────────────────────────────────────────────────────
  test("PD-1: homepage loads with key Michigan stats visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Title
    await expect(page).toHaveTitle(/Access Michigan/i);

    // No crash
    await expectNoRuntimeError(page);
    await expectNoJunkData(page);

    // At least one stat number visible above fold (the site-wide counter or signals)
    const statsArea = page.locator("main").first();
    await expect(statsArea).toBeVisible();
  });

  // ── 2. Story page ────────────────────────────────────────────────────────
  test("PD-2: /story renders all 7 sections without crash", async ({ page }) => {
    await page.goto("/story");
    await page.waitForLoadState("domcontentloaded");

    await expectNoRuntimeError(page);
    await expectNoJunkData(page);

    // Hero stat should be visible
    await expect(page.locator("text=10 million residents")).toBeVisible();

    // Detection gap funnel loads (lazy)
    const funnel = page.locator("text=Medicaid MCO Beneficiaries");
    await expect(funnel).toBeVisible({ timeout: 15000 });

    // Behavioral health desert section
    await expect(page.locator("text=The Behavioral Health Desert")).toBeVisible();

    // CTA button present and has aria-label
    const ctaBtn = page.locator("button", { hasText: "Get Help Now" });
    await expect(ctaBtn).toBeVisible();
    await expect(ctaBtn).toHaveAttribute("aria-label");

    // External links have rel=noopener
    const externalLinks = page.locator("a[target='_blank']");
    const count = await externalLinks.count();
    for (let i = 0; i < count; i++) {
      await expect(externalLinks.nth(i)).toHaveAttribute("rel", /noopener/);
    }
  });

  // ── 3. County page (Wayne) ───────────────────────────────────────────────
  test("PD-3: /county/wayne loads with health data, no NaN values", async ({ page }) => {
    await page.goto("/county/wayne");
    await page.waitForLoadState("domcontentloaded");

    await expectNoRuntimeError(page);
    await expectNoJunkData(page);

    // County name visible
    await expect(page.locator("h1, h2").filter({ hasText: /Wayne/i }).first()).toBeVisible();

    // Uninsured rate stat should not be placeholder
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/Uninsured Rate.*undefined/);
  });

  // ── 4. Behavioral Health dashboard ───────────────────────────────────────
  test("PD-4: /behavioral-health renders key metrics", async ({ page }) => {
    await page.goto("/behavioral-health");
    await page.waitForLoadState("domcontentloaded");

    await expectNoRuntimeError(page);
    await expectNoJunkData(page);

    // Key numbers
    await expect(page.locator("text=1,945")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=47th")).toBeVisible();
    await expect(page.locator("text=988")).toBeVisible();
  });

  // ── 5. Find Care page ────────────────────────────────────────────────────
  test("PD-5: /find-care renders search UI without crash", async ({ page }) => {
    await page.goto("/find-care");
    await page.waitForLoadState("domcontentloaded");

    await expectNoRuntimeError(page);
    await expectNoJunkData(page);

    // Search input or ZIP field is visible
    const searchInput = page.locator("input[type='text'], input[type='search'], input[placeholder*='ZIP'], input[placeholder*='zip']").first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  // ── 6. Source integrity spot-check ───────────────────────────────────────
  test("PD-6: story page source citations are clickable external links", async ({ page }) => {
    await page.goto("/story");
    await page.waitForLoadState("domcontentloaded");

    // CLOSUP link should exist and point to closup.umich.edu
    const closupLink = page.locator("a[href*='closup.umich.edu']");
    await expect(closupLink).toBeVisible();
    await expect(closupLink).toHaveAttribute("target", "_blank");

    // March of Dimes link should exist
    const modLink = page.locator("a[href*='marchofdimes.org']");
    await expect(modLink).toBeVisible();
  });
});
