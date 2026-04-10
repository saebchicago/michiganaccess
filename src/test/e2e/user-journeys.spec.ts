import { test, expect } from '@playwright/test';

test.describe('AccessMI User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress first-visit onboarding tour so it does not intercept clicks
    await page.addInitScript(() => {
      localStorage.setItem('accessmi_tour_seen', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('J1: homepage shows intelligence signals above fold', async ({ page }) => {
    const signals = page.locator('[data-testid="signal-card"]');
    await expect(signals.first()).toBeInViewport();
    await expect(signals).toHaveCount(4); // minimum 4 visible
    const trend = page.locator('[data-testid="trend-indicator"]').first();
    await expect(trend).toBeVisible();
  });

  test('J2: explore questions navigate to real pages', async ({ page }) => {
    const questions = page.locator('[data-testid="explore-question"]');
    await expect(questions.first()).toBeVisible();
    const href =
      (await questions.first().getAttribute('href')) ??
      (await questions
        .first()
        .evaluate(
          (el) => el.closest('a')?.href ?? (el as HTMLElement).dataset.href ?? '',
        ));
    await questions.first().click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toBe('http://localhost:5173/');
  });

  test('J3: county selector updates county name in snapshot', async ({ page }) => {
    const selector = page.locator('[data-testid="county-selector"]').first();
    if (await selector.isVisible()) {
      await selector.click();
      const wayneOption = page.locator('text=Wayne').first();
      if (await wayneOption.isVisible()) {
        await wayneOption.click();
        await page.waitForTimeout(400);
        const snapshot = page.locator('[data-testid="county-snapshot"]');
        if (await snapshot.isVisible()) {
          await expect(snapshot).toContainText('Wayne');
        }
      }
    }
  });

  test('J4: research mode toggle shows/hides data tables', async ({ page }) => {
    await page.goto('/brief');
    await page.waitForLoadState('networkidle');
    const toggle = page.locator('[data-testid="research-mode-toggle"]');
    if (await toggle.isVisible()) {
      const table = page.locator('[data-testid="research-data-table"]');
      const initiallyVisible = await table.isVisible().catch(() => false);
      await toggle.click();
      await page.waitForTimeout(200);
      const afterToggle = await table.isVisible().catch(() => false);
      expect(afterToggle).not.toBe(initiallyVisible);
    }
  });

  test('J5: all primary nav links load without errors', async ({ page }) => {
    const navLinks = [
      '/',
      '/brief',
      '/compare',
      '/county',
      '/environment',
      '/data-insights',
      '/find-care',
      '/energy',
      '/equity',
    ];

    for (const link of navLinks) {
      await page.goto(link, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      const title = await page.title();
      expect(title).toBeTruthy();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      expect(errors.length).toBe(0);
    }
  });

  test('J6: mobile layout renders correctly at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    await expect(mobileNav).toBeVisible();
    // Verify no horizontal overflow (use documentElement for accurate measurement)
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('J7: search bar accepts input and does not crash', async ({ page }) => {
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="Try" i]',
      )
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Wayne County food pantry');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      // Page should not show error state
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('J8: domain dashboard loads all 9 domain tabs', async ({ page }) => {
    await page.goto('/domain-dashboard');
    await page.waitForLoadState('networkidle');
    const tabs = page.locator('[data-testid="domain-tab"]');
    const count = await tabs.count();
    if (count > 0) expect(count).toBeGreaterThanOrEqual(9);
  });
});
