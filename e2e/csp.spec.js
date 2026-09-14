import { test, expect } from './support/test';
import { stubApi, signedOut, signedInEmpty } from './support/api';

// Load the main screens under the production CSP (see support/test.js, which fails
// on any violation). Data is stubbed; screens may show empty or error states —
// this checks that their code, styles and fonts load under the policy.
const PUBLIC = ['/', '/login', '/pricing', '/forgot', '/privacy', '/terms'];
const APP = ['/app', '/app/studio', '/app/films', '/app/media', '/app/brand', '/app/home', '/app/campaigns',
  '/app/launch', '/app/ads', '/app/rules', '/app/budgets', '/app/pipeline', '/app/integrations', '/app/settings',
  '/app/analytics/acceptance'];

test('the policy is sent with the page', async ({ page }) => {
  await stubApi(page, signedOut);
  const res = await page.goto('/');
  const csp = res.headers()['content-security-policy'] || '';
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("object-src 'none'");
});

for (const path of PUBLIC) {
  test(`public page ${path} loads under the CSP`, async ({ page }) => {
    await stubApi(page, signedOut);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#root')).not.toBeEmpty();
  });
}

for (const path of APP) {
  test(`app screen ${path} loads under the CSP`, async ({ page }) => {
    await stubApi(page, signedInEmpty);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#root')).not.toBeEmpty();
  });
}
