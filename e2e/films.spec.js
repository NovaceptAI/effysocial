import { test, expect } from './support/test';
import { stubApi, bootstrap } from './support/api';
import films from '../src/test/fixtures/films.js';

// Ad Films out-of-date renders (G11) in the production build, under the CSP.
const open = async (page, film, stage) => {
  await stubApi(page, {
    'GET /bootstrap': bootstrap,
    'GET /films/1': { status: 'ok', film: { ...film, stage } },
    'GET /studio/voices': { voices: [] },
    'PATCH /films/1': (body) => ({ status: 'ok', film: { ...film, ...body } }),
  });
  await page.goto('/app/films/1');
};

test('an edited film holds delivery until it is re-assembled (FILM-016)', async ({ page }) => {
  await open(page, films.lineEdited, 7);
  await expect(page.getByText('The film changed after it was assembled.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: /rebuild exports/i })).toBeDisabled();
  await page.getByRole('button', { name: 'Go to assemble' }).click();
  await expect(page.getByText('This cut is out of date', { exact: false })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Before assembling' })).toContainText('Scene 1: the line or voice changed');
  await expect(page.getByRole('button', { name: /re-assemble/i })).toBeDisabled();
});

test('a regenerated still shows its clip as out of date (FILM-015)', async ({ page }) => {
  await open(page, films.stillRegenerated, 4);
  await expect(page.getByText('Out of date — the still, motion or length changed', { exact: false })).toHaveCount(1);
});

test('the master is signed off before delivery, and the record names the approver (FILM-028)', async ({ page }) => {
  let film = { ...films.awaitingMasterSignoff, stage: 7 };
  await stubApi(page, {
    'GET /bootstrap': bootstrap,
    'GET /films/1': () => ({ status: 'ok', film }),
    'GET /studio/voices': { voices: [] },
    'PATCH /films/1': (body) => ({ status: 'ok', film: { ...film, ...body } }),
    'POST /films/1/signoff': () => { film = { ...films.fresh, stage: 6 }; return { status: 'ok', film }; },
  });
  await page.goto('/app/films/1');
  await expect(page.getByText('Approve the master before building exports or dealer versions.')).toBeVisible();
  await page.getByRole('button', { name: 'Go to sign-off' }).click();
  const box = page.getByRole('region', { name: 'Master sign-off' });
  await box.getByRole('button', { name: /approve master/i }).click();
  await expect(box.getByTestId('signoff')).toContainText('by Meera Iyer (Client approver)');
});

test('Film Maker buttons have no browser-default borders', async ({ page }) => {
  await open(page, films.awaitingMasterSignoff, 6);
  for (const name of [/exit/i, /re-assemble/i, /approve master/i]) {
    const border = await page.getByRole('button', { name }).first()
      .evaluate((el) => `${getComputedStyle(el).borderTopStyle} ${getComputedStyle(el).borderTopWidth}`);
    expect(border, String(name)).not.toMatch(/outset|inset/);
    expect(border, String(name)).toMatch(/ 0px$/);
  }
  // A deliberately bordered button keeps its border.
  const quiet = await page.getByRole('button', { name: 'Request changes' })
    .evaluate((el) => getComputedStyle(el).borderTopWidth);
  expect(quiet).toBe('1px');
});

test('a delivered film shows its acceptance record, and the Creation Acceptance page lists it (FILM-029)', async ({ page }) => {
  const { default: acceptance } = await import('../src/test/fixtures/acceptance.js');
  const film = { ...acceptance.film, stage: 7 };
  await stubApi(page, {
    'GET /bootstrap': bootstrap,
    [`GET /films/${film.id}`]: { status: 'ok', film },
    'GET /studio/voices': { voices: [] },
    'GET /acceptance': acceptance.list,
  });
  await page.goto(`/app/films/${film.id}`);
  const card = page.getByRole('region', { name: 'Acceptance record' });
  await expect(card.getByTestId('verdict')).toContainText('Accepted with fixes · quality 4/5 · 3 delivery hours');
  await page.goto('/app/analytics/acceptance');
  await expect(page.getByRole('heading', { name: 'Creation Acceptance' })).toBeVisible();
  await expect(page.getByRole('link', { name: film.title })).toBeVisible();
});
