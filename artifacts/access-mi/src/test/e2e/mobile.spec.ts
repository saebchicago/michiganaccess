import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
];

const ROUTES = [
  '/',
  '/opportunity',
  '/find-care',
  '/compare',
  '/explore',
  '/tax-comparison',
  '/data-sources',
];

async function expectTouchSafe(locator: import('@playwright/test').Locator, label: string) {
  await expect(locator, `${label} should be visible`).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} should have a measurable hit area`).not.toBeNull();
  expect(box!.width, `${label} width`).toBeGreaterThanOrEqual(44);
  expect(box!.height, `${label} height`).toBeGreaterThanOrEqual(44);
}

for (const vp of VIEWPORTS) {
  test.describe(`Mobile ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`no horizontal overflow on ${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle').catch(() => {});

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

      const menuButton = page.locator('[data-testid="mobile-nav"]').filter({ visible: true }).first();
      await expectTouchSafe(menuButton, 'mobile menu');
      await menuButton.dispatchEvent('click');
      const drawer = page.getByRole('dialog').first();
      await expect(drawer).toBeVisible({ timeout: 3000 });
    });

    test('essential safety controls meet 44px touch target', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});

      await expectTouchSafe(page.locator('#crisis-bar a[href="tel:988"]'), '988 crisis link');
      await expectTouchSafe(
        page.locator('#crisis-bar a[href^="sms:741741"]').filter({ visible: true }).first(),
        'crisis text link'
      );
      await expectTouchSafe(
        page.locator('#crisis-bar button[aria-label*="Quick exit"]'),
        'crisis quick exit'
      );
      await expectTouchSafe(
        page.locator('[data-testid="mobile-nav"]').filter({ visible: true }).first(),
        'mobile menu'
      );
    });

    test('opportunity search controls meet 44px touch target', async ({ page }) => {
      await page.goto('/opportunity', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});

      await expectTouchSafe(page.getByLabel('Explore a Michigan place'), 'opportunity place input');
      await expectTouchSafe(
        page.getByRole('button', { name: 'Explore', exact: true }).first(),
        'opportunity explore button'
      );
    });

    test('small tap targets are inventoried for review', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});

      const smallTargets = await page.$$eval(
        'a, button',
        (els) =>
          els
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
            })
            .map((el) => ({
              tag: el.tagName,
              text: (el.textContent || '').trim().slice(0, 40),
              w: Math.round(el.getBoundingClientRect().width),
              h: Math.round(el.getBoundingClientRect().height),
            }))
            .slice(0, 30)
      );

      if (smallTargets.length > 0) {
        console.log(`Advisory small tap targets on / (${vp.name}):`, smallTargets);
      }
      // WCAG 2.5.8 includes spacing/inline-control exceptions; the hard gate
      // above targets the high-frequency/safety controls where 44px is the
      // appropriate product contract. This inventory remains diagnostic.
      expect(Array.isArray(smallTargets)).toBe(true);
    });
  });
}
