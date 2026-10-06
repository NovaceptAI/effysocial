import { test, expect } from '../e2e/support/test';

// The marketing plan on SOSTAC against the real engine (launch plan 6.18). The engine's
// stand-in model (scripts/e2e_film_server.py) gives the plan's words; everything counted —
// the starting numbers, the budget split, the cadence cut to the team, each week's actuals —
// is the engine's own. Accepting the plan creates its campaign as a draft.
test('a SOSTAC plan starts from real numbers and is checked week by week', async ({ page }) => {
  let ws;
  const api = (method, path, data) => page.request[method](`/api/effy${path}`, { data });

  await test.step('a business with a brief and one lead so far', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `sostac-${Date.now()}@example.in`, password: 'kettle-e2e-123', name: 'Asha Rao', orgName: 'Roofseal Pune', orgType: 'business' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    expect((await api('put', '/marketing-plan/brief', {
      workspace: ws, goal: { metric: 'leads', target: 40 }, offer: 'Terrace waterproofing', customer: 'Housing societies in Pune',
      budget: 25000, capacity: 4,
    })).ok()).toBeTruthy();
    expect((await api('post', '/leads', { workspace: ws, name: 'Meera Joshi' })).ok()).toBeTruthy();
  });

  await test.step('Situation and Objectives come from the counted numbers', async () => {
    await page.goto('/app/plan');
    await page.getByRole('button', { name: 'Generate plan' }).click();
    await expect(page.getByText(/^Plan for Roofseal Pune aiming at: Leads\./)).toBeVisible();
    await expect(page.getByText(/Leads:\s*from 1 to 40 leads a month by/).first()).toBeVisible();

    const numbers = page.getByRole('region', { name: 'Where things stand' });
    await expect(numbers.getByRole('row', { name: /Leads, last 30 days/ })).toContainText('1Lead pipeline');
    await expect(numbers.getByRole('row', { name: /Instagram followers/ })).toContainText('Not measuredConnect Instagram to measure this.');
    await expect(page.getByRole('region', { name: 'What\'s missing' })).toContainText('Instagram isn\'t connected');
  });

  await test.step('Tactics fit the team and the budget', async () => {
    await page.getByRole('tab', { name: 'Tactics' }).click();
    const channels = page.getByRole('region', { name: 'Channels and cadence' });
    await expect(channels).toContainText('Instagram · 3 a week');
    await expect(channels).toContainText('WhatsApp · 1 a week');
    await expect(channels).toContainText('4 posts a week in all, within the 4 the team can make.');
    const budget = page.getByRole('region', { name: 'Budget split' });
    await expect(budget.getByRole('row', { name: /Meta ads/ })).toContainText('INR 15,000');
    await expect(budget.getByRole('row', { name: /Boosted reels/ })).toContainText('INR 10,000');
    await expect(budget.getByRole('row', { name: /Total/ })).toContainText('INR 25,000');
    await expect(page.getByRole('region', { name: 'Campaigns' })).toContainText('Monsoon check-up');
  });

  await test.step('Control counts this week as it happens', async () => {
    expect((await api('post', '/leads', { workspace: ws, name: 'Ravi Kulkarni' })).ok()).toBeTruthy();
    await page.reload();
    const week = page.getByRole('region', { name: 'This week: planned vs actual' });
    await expect(week).toContainText('Week 1 of 4');
    await expect(week).toContainText('Posts published0 of 4');
    await expect(week).toContainText('Leads2 of 10');
    await page.getByRole('tab', { name: 'Control' }).click();
    const rows = page.getByRole('region', { name: 'Planned against actual' }).getByRole('row');
    await expect(rows).toHaveCount(5);
    await expect(rows.nth(1)).toContainText('0 of 4');
    await expect(rows.nth(1)).toContainText('2 of 10');
    await expect(rows.nth(2)).toContainText('— of 4');
  });

  await test.step('accepting creates the campaign as a draft, once', async () => {
    await page.getByRole('button', { name: 'Accept plan' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Plan accepted' })).toHaveText(/Plan accepted: 1 draft campaign in Campaigns\./);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Accept plan' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Open Campaigns' }).click();
    await expect(page.getByText('Monsoon check-up')).toBeVisible();
    const list = await (await page.request.get(`/api/effy/campaigns?workspace=${ws}`)).json();
    expect(list.campaigns.map((c) => [c.name, c.status])).toEqual([['Monsoon check-up', 'draft']]);
  });
});
