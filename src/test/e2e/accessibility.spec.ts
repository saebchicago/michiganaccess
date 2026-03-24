import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

const PAGES_TO_TEST = ['/', '/brief', '/compare', '/county', '/environment', '/data-insights'];

for (const path of PAGES_TO_TEST) {
  test(`A11Y: ${path} has zero critical/serious violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(
      page,
      undefined,
      {
        detailedReport: true,
        detailedReportOptions: { html: true },
      } as any,
      false,
    );
  });
}

test('A11Y: all buttons have accessible names', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const name =
      (await button.getAttribute('aria-label')) ?? (await button.textContent()) ?? '';
    expect(name.trim().length, 'Button missing accessible name').toBeGreaterThan(0);
  }
});

test('A11Y: keyboard navigation reaches key interactive elements', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  let focusedElements = 0;
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => document.activeElement?.tagName);
    if (['A', 'BUTTON', 'INPUT', 'SELECT'].includes(active ?? '')) focusedElements++;
  }
  expect(focusedElements).toBeGreaterThan(5);
});

test('A11Y: page has exactly one h1', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const h1s = await page.locator('h1').count();
  expect(h1s).toBe(1);
});

test('A11Y: all images have alt text', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    expect(alt, 'Image missing alt attribute').not.toBeNull();
  }
});
