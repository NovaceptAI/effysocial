import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { test, expect } from '../e2e/support/test';

// The strategy's primary demo, end to end in a real browser against the real engine
// (providers stubbed, ffmpeg real): brief → script → approved stills → animate → voice →
// assemble → master sign-off → exports, ending with a playable file (ENV-015).
const BRIEF = '20s monsoon roof ad for Roofseal';

function probe(path) {
  const out = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', path]).toString());
  const video = out.streams.find((s) => s.codec_type === 'video');
  return { duration: Number(out.format.duration), width: video?.width, height: video?.height, audio: out.streams.some((s) => s.codec_type === 'audio') };
}

test('the demo film runs from brief to a playable export', async ({ page }, testInfo) => {
  const rail = (name) => page.getByRole('navigation').getByRole('button', { name, exact: true });

  await test.step('sign up', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `film-${Date.now()}@example.in`, password: 'demo-film-1', name: 'Demo Director' },
    });
    expect(r.ok()).toBeTruthy();
  });

  await test.step('create the film', async () => {
    await page.goto('/app/films');
    await page.getByRole('button', { name: /create your film/i }).click();
    await page.getByPlaceholder('e.g. Roof Ka Rakshak').fill('Roof Ka Rakshak');
    await page.getByPlaceholder('e.g. Pidilite').fill('Pidilite');
    await page.getByPlaceholder('e.g. Roofseal Classic').fill('Roofseal Classic');
    await page.getByRole('button', { name: /enter the room/i }).click();
    await expect(page).toHaveURL(/\/app\/films\/\d+$/);
    await page.getByRole('button', { name: 'Continue to script' }).click();
  });

  await test.step('brief and script', async () => {
    await page.getByLabel('SCENES').fill('2');
    // Type the brief last and go straight to Draft, as a user would.
    await page.getByLabel('Film brief').fill(BRIEF);
    await page.getByRole('button', { name: 'Draft the script' }).click();
    // The engine's stubbed model quotes the brief it was given, so this shows the typed
    // brief reached it.
    await expect(page.getByText(`Brief: ${BRIEF}`).first()).toBeVisible();
    await page.getByRole('button', { name: 'Continue to stills' }).first().click();
  });

  await test.step('generate and approve stills', async () => {
    await page.getByRole('button', { name: /generate all/i }).click();
    await page.getByRole('button', { name: /approve all/i }).click();
    await expect(page.getByText('2/2 stills approved')).toBeVisible();
    await page.getByRole('button', { name: 'Continue to animate' }).click();
  });

  await test.step('animate both scenes', async () => {
    // A scene's button stays "Animate" (disabled) while it renders, so click whichever is still enabled.
    for (let i = 1; i <= 2; i += 1) {
      await page.getByRole('button', { name: /^Animate \(4s/, disabled: false }).first().click();
      await expect(page.getByRole('button', { name: /^(Animate|Retake) \(4s/, disabled: false })).toHaveCount(2 - i);
    }
    await expect(page.getByText('Audio clean (AI-checked)')).toHaveCount(2, { timeout: 30_000 }); // the UI polls every 8 s
    await expect(page.getByRole('button', { name: /^Retake \(4s/ })).toHaveCount(2);
    await page.getByRole('button', { name: 'Continue to voice' }).click();
  });

  await test.step('voice', async () => {
    await page.getByRole('button', { name: /generate all lines/i }).click();
    await expect(page.locator('audio')).toHaveCount(2);
    await page.getByRole('button', { name: 'Continue to assemble' }).click();
  });

  await test.step('assemble and sign off the master', async () => {
    await page.getByRole('button', { name: 'Assemble the film' }).click();
    await expect(page.getByText('Final audio QA passed')).toBeVisible({ timeout: 60_000 });
    const signoff = page.getByRole('region', { name: 'Master sign-off' });
    await signoff.getByRole('button', { name: /approve master/i }).click();
    await expect(signoff.getByTestId('signoff')).toContainText('Approvedby Demo Director');
  });

  await test.step('build the exports', async () => {
    await rail('Deliver').click();
    await page.getByRole('button', { name: /build exports/i }).click();
    await expect(page.getByTestId('export-whatsapp')).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/Film delivered/)).toBeVisible();
  });

  await test.step('every export downloads and plays', async () => {
    const expected = { master: [1280, 720], reel: [1080, 1920], whatsapp: [854, 480] };
    for (const [key, [width, height]] of Object.entries(expected)) {
      const href = await page.getByTestId(`export-${key}`).getByRole('link', { name: /download/i }).getAttribute('href');
      const res = await page.request.get(href);
      expect(res.ok(), `${key} download`).toBeTruthy();
      const file = testInfo.outputPath(`${key}.mp4`);
      writeFileSync(file, await res.body());
      const info = probe(file);
      expect(info, key).toMatchObject({ width, height, audio: true });
      expect(info.duration, `${key} duration`).toBeGreaterThan(11);
    }
  });

  await test.step('the acceptance record shows the work', async () => {
    const card = page.getByRole('region', { name: 'Acceptance record' });
    await expect(card.getByText('Stills generated').locator('..')).toContainText('2');
    await expect(card.getByText('Turnaround (brief to exports)').locator('..')).not.toContainText('Not delivered yet');
  });
});
