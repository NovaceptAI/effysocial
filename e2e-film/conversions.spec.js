import { test, expect } from '../e2e/support/test';

// Conversion events against the real engine (launch plan 5.6, G37): someone arrives
// from a Meta ad link, fills in the public form, and the business marks them as a
// purchase. The ad click id travels from the link into the event built for Meta and
// Google, and every screen says the event is ready — never sent.
test('an ad lead marked as a purchase keeps a conversion event that says it is not sent', async ({ page, browser }) => {
  let ws;
  let slug;

  await test.step('sign up and publish a lead form', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `conversions-${Date.now()}@example.in`, password: 'conversions-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    const form = (await (await page.request.post('/api/effy/forms', { data: { workspace: ws, name: 'Monsoon enquiry' } })).json()).form;
    expect((await page.request.patch(`/api/effy/forms/${form.id}`, { data: { status: 'published' } })).ok()).toBeTruthy();
    slug = form.slug;
  });

  await test.step('a visitor from a Meta ad link fills in the public form', async () => {
    const visitor = await browser.newContext();
    const tab = await visitor.newPage();
    await tab.goto(`/f/${slug}?utm_source=facebook&utm_campaign=monsoon&fbclid=IwAR2e2eClick`);
    await tab.getByLabel(/Your name/).fill('Vikram Shah');
    await tab.getByLabel(/Phone/).fill('98765 43210');
    await tab.getByLabel(/Email/).fill('vikram@example.in');
    await tab.getByRole('button', { name: 'Submit' }).click();
    await expect(tab.getByText(/Thanks!/)).toBeVisible();
    await visitor.close();
  });

  await test.step('the business marks the lead as a purchase', async () => {
    const leads = (await (await page.request.get(`/api/effy/leads?workspace=${ws}`)).json()).leads;
    const lead = leads.find((l) => l.name === 'Vikram Shah');
    await page.goto(`/app/pipeline/${lead.id}`);
    await expect(page.getByText('Meta click id: IwAR2e2eClick')).toBeVisible();
    await page.getByRole('button', { name: 'Purchase completed' }).click();

    const events = page.getByRole('list', { name: 'Conversion events' });
    await expect(events).toContainText('Ready for Meta and Google — not sent, not connected yet (matched by email, phone, Meta click id).');
    await expect(page.getByText(/Conversion event ready for Meta and Google \(matched by email, phone, Meta click id\) — not sent/)).toBeVisible();
    await expect(page.getByText(/sent to ad platforms/)).toHaveCount(0);
  });

  await test.step('the Tracking Centre counts it as ready, with none sent', async () => {
    await page.goto('/app/tracking');
    const card = page.getByRole('region', { name: 'Conversion events' });
    await expect(card).toContainText('ready for Meta and Google — 0 sent, as neither is connected yet.');
    await expect(card).toContainText('1 carry an ad click id');
    await expect(page.getByText(/Phase 3/)).toHaveCount(0);
  });
});
