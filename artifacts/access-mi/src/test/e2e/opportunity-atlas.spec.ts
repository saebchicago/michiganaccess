import { test, expect } from '@playwright/test';

test.describe('Community Opportunity Atlas', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessmi_tour_seen', 'true');
    });
  });

  test('resolves a ZIP into a canonical, source-backed local brief', async ({ page }) => {
    await page.goto('/opportunity', { waitUntil: 'domcontentloaded' });

    await page.getByLabel('Explore a Michigan place').fill('48201');
    await page.getByRole('button', { name: 'Explore', exact: true }).click();

    await expect(page).toHaveURL(/\/opportunity\?place=zcta-48201/);
    await expect(page.getByRole('heading', { name: 'ZIP 48201' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Source-backed local signals' })).toBeVisible();
    await expect(page.getByText(/county-context values/i).first()).toBeVisible();
  });

  test('supports comparison and a local-device follow loop without an account', async ({ page }) => {
    await page.goto('/opportunity?place=county-26163', { waitUntil: 'domcontentloaded' });

    const followButton = page.getByRole('button', { name: 'Follow this place' });
    await expect(followButton).toBeVisible();
    await followButton.click();
    await expect(page.getByRole('button', { name: 'Following' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Saved communities' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Wayne County/i })).toBeVisible();

    await page.getByLabel('Add comparison place').fill('Oakland County');
    await page.getByRole('button', { name: 'Explore', exact: true }).last().click();

    await expect(page).toHaveURL(/compare=county-26125/);
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText(/does not create a best\/worst composite ranking/i)).toBeVisible();
  });
});
