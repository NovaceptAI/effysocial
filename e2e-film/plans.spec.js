import { test, expect, signInPlatformAdmin } from '../e2e/support/test';

// Plans against the real engine (launch plan 3.4, G22): a platform admin moves an
// organisation to Creative from Admin, and Performance Marketing closes in the UI and
// the API at once; moving it to Pro opens it again. BILL-002.

test('an admin changes an organisation’s plan and the app follows', async ({ page, browser }) => {
  const stamp = Date.now();
  const orgName = `Plan check ${stamp}`;
  let ws;

  await test.step('an owner signs up on the trial', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `owner-${stamp}@example.in`, password: 'plans-e2e-123', name: 'Asha Rao', orgName, orgType: 'business' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    await page.goto('/app/billing');
    await expect(page.getByRole('status')).toContainText('Your free trial includes everything in Pro');
  });

  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  const setPlan = async (plan) => {
    await admin.goto('/app/admin');
    const select = admin.getByRole('region', { name: 'Organisations and plans' }).getByRole('combobox', { name: `Plan for ${orgName}` });
    await select.selectOption(plan);
    await expect(select).toHaveValue(plan);
  };

  await test.step('the platform admin moves it to Creative', async () => {
    await signInPlatformAdmin(admin);   // it may already exist from an earlier spec
    await setPlan('Creative');
  });

  await test.step('Performance Marketing closes in the UI and the API (BILL-002)', async () => {
    await page.goto('/app/ads');
    await expect(page.getByRole('region', { name: 'Upgrade needed' })).toContainText('Your organisation is on Creative.');
    const lead = await page.request.post('/api/effy/leads', { data: { workspace: ws, name: 'Kiran' } });
    expect(lead.status()).toBe(403);
    expect((await lead.json()).code).toBe('plan_required');
    await page.goto('/app/studio');
    await expect(page.getByRole('region', { name: 'Upgrade needed' })).toHaveCount(0);
  });

  await test.step('moving it to Pro opens it again', async () => {
    await setPlan('Pro');
    await page.goto('/app/ads');
    await expect(page.getByRole('region', { name: 'Upgrade needed' })).toHaveCount(0);
    const lead = await page.request.post('/api/effy/leads', { data: { workspace: ws, name: 'Kiran' } });
    expect(lead.status()).toBe(200);
  });

  await adminContext.close();
});
