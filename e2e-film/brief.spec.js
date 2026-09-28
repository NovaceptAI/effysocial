import { test, expect } from '../e2e/support/test';

// A plan brief per workspace against the real engine (launch plan 6.17): a workspace with
// no goal can't have a plan written yet; its brief is filled in beside the plan, saved,
// and the plan is written from it (the engine's stand-in model quotes the brief back).
test('the plan is written from the workspace’s own brief', async ({ page }) => {
  await test.step('a new business has no goal yet, so no plan can be written', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `brief-${Date.now()}@example.in`, password: 'brief-e2e-123', name: 'Asha Rao', orgName: 'Roofseal Pune', orgType: 'business' },
    });
    expect(r.ok()).toBeTruthy();
    await page.goto('/app/plan');
    await expect(page.getByRole('button', { name: /generate plan/i })).toBeDisabled();
    await expect(page.getByRole('region', { name: 'Plan brief' }).getByRole('note')).toContainText('A plan needs at least the goal.');
  });

  await test.step('fill in and save the brief', async () => {
    const brief = page.getByRole('region', { name: 'Plan brief' });
    await brief.getByLabel('Goal').selectOption('leads');
    await brief.getByLabel('Target').fill('40');
    await brief.getByLabel('What’s offered').fill('Terrace waterproofing with a 5-year warranty');
    await brief.getByLabel('Who it’s for').fill('Housing societies in Pune');
    await brief.getByLabel('Ad budget').fill('25000');
    await brief.getByLabel('Posts a week').fill('4');
    await brief.getByRole('button', { name: 'Save brief' }).click();
    await expect(brief.getByRole('status')).toHaveText('Brief saved.');
    await expect(brief.getByRole('note')).toHaveCount(0);           // nothing left to add
  });

  await test.step('the plan is written from it, and the brief is kept', async () => {
    await page.getByRole('button', { name: /generate plan/i }).click();
    await expect(page.getByText('Plan for Roofseal Pune aiming at: Leads. Offer: Terrace waterproofing with a 5-year warranty.')).toBeVisible();
    await page.reload();
    const brief = page.getByRole('region', { name: 'Plan brief' });
    await expect(brief.getByLabel('Target')).toHaveValue('40');
    await expect(brief.getByLabel('Who it’s for')).toHaveValue('Housing societies in Pune');
  });
});
