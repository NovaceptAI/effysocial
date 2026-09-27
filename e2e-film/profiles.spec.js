import { test, expect } from '../e2e/support/test';

// Several profiles on one login against the real engine (launch plan 6.15): a Business
// adds a Personal Brand from the top bar, which starts on Creative (the trial went to the
// first profile) and onboards for creation; switching changes what the app shows and
// survives a reload; an invite from another organisation joins the list of profiles.
const switcher = (page, name) => page.getByRole('button', { name: `Profile: ${name}. Switch profile` });
const cont = (page) => page.getByRole('button', { name: /^continue/i });

test('add a profile, switch between profiles, and join another team as one more', async ({ page, browser }) => {
  const stamp = Date.now();
  const email = `asha-${stamp}@example.in`;

  await test.step('a Business adds a Personal Brand from the top bar', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email, password: 'profiles-e2e-1', name: 'Asha Rao', orgName: 'Rao Dental', orgType: 'business' },
    });
    expect(r.ok()).toBeTruthy();
    await page.goto('/app');
    await switcher(page, 'Rao Dental').click();
    await page.getByRole('button', { name: 'Add account type' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add account type' });
    await expect(dialog.getByRole('note')).toContainText('It starts on the free Creative plan');
    await dialog.getByRole('radio', { name: /Personal Brand/ }).click();
    await dialog.getByLabel('Your name').fill('Dr Asha Rao');
    await dialog.getByRole('button', { name: 'Add profile' }).click();
    await expect(page).toHaveURL(/\/onboarding$/);
  });

  await test.step('it onboards for creation, since Creative has no marketing', async () => {
    await expect(page.getByRole('heading', { name: 'Tell us about yourself' })).toBeVisible();
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Dr Asha Rao');
    await page.getByLabel('Industry', { exact: true }).selectOption({ label: 'Other — not listed' });
    await page.getByLabel('What do you do?').fill('Paediatric dentist');
    await cont(page).click();
    await expect(page.getByRole('radio', { name: /^Market and grow/ })).toBeDisabled();
    await expect(page.getByRole('note')).toContainText('This profile is on the free Creative plan');
    await page.getByRole('radio', { name: /^Create content/ }).click();
    await cont(page).click();
    await expect(page.getByRole('heading', { name: 'Build your Brand Brain' })).toBeVisible();
    await cont(page).click();
    await page.getByRole('button', { name: /open ai studio/i }).click();
    await expect(page).toHaveURL(/\/app\/studio$/);
    await expect(switcher(page, 'Dr Asha Rao')).toBeVisible();
  });

  await test.step('switching opens the other profile, and a reload keeps it', async () => {
    await switcher(page, 'Dr Asha Rao').click();
    const list = page.getByRole('list', { name: 'Your profiles' });
    await expect(list.getByRole('button')).toHaveText([
      /Rao Dental.*Business · Workspace admin · Trial/, /Dr Asha Rao.*Personal Brand · Workspace admin · Creative/]);
    await list.getByRole('button', { name: /Rao Dental/ }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(switcher(page, 'Rao Dental')).toBeVisible();
    await page.reload();
    await expect(switcher(page, 'Rao Dental')).toBeVisible();
  });

  await test.step('an invite from another organisation adds it as one more profile', async () => {
    const other = await browser.newContext();
    const agency = await other.newPage();
    await agency.goto('/login');
    const r = await agency.request.post('/api/effy/auth/register', {
      data: { email: `northwind-${stamp}@example.in`, password: 'profiles-e2e-2', name: 'Kiran Patil', orgName: 'Northwind', orgType: 'agency' },
    });
    expect(r.ok()).toBeTruthy();
    const invite = await agency.request.post('/api/effy/team/invites', { data: { email, role: 'Copywriter' } });
    expect(invite.ok()).toBeTruthy();
    const { link } = await invite.json();
    await other.close();

    await page.goto(new URL(link).pathname + new URL(link).search);
    await expect(page.getByText('It’s added to your profiles beside Rao Dental')).toBeVisible();
    await page.getByRole('button', { name: 'Join Northwind' }).click();
    await expect(page).toHaveURL(/\/app$/);
    await switcher(page, 'Northwind').click();
    await expect(page.getByRole('list', { name: 'Your profiles' }).getByRole('button')).toHaveText([
      /Rao Dental/, /Dr Asha Rao/, /Northwind.*Agency & Creators · Copywriter/]);
  });
});
