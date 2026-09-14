import { test, expect } from '@playwright/test';
import { stubApi, signedInEmpty } from './support/api';

test.describe('signed in', () => {
  test('home shows the three entry points and opens AI Studio (HOME-001)', async ({ page }) => {
    const api = await stubApi(page, signedInEmpty);
    await page.goto('/app');
    for (const title of ['AI Studio', 'Ad Films', 'Performance Marketing']) {
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
    expect(api.callsTo('GET /films')[0]?.query.workspace).toBe('ws_1');
    await page.getByRole('heading', { name: 'AI Studio', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/studio$/);
  });

  test('theme choice survives a reload (SHELL-004)', async ({ page }) => {
    await stubApi(page, signedInEmpty);
    await page.goto('/app');
    const root = page.locator('.app-root');
    await expect(root).not.toHaveClass(/theme-light/);
    await page.getByTitle('Switch to light theme').click();
    await expect(root).toHaveClass(/theme-light/);
    await page.reload();
    await expect(page.locator('.app-root')).toHaveClass(/theme-light/);
    await expect(page.getByTitle('Switch to dark theme')).toBeVisible();
  });
});
