import { test, expect } from './support/test';
import { stubApi } from './support/api';
import plans from '../src/test/fixtures/plans.js';

// The Performance Marketing rail stays open when it opens a page both menus share (G45, SHELL-002).
test('AI Studio, Media Library and Settings opened from the marketing rail keep that rail', async ({ page }) => {
  await stubApi(page, { 'GET /bootstrap': plans.trialBootstrap });
  await page.goto('/app/campaigns');
  const rail = page.getByRole('navigation');
  const marketingRail = rail.getByRole('button', { name: /^Advertise/ });
  await expect(marketingRail).toBeVisible();

  for (const [group, item, url] of [['Content', 'AI Studio', /\/app\/studio$/], ['Content', 'Media Library', /\/app\/media$/], ['Administration', 'Settings', /\/app\/settings$/]]) {
    await rail.getByRole('button', { name: new RegExp(`^${group}`) }).click();
    await page.getByRole('link', { name: item, exact: true }).click();
    await expect(page).toHaveURL(url);
    await expect(marketingRail).toBeVisible();
    await expect(rail.getByRole('link', { name: 'Perf. Marketing' })).toHaveCount(0);
  }

  await page.reload(); // still the marketing rail in this tab
  await expect(marketingRail).toBeVisible();

  await rail.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(rail.getByRole('link', { name: 'Perf. Marketing' })).toBeVisible();
  await rail.getByRole('link', { name: 'AI Studio' }).click();
  await expect(rail.getByRole('link', { name: 'Perf. Marketing' })).toBeVisible(); // from the hub, the hub stays
});
