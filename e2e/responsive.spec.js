import { test, expect } from '@playwright/test';
import { stubApi, signedOut, signedInEmpty } from './support/api';

// Runs in the "mobile" project (Pixel 7 viewport) — see playwright.config.js.
const noSidewaysScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

test('landing and login fit a phone without sideways scrolling (XB-003)', async ({ page }) => {
  await stubApi(page, signedOut);
  for (const path of ['/', '/login']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await noSidewaysScroll(page), `${path} scrolls sideways`).toBe(true);
  }
});

test('app home fits a phone without sideways scrolling (XB-003)', async ({ page }) => {
  await stubApi(page, signedInEmpty);
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'AI Studio', exact: true })).toBeVisible();
  expect(await noSidewaysScroll(page)).toBe(true);
});
