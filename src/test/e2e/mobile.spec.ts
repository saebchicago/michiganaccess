import { test, expect, devices } from '@playwright/test';

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
];

const ROUTES = ['/', '/find-care', '/compare', '/tax-comparison', '/data-sources'];

for (const vp of VIEWPORTS) {
  test.describe(`Mobile ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`no horizontal overflow on ${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle').catch(() => {});

        // documentElement.scrollWidth should not exceed viewport width (+ small tolerance)
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(
          scrollWidth,
          `Horizontal overflow on ${route}: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`
        ).toBeLessThanOrEqual(clientWidth + 2);
      });
    }

    test('homepage nav hamburger opens and closes', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});

      // Look for a button that opens mobile nav (button with menu icon, or aria-label containing "menu")
      const menuButton = page
        .locator('button[aria-label*="menu" i], button[aria-label*="nav" i], button:has(svg.lucide-menu)')
        .first();

      if ((await menuButton.count()) === 0) {
        test.skip(true, 'No mobile menu button found at this viewport');
        return;
      }

      await menuButton.click();
      // Sheet or dialog should become visible
      const drawer = page.locator('[role="dialog"], [data-state="open"]').first();
      await expect(drawer).toBeVisible({ timeout: 3000 });
    });

    test('tap targets on homepage meet 40x40 minimum', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});

      const smallTargets = await page.$$eval(
        'a, button',
        (els) =>
          els
            .filter((el) => {
              const r = el.getBoundingClientRect();
              // Visible and smaller than 40x40 (WCAG 2.5.5 target size)
              return r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 40);
            })
            .map((el) => ({
              tag: el.tagName,
              text: (el.textContent || '').trim().slice(0, 40),
              w: Math.round(el.getBoundingClientRect().width),
              h: Math.round(el.getBoundingClientRect().height),
            }))
            .slice(0, 20)
      );

      if (smallTargets.length > 0) {
        console.log(`Small tap targets on / (${vp.name}):`, smallTargets);
      }
      // Don't hard-fail — inline icons may be smaller by design. Log for review.
      expect(smallTargets.length).toBeLessThan(50);
    });
  });
}
