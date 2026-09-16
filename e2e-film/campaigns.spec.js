import { test, expect } from '../e2e/support/test';

// A campaign's workspace against the real engine (launch plan 5.1, G40): New campaign
// opens the wizard, every tab shows the campaign's own rows, Edit saves, and Ask Effy
// opens the assistant with a question about this campaign. CAMP-005, CAMP-007.
test('a campaign’s tabs show its own work, and Edit and Ask Effy act', async ({ page }) => {
  const stamp = Date.now();
  let ws;
  let campaign;

  await test.step('sign up and build a campaign with work hanging off it', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `campaigns-${stamp}@example.in`, password: 'campaign-e2e-123', name: 'Asha Rao', orgName: 'Northwind' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    const post = (path, data) => page.request.post(`/api/effy${path}`, { data });
    campaign = (await (await post('/campaigns', {
      workspace: ws, name: 'Monsoon Drive', objective: 'Lead generation', budget: 40000, pillar: 'Proof', channels: ['instagram'],
    })).json()).campaign;
    expect((await post('/posts', { workspace: ws, title: 'Terrace before and after', campaignId: campaign.id, date: '2026-10-02', time: '18:00' })).ok()).toBeTruthy();
    expect((await post('/landing', { workspace: ws, name: 'Monsoon landing', campaignId: campaign.id })).ok()).toBeTruthy();
    expect((await post('/forms', { workspace: ws, name: 'Monsoon enquiry', campaignId: campaign.id })).ok()).toBeTruthy();
    expect((await post('/leads', { workspace: ws, name: 'Vikram Shah', campaignId: campaign.id, source: 'form' })).ok()).toBeTruthy();
  });

  await test.step('New campaign opens the wizard (CAMP-005)', async () => {
    await page.goto('/app/campaigns');
    await page.getByRole('button', { name: 'New campaign' }).click();
    await expect(page).toHaveURL(/\/app\/launch$/);
    await expect(page.getByRole('heading', { name: 'Launch a Campaign' })).toBeVisible();
  });

  await test.step('every tab shows this campaign’s rows (CAMP-007)', async () => {
    await page.goto(`/app/campaigns/${campaign.id}`);
    const tab = (name) => page.locator('main').getByRole('button', { name, exact: true });
    await expect(page.getByRole('heading', { name: 'Monsoon Drive' })).toBeVisible();
    await expect(page.getByText('Funnel — content to revenue')).toBeVisible();

    await tab('Content').click();
    await expect(page.getByRole('button', { name: /Terrace before and after/ })).toBeVisible();

    await tab('Conversion').click();
    await expect(page.getByText('Monsoon landing')).toBeVisible();
    await expect(page.getByText('Monsoon enquiry')).toBeVisible();

    await tab('Leads').click();
    await expect(page.getByRole('table')).toContainText('Vikram Shah');

    await tab('Ads').click();
    await expect(page.getByText(/EffySocial doesn’t run ads yet/)).toBeVisible();

    await tab('Plan').click();
    await expect(page.getByRole('heading', { name: 'No marketing plan yet' })).toBeVisible();

    await tab('Analytics').click();
    await expect(page.getByText('Leads by stage')).toBeVisible();

    await tab('Activity').click();
    await expect(page.getByText('Campaign “Monsoon Drive” created')).toBeVisible();
    await expect(page.getByText('Lead Vikram Shah arrived from form')).toBeVisible();
    await expect(page.getByText(/next in the build/)).toHaveCount(0);
  });

  await test.step('Edit saves the campaign', async () => {
    await page.getByRole('button', { name: 'Edit' }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit campaign' });
    await dialog.getByLabel('Name').fill('Monsoon Drive 2026');
    await dialog.getByLabel('Status').selectOption('live');
    await dialog.getByLabel('Budget (₹)').fill('65000');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Monsoon Drive 2026' })).toBeVisible();
    await page.reload();
    await expect(page.getByText('of ₹65.0K')).toBeVisible();
  });

  await test.step('Ask Effy opens the assistant about this campaign', async () => {
    await page.getByRole('button', { name: 'Ask Effy' }).click();
    const panel = page.getByRole('complementary').or(page.locator('aside'));
    await expect(panel.getByText('Effy AI')).toBeVisible();
    await expect(panel.getByText(/How is the campaign “Monsoon Drive 2026” doing/)).toBeVisible();
  });
});
