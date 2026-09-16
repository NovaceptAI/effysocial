import { test, expect } from '../e2e/support/test';

// Advertising Analytics against the real engine (launch plan 5.3, G34; ADS-011):
// with the sandbox ad account on, the page shows the numbers and cuts them; with it
// off, it asks for an ad account instead of showing sample data.
test('advertising analytics runs on the ads adapter, and says when nothing is connected', async ({ page }) => {
  let ws;

  await test.step('sign up and turn the sandbox ad account on', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `ads-${Date.now()}@example.in`, password: 'ads-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    expect((await page.request.post('/api/effy/ads/sandbox', { data: { workspace: ws, enabled: true } })).ok()).toBeTruthy();
  });

  await test.step('the page shows badged sandbox performance and cuts it', async () => {
    await page.goto('/app/analytics/ads');
    await expect(page.getByText('Sandbox data — not live spend')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Impressions to leads' })).toContainText('Impressions');
    await expect(page.getByRole('region', { name: 'Cheapest leads' })).toBeVisible();

    const cuts = page.getByRole('region', { name: 'Where the money went' });
    await expect(cuts.getByRole('columnheader', { name: 'ROAS' })).toBeVisible();
    await cuts.getByRole('button', { name: 'Creative format' }).click();
    await expect(cuts.getByRole('columnheader', { name: 'CTR' })).toBeVisible();
    await expect(cuts.getByRole('cell', { name: 'Image' })).toBeVisible();
    await cuts.getByRole('button', { name: 'Audience' }).click();
    await expect(cuts.getByRole('columnheader', { name: 'Size' })).toBeVisible();
  });

  await test.step('with the sandbox off it asks for an ad account', async () => {
    expect((await page.request.post('/api/effy/ads/sandbox', { data: { workspace: ws, enabled: false } })).ok()).toBeTruthy();
    await page.goto('/app/analytics/ads');
    await expect(page.getByRole('heading', { name: 'Connect an ad account' })).toBeVisible();
    await expect(page.getByText('Sandbox data — not live spend')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Where the money went' })).toHaveCount(0);
  });
});
