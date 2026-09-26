import { test, expect } from '../e2e/support/test';

// Onboarding against the real engine (launch plan 3.2, G20): answers survive a reload,
// connections show their real state, the first plan is really generated and stays
// visible, and creation-only users go straight to creating. ONB-001..005.
async function signUp(page, email) {
  await page.goto('/login');
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill('onboarding-e2e-1');
  await page.getByRole('button', { name: /create your free account/i }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
}

const cont = (page) => page.getByRole('button', { name: /^continue/i });

test('a business that wants both gets a saved, resumable onboarding and a real first plan', async ({ page }) => {
  const connects = [];
  page.on('request', (req) => { if (/\/integrations\/[^/]+\/connect$/.test(new URL(req.url()).pathname)) connects.push(req.url()); });

  await test.step('answer the first steps', async () => {
    await signUp(page, `both-${Date.now()}@example.in`);
    await expect(page.getByRole('button', { name: /back/i })).toBeDisabled();
    await page.getByRole('radio', { name: /^Business/ }).click();
    await cont(page).click();
    await page.getByLabel('Name', { exact: true }).fill('Roofseal Pune');
    await page.getByLabel('Website', { exact: true }).fill('https://roofseal.in');
    await page.getByLabel('Industry', { exact: true }).selectOption('Waterproofing, paints & coatings');
    await page.getByLabel('Primary location').fill('Pune');
    await cont(page).click();
    await page.getByRole('radio', { name: /^Both/ }).click();
    await cont(page).click();
    await page.getByRole('button', { name: 'Generate leads' }).click();
    await page.getByRole('button', { name: 'Get phone calls' }).click();
    await cont(page).click();
    await expect(page.getByRole('heading', { name: 'Connect your accounts' })).toBeVisible();
  });

  await test.step('reload and resume with the answers kept (ONB-001)', async () => {
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Connect your accounts' })).toBeVisible();
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByRole('button', { name: 'Get phone calls' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /back/i }).click();
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Roofseal Pune');
    await cont(page).click();
    await cont(page).click();
    await cont(page).click();
  });

  await test.step('connections show their real state (ONB-002)', async () => {
    const channels = page.getByRole('list', { name: 'Channels' });
    await expect(channels.getByRole('listitem')).toHaveCount(8);
    await expect(channels.getByText('Connected', { exact: true })).toHaveCount(0);
    await channels.getByRole('button', { name: 'Connect Instagram' }).click();
    await expect(channels.getByText(/Not available yet/)).toBeVisible();
    expect(connects).toHaveLength(1);
    await cont(page).click();
  });

  await test.step('add the website and a brief', async () => {
    await expect(page.getByRole('note', { name: 'Why a brief helps' })).toContainText('A brief goes a long way.');
    const sources = page.getByRole('region', { name: 'Brand sources' });
    await expect(sources.getByLabel('Website address')).toHaveValue('https://roofseal.in');
    await sources.getByRole('button', { name: /add website/i }).click();
    await expect(sources.getByRole('status')).toHaveText('Read 1 page from roofseal.in.');
    await sources.getByLabel('Business brief').fill('Terrace and wall waterproofing for homes and housing societies in Pune.');
    await sources.getByRole('button', { name: 'Save brief' }).click();
    await expect(sources.getByText('Business brief')).toBeVisible();
    await cont(page).click();
  });

  await test.step('generate the first plan, then finish (ONB-003, ONB-005)', async () => {
    const finish = page.getByRole('button', { name: /go to dashboard/i });
    await expect(finish).toBeDisabled();
    await page.getByRole('button', { name: /generate first plan/i }).click();
    await expect(page.getByText('Your plan is ready')).toBeVisible();
    await expect(page.getByText('Plan for Roofseal Pune — a Waterproofing, paints & coatings in Pune aiming at: Generate leads, Get phone calls. Grounded in the website.')).toBeVisible();
    await finish.click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole('region', { name: 'Finish setting up' })).toHaveCount(0);
  });

  await test.step('the plan stays visible on Marketing Plan', async () => {
    await page.goto('/app/plan');
    await expect(page.getByText(/^Plan for Roofseal Pune — a Waterproofing, paints & coatings in Pune/)).toBeVisible();
    await expect(page.getByRole('region', { name: '12 post ideas' })).toBeVisible();
  });
});

test('creation only skips connections and the plan and lands in AI Studio (ONB-004)', async ({ page }) => {
  const asked = [];
  page.on('request', (req) => {
    const path = new URL(req.url()).pathname;
    if (path.startsWith('/api/effy/integrations') || path.startsWith('/api/effy/marketing-plan')) asked.push(path);
  });

  await signUp(page, `create-${Date.now()}@example.in`);
  await page.getByRole('radio', { name: /^Agency & Creators/ }).click();
  await cont(page).click();
  await page.getByLabel('Name', { exact: true }).fill('Meera Studio');
  await page.getByLabel('Industry', { exact: true }).selectOption({ label: 'Other — not listed' });
  await page.getByLabel('Which business are you in?').fill('Children’s book illustration');
  await cont(page).click();
  await page.getByRole('radio', { name: /^Create content/ }).click();
  await expect(page.getByRole('list', { name: 'Onboarding steps' }).getByRole('listitem')).toHaveText(
    [/Organisation$/, /Details$/, /What you need$/, /Brand Brain$/, /Start creating$/],
  );
  await cont(page).click();
  await expect(page.getByRole('heading', { name: 'Build your Brand Brain' })).toBeVisible();
  await cont(page).click();

  // Leaving and coming back from Home resumes at the last step.
  await page.goto('/app');
  await page.getByRole('region', { name: 'Finish setting up' }).getByRole('button', { name: /continue setup/i }).click();
  await expect(page.getByRole('heading', { name: "You're ready to create" })).toBeVisible();

  await page.getByRole('button', { name: /open ai studio/i }).click();
  await expect(page).toHaveURL(/\/app\/studio$/);
  expect(asked).toEqual([]);
});
