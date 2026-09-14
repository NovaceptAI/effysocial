import { test, expect } from './support/test';
import { stubApi, signedOut } from './support/api';

// Privacy Policy and Terms (step 1.8). Both are drafts until the owner and client
// approve them, so the draft notice must show; flip LEGAL.draft and update these tests.
test.describe('legal pages', () => {
  test.beforeEach(async ({ page }) => { await stubApi(page, signedOut); });

  for (const [path, heading, sections] of [
    ['/privacy', 'Privacy Policy', ['Your rights', 'Deleting your data', 'Google API services', 'Grievance Officer']],
    ['/terms', 'Terms of Service', ['AI-generated content', 'People’s likeness and voice', 'Limitation of liability', 'Governing law']],
  ]) {
    test(`${path} renders with its sections and the draft notice`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(page.getByRole('note')).toContainText('Draft — pending approval');
      for (const name of sections) {
        await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
      }
    });
  }

  test('the landing and pricing footers link to both pages', async ({ page }) => {
    for (const start of ['/', '/pricing']) {
      await page.goto(start);
      const legal = page.getByRole('contentinfo').getByRole('navigation', { name: 'Legal' });
      await legal.getByRole('link', { name: 'Privacy Policy' }).click();
      await expect(page).toHaveURL(/\/privacy$/);
      await page.goto(start);
      await page.getByRole('contentinfo').getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Terms of Service' }).click();
      await expect(page).toHaveURL(/\/terms$/);
    }
  });

  test('sign-up states that creating an account accepts the terms', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Terms of Service' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of Service');
    await page.goBack();
    await page.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
  });
});
