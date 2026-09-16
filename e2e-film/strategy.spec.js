import { test, expect } from '../e2e/support/test';

// Trends and competitors against the real engine (launch plan 5.11, G43): every section
// says what it is based on — suggestions are never called trends, and competitors are
// the accounts you added, with no metrics.
test('trends and competitors name their source, date and coverage', async ({ page }) => {
  await test.step('sign up with no Brand Brain', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `strategy-${Date.now()}@example.in`, password: 'strategy-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
  });

  await test.step('Trends calls its themes general guidance and says what each part covered', async () => {
    await page.goto('/app/trends');
    const themes = page.getByRole('heading', { name: 'Suggested themes' });
    await expect(themes).toBeVisible();
    await expect(page.getByText('Trending now')).toHaveCount(0);
    await expect(page.getByText('General guidance', { exact: true })).toBeVisible();
    await expect(page.getByText(/Build your Brand Brain for suggestions made for you\./)).toBeVisible();
    await expect(page.getByText(/covers 0 posts \(drafts included\) across 0 channels/)).toBeVisible();
    await expect(page.getByText(/General dates — not demand or search data\./)).toBeVisible();
    await expect(page.getByText(/How popular each tag is isn't measured\./)).toBeVisible();
  });

  await test.step('a competitor you add is labelled as your entry, with no metrics', async () => {
    await page.goto('/app/competitors');
    await page.getByRole('button', { name: /Add your first competitor/ }).click();
    await page.getByPlaceholder('e.g. Smile Dental Studio').fill('Rival Seal');
    await page.getByPlaceholder('https://instagram.com/competitor').fill('https://instagram.com/rivalseal');
    await page.getByRole('button', { name: /Save competitor/ }).click();
    await expect(page.getByRole('heading', { name: 'Rival Seal' })).toBeVisible();
    await expect(page.getByText(/^Added \d{1,2} \w+ \d{4}$/)).toBeVisible();
    const source = page.getByLabel('Source');
    await expect(source).toContainText('Source: Accounts you added');
    await expect(source).toContainText('covers 1 competitor, 1 profile link');
    await expect(source).toContainText("need channel sync, which isn't available yet");
  });
});
