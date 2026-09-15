import { test, expect } from './support/test';
import { stubApi } from './support/api';
import plans from '../src/test/fixtures/plans.js';

// Plans in the app shell, in the production build (G22). Payloads from the engine's test flow.
const open = async (page, bootstrap, extra = {}) => {
  const api = await stubApi(page, { 'GET /bootstrap': bootstrap, ...extra });
  return api;
};

test('pages a plan doesn’t include show an upgrade screen and make no calls for them (BILL-002)', async ({ page }) => {
  const api = await open(page, plans.creativeBootstrap);
  await page.goto('/app/ads');
  const gate = page.getByRole('region', { name: 'Upgrade needed' });
  await expect(gate.getByRole('heading')).toHaveText('Ads, landing pages, forms and leads are on the Pro plan');
  await expect(gate).toContainText('Your organisation is on Creative.');
  expect(api.calls.filter((c) => c.key.includes('/ads/'))).toEqual([]);

  await page.goto('/app/home');
  await expect(page.getByRole('region', { name: 'Upgrade needed' }).getByRole('heading')).toHaveText('Performance Marketing is on the Growth plan');
  await page.getByRole('region', { name: 'Upgrade needed' }).getByRole('button', { name: /see your plan/i }).click();
  await expect(page).toHaveURL(/\/app\/billing$/);

  await page.goto('/app/brand');
  await expect(page.getByRole('region', { name: 'Upgrade needed' })).toHaveCount(0);
});

test('the launcher marks Performance Marketing with the plan it needs', async ({ page }) => {
  await open(page, plans.creativeBootstrap);
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: /Performance Marketing/ })).toContainText('Growth');
  await expect(page.getByRole('heading', { name: /^AI Studio$/ })).toBeVisible();
});

test('an ended trial and credits running out show a notice across the app', async ({ page }) => {
  await open(page, plans.trialEndedBootstrap);
  await page.goto('/app/brand');
  await expect(page.getByRole('status', { name: 'Plan notice' })).toContainText('Your free trial has ended');

  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await open(page, plans.growthBootstrap, { 'GET /billing/credits': plans.growthCreditsNear });
  await page.goto('/app/brand');
  await expect(page.getByRole('status', { name: 'Plan notice' })).toHaveText(/You’ve used 84% of this month’s 500 credits\./);
});
