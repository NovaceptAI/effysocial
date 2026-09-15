import { test, expect } from './support/test';
import { stubApi, bootstrap } from './support/api';
import ob from '../src/test/fixtures/onboarding.js';

// Onboarding renders outside the app shell, so the app's theme and control reset don't
// reach it. Seen on 15 Sep: the rail was white with white labels, and buttons kept the
// browser's grey fill and bevelled border.
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const style = (locator, ...props) => locator.evaluate((el, names) => names.map((n) => getComputedStyle(el)[n]), props);

test.beforeEach(async ({ page }) => {
  await stubApi(page, {
    'GET /bootstrap': bootstrap,
    'GET /onboarding': ob.fresh,
    'PATCH /onboarding': ob.savedPatch,
    'GET /integrations': ob.integrations,
  });
});

test('the setup rail shows the logo and readable step names', async ({ page }) => {
  await page.goto('/onboarding');
  const rail = page.getByRole('complementary', { name: 'Setup progress' });
  await expect(rail.getByRole('img', { name: 'EffySocial' })).toBeVisible();
  const [railBg] = await style(rail, 'backgroundColor');
  for (const name of ['Organisation', 'Details', 'First plan']) {
    const [color] = await style(rail.getByText(name, { exact: true }), 'color');
    expect(contrast(color, railBg), name).toBeGreaterThanOrEqual(4.5);
  }
});

test('onboarding controls have no browser-default fill or bevel', async ({ page }) => {
  await page.goto('/onboarding');
  const business = page.getByRole('radio', { name: /^Business/ });
  const agency = page.getByRole('radio', { name: /^Marketing agency/ });
  await agency.click();

  // The cards fade between states, so wait for them to settle.
  await expect.poll(async () => (await style(business, 'backgroundColor'))[0]).toBe('rgba(0, 0, 0, 0)');
  const [bizStyle, bizWidth] = await style(business, 'borderTopStyle', 'borderTopWidth');
  expect(`${bizStyle} ${bizWidth}`).toBe('solid 2px'); // the card's own border-2, drawn flat
  expect((await style(agency, 'borderTopStyle'))[0]).toBe('solid');
  await expect.poll(async () => (await style(agency, 'borderTopColor'))[0]).toBe('rgb(232, 74, 51)'); // coral when chosen

  const [backStyle, backWidth, backBg] = await style(page.getByRole('button', { name: /back/i }), 'borderTopStyle', 'borderTopWidth', 'backgroundColor');
  expect(`${backStyle} ${backWidth}`).toBe('solid 0px');
  expect(backBg).toBe('rgba(0, 0, 0, 0)');

  await page.getByRole('button', { name: /continue/i }).click();
  const [inputStyle, inputWidth] = await style(page.getByLabel('Name', { exact: true }), 'borderTopStyle', 'borderTopWidth');
  expect(`${inputStyle} ${inputWidth}`).toBe('solid 1px');
});
