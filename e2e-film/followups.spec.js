import { test, expect } from '../e2e/support/test';

// Follow-ups against the real engine (launch plan 5.5, G36): a new lead starts a run
// that emails at once, records WhatsApp honestly as not sent, and then waits out its
// delay instead of racing through it. The preview sends nothing. Email is accepted by
// the e2e engine's in-memory outbox (scripts/e2e_film_server.py), never really sent.
test('a follow-up emails, is honest about WhatsApp, and waits out its delay', async ({ page }) => {
  let ws;
  let wf;

  await test.step('sign up and turn on a follow-up with a one-day wait', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `followups-${Date.now()}@example.in`, password: 'followups-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    wf = (await (await page.request.post('/api/effy/followups', {
      data: {
        workspace: ws, name: 'Enquiry follow-up', trigger: { type: 'lead_created' },
        steps: [
          { kind: 'action', type: 'email', subject: 'Thanks, {name}', message: 'Hi {name}, we got your enquiry.' },
          { kind: 'action', type: 'whatsapp', message: 'Hi {name}!' },
          { kind: 'delay', amount: 1, unit: 'days' },
          { kind: 'action', type: 'assign_salesperson', owner: 'Priya' },
        ],
      },
    })).json()).workflow;
    expect((await page.request.patch(`/api/effy/followups/${wf.id}`, { data: { status: 'active' } })).ok()).toBeTruthy();
  });

  await test.step('a new lead starts a run that waits', async () => {
    const lead = (await (await page.request.post('/api/effy/leads', {
      data: { workspace: ws, name: 'Vikram Shah', email: 'vikram@example.in', phone: '+91 90000 00000' },
    })).json()).lead;
    expect(lead.owner).toBe('');   // the assignment is after the wait

    await page.goto('/app/followups');
    await page.getByRole('button', { name: /Runs/ }).click();
    const run = page.locator('div.rounded-lg').filter({ hasText: 'Vikram Shah' });
    await expect(run.getByText('Waiting', { exact: true })).toBeVisible();
    await expect(run.getByText(/^carries on /)).toBeVisible();
    await expect(run).toContainText('Email sent to vikram@example.in');
    await expect(run).toContainText("WhatsApp not sent — WhatsApp isn't connected yet");
    await expect(run).toContainText('Waiting 1 day');
    await expect(run).not.toContainText('Assigned to Priya');
  });

  await test.step('the builder says what really sends, and the preview sends nothing', async () => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByLabel('Email subject')).toHaveValue('Thanks, {name}');
    await expect(page.getByText(/WhatsApp isn’t connected yet — this step is recorded on the lead as not sent/)).toBeVisible();
    await page.getByRole('button', { name: /Preview run/ }).click();
    await expect(page.getByText('Would wait 1 day, then carry on')).toBeVisible();
    await expect(page.getByText('Would send Email to sample@example.com')).toBeVisible();

    const runs = await (await page.request.get(`/api/effy/followups/${wf.id}/runs`)).json();
    expect(runs.runs).toHaveLength(1);   // the preview started no run
  });
});
