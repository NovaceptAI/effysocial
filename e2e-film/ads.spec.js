import { test, expect, signInPlatformAdmin } from '../e2e/support/test';

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

// A rule that breaches is found by the scheduler and waits in the app (5.4, G35;
// ADS-009, ADS-012). The admin's Run now stands in for the minute timer.
test('a rule breach is found on a schedule, alerts, and only suggests the pause', async ({ page, browser }) => {
  let ws;

  await test.step('sign up, turn the sandbox on and set a pause rule', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `rules-${Date.now()}@example.in`, password: 'rules-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    expect((await page.request.post('/api/effy/ads/sandbox', { data: { workspace: ws, enabled: true } })).ok()).toBeTruthy();

    await page.goto('/app/rules');
    await page.getByPlaceholder('e.g. CPL guardrail').fill('Stop the bleeding');
    await page.getByRole('button', { name: 'Suggest pause' }).click();
    // A blank threshold is a rule that matches every campaign — it must be refused (ADS-009).
    await page.getByRole('button', { name: 'Create rule' }).click();
    await expect(page.getByText('Give the rule a threshold.')).toBeVisible();

    await page.getByRole('spinbutton').fill('1');
    await page.getByRole('button', { name: 'Create rule' }).click();
    await expect(page.getByText('Stop the bleeding')).toBeVisible();
    await expect(page.getByText(/the first check runs within half an hour/)).toBeVisible();
  });

  await test.step('the scheduler finds the breach (ADS-012)', async () => {
    // The admin runs the jobs now rather than waiting for the minute timer.
    const admin = await browser.newContext();
    const adminPage = await admin.newPage();
    await signInPlatformAdmin(adminPage);
    await adminPage.goto('/app/admin');
    const scheduler = adminPage.getByRole('region', { name: 'Scheduler' });
    await scheduler.getByRole('button', { name: 'Run now' }).click();
    await expect(adminPage.getByRole('status').filter({ hasText: /Ran \d+ job/ })).toBeVisible();
    await admin.close();
  });

  await test.step('the alert is waiting, in the page and in the bell', async () => {
    await page.goto('/app/rules');
    const alerts = page.getByRole('region', { name: 'Rule alerts' });
    await expect(alerts).toContainText('Rule “Stop the bleeding”');
    await expect(alerts.getByRole('button', { name: 'Pause campaign' }).first()).toBeVisible();

    await page.getByTitle('Notifications').click();
    await expect(page.getByText(/‘Stop the bleeding’ matched/).first()).toBeVisible();
    // The dropdown lays a sheet over the page; clicking it is how it closes.
    await page.locator('div.fixed.inset-0').click();
    await expect(page.getByText(/‘Stop the bleeding’ matched/)).toHaveCount(0);
  });

  await test.step('nothing was paused until it was asked for', async () => {
    const before = await (await page.request.get(`/api/effy/ads/dashboard?workspace=${ws}`)).json();
    expect(before.campaigns.filter((c) => c.status === 'active').length).toBeGreaterThan(0);

    const alerts = page.getByRole('region', { name: 'Rule alerts' });
    const first = alerts.getByRole('button', { name: 'Pause campaign' }).first();
    await first.click();
    await expect.poll(async () => {
      const after = await (await page.request.get(`/api/effy/ads/dashboard?workspace=${ws}`)).json();
      return after.campaigns.filter((c) => c.status === 'paused').length;
    }).toBeGreaterThan(before.campaigns.filter((c) => c.status === 'paused').length);
  });
});
