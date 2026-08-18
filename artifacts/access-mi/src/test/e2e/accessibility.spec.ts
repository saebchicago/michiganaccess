import { test, expect } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

const PAGES_TO_TEST = ['/', '/brief', '/compare', '/county', '/environment', '/data-insights'];

for (const path of PAGES_TO_TEST) {
  test(`A11Y: ${path} has zero critical/serious violations`, async ({ page }) => {
    // Suppress first-visit onboarding tour to avoid false-positive contrast violations
    await page.addInitScript(() => {
      localStorage.setItem('accessmi_tour_seen', 'true');
    });
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    // Give React a moment to render, but don't block on external API calls
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await injectAxe(page);

    // getViolations + an explicit assertion rather than checkA11y, so a
    // failure names the rule, its impact, and the offending selectors in the
    // CI log. checkA11y's assertion prints only "1 !== 0"; when /environment
    // failed on 2026-08-17 the log gave no way to tell which rule broke, and
    // the page could not be reproduced locally because it renders live AQI
    // data. Same strictness, diagnosable output.
    // getViolations does NOT honour `includedImpacts` - it returns every
    // impact level - so the filter is applied here. Passing the option and
    // trusting it silently promotes this gate from critical/serious to
    // all-impacts, which fails pages that are meant to pass (e.g. /compare
    // reports a moderate "region" violation).
    const BLOCKING_IMPACTS = ['critical', 'serious'];
    const allViolations = await getViolations(page);
    const violations = allViolations.filter(
      (v) => v.impact && BLOCKING_IMPACTS.includes(v.impact),
    );

    if (violations.length > 0) {
      for (const v of violations) {
        console.error(
          `[a11y] ${path} ${v.impact?.toUpperCase()} ${v.id}: ${v.help}\n` +
            `       ${v.helpUrl}\n` +
            v.nodes
              .map(
                (n) =>
                  `       target: ${JSON.stringify(n.target)}\n` +
                  `       ${(n.failureSummary ?? '').replace(/\n/g, '\n       ')}`,
              )
              .join('\n'),
        );
      }
    }

    expect(
      violations.map((v) => `${v.impact}:${v.id}`),
      `critical/serious a11y violations on ${path}`,
    ).toEqual([]);
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
