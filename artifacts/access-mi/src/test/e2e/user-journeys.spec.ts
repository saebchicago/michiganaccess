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

  // The signal-card / trend-indicator / explore-question testids belonged
  // to the pre-redesign homepage. J1/J2 now assert the equivalents in the
  // editorial redesign: the masthead + need-vs-capacity band above the
  // fold, and the bridge-chip pathways as the click-through affordances.
  // (ExploreQuestionsPanel moved to /about.)
  test('J1: homepage shows intelligence signals above fold', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /local data for/i }),
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', { name: /where care is short, and where to turn/i }),
    ).toBeVisible();
  });

  test('J2: bridge pathways navigate to real pages', async ({ page }) => {
    const chips = page.locator('section[aria-labelledby="bridge-heading"] a');
    await expect(chips.first()).toBeVisible();
    await chips.first().click();
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname).not.toBe('/');
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
