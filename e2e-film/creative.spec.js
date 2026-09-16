import { test, expect } from '../e2e/support/test';

// Creative Performance, Templates and the Marketing Plan against the real engine
// (launch plan 5.2, G39), with Instagram replaced by the in-process one in
// scripts/e2e_film_server.py — a link named busy-* reports a livelier post, so the
// two published posts are genuinely different. ANL-005, CAMP-013.
const REEL = 'https://cdn.example.in/busy-terrace.mp4';
const IMAGE = 'https://cdn.example.in/monsoon-offer.jpg';

test('published posts drive Creative Performance, and a template opens Studio', async ({ page }) => {
  const stamp = Date.now();
  let ws;
  const api = (path, data) => page.request.post(`/api/effy${path}`, { data });

  await test.step('sign up, connect Instagram and publish two posts', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `creative-${stamp}@example.in`, password: 'creative-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    expect((await api('/integrations/instagram/connect-token', { workspace: ws, token: 'e2e-user-token' })).ok()).toBeTruthy();

    const reel = await (await api('/publish/instagram-reel', {
      workspace: ws, videoUrl: REEL, title: 'Terrace sealed', caption: 'We sealed a terrace in Pune yesterday.\nHere is how.' })).json();
    const post = await (await api('/publish/instagram', {
      workspace: ws, imageUrl: IMAGE, title: 'Rains ready', caption: 'Is your roof ready for the rains?' })).json();
    expect([reel.status, post.status]).toEqual(['ok', 'ok']);
    for (const p of [reel, post]) expect((await api(`/posts/${p.postId}/insights`, {})).ok()).toBeTruthy();

    // A third post nobody has read the numbers for.
    expect((await api('/publish/instagram', { workspace: ws, imageUrl: IMAGE, title: 'Free check', caption: 'Free roof check this week' })).ok()).toBeTruthy();
  });

  await test.step('Creative Performance compares them honestly (ANL-005)', async () => {
    await page.goto('/app/analytics/creative');
    await expect(page.getByText('Comparing 2 of your 3 published posts')).toBeVisible();

    const best = page.getByRole('region', { name: 'Best format' });
    await expect(best).toContainText('Reel');
    await expect(best).toContainText('14% engagement across 1 post');
    await expect(page.getByRole('region', { name: 'Best hook' })).toContainText('Statement or story');

    const byHook = page.getByRole('region', { name: 'By hook' });
    await expect(byHook).toContainText('Question');
    await expect(byHook).toContainText('10.9% · 1,240 reach · 1 post');

    // Every published post is listed — including the one with no numbers yet.
    const listed = page.getByRole('region', { name: 'Published posts' });
    await expect(listed.getByRole('heading', { name: 'Free check' })).toBeVisible();
    await expect(listed.getByRole('link', { name: 'No numbers yet' })).toHaveCount(1);
    await expect(listed.getByRole('link', { name: 'View' }).first()).toHaveAttribute('href', /^https:\/\/www\.instagram\.com\/p\/e2e\d+\/$/);
  });

  await test.step('a template opens AI Studio in its own format with the brief', async () => {
    await page.goto('/app/templates');
    const card = page.getByRole('article', { name: 'Before and after' });
    await expect(card).toContainText('Instagram Reel');
    await card.getByRole('button', { name: 'Use this template' }).click();
    await expect(page).toHaveURL(/\/app\/studio\?format=ig_reel/);
    await expect(page.getByText('Instagram Reel')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create a post' })).toHaveCount(0);
    await expect(page.getByDisplayValue(/before-and-after reel of one real job/)).toBeVisible();
  });

  await test.step('the Marketing Plan writes a plan for this workspace (CAMP-013)', async () => {
    await page.goto('/app/plan');
    await page.getByRole('button', { name: 'Generate plan' }).click();
    await expect(page.getByRole('region', { name: 'Content pillars' })).toBeVisible();
    await expect(page.getByRole('region', { name: '12 post ideas' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Write a new plan' })).toBeVisible();
  });

  await test.step('the Blog says plainly that there is nothing to read yet', async () => {
    await page.goto('/app/blog');
    await expect(page.getByRole('heading', { name: 'Coming soon' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Notify me when ready/ })).toBeVisible();
  });
});
