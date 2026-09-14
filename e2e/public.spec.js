import { test, expect } from '@playwright/test';
import { stubApi, signedOut } from './support/api';

test.describe('signed out', () => {
  test.beforeEach(async ({ page }) => { await stubApi(page, signedOut); });

  test('landing page renders its headline and sign-in entry', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Create. Publish. Grow.');
    await expect(page).toHaveTitle(/EffySocial/);
  });

  test('login page shows the email and password form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('a deep link into the app redirects to login without showing app content (AUTH-020)', async ({ page }) => {
    await page.goto('/app/films/1');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI Studio' })).toHaveCount(0);
  });

  test('wrong credentials show the server message (AUTH-013)', async ({ page }) => {
    await stubApi(page, { ...signedOut, 'POST /auth/login': [401, { status: 'error', message: 'Invalid email or password.' }] });
    await page.goto('/login');
    await page.getByPlaceholder('you@company.com').fill('asha@example.in');
    await page.locator('input[type="password"]').fill('wrong-password');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
