import fs from 'node:fs';
import { test, expect } from '../e2e/support/test';

// Organic Analytics against the real engine (launch plan 5.9, G41), with Instagram stood
// in by scripts/e2e_film_server.py as a 31-follower account: the page shows the account's
// real 28-day numbers and a published post, says why audience and follower growth are
// missing, and exports the same as a CSV. Nothing on it is a sample.
test('organic analytics shows real numbers, says what is missing, and exports them', async ({ page }) => {
  let ws;

  await test.step('sign up, connect Instagram and publish a post with numbers', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `organic-${Date.now()}@example.in`, password: 'organic-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    const api = (path, data) => page.request.post(`/api/effy${path}`, { data });
    expect((await api('/integrations/instagram/connect-token', { workspace: ws, token: 'e2e-user-token' })).ok()).toBeTruthy();
    const post = await (await api('/publish/instagram', {
      workspace: ws, imageUrl: 'https://cdn.example.in/monsoon-offer.jpg', title: 'Monsoon offer', caption: 'Is your roof ready for the rains?' })).json();
    expect((await api(`/posts/${post.postId}/insights`, {})).ok()).toBeTruthy();
  });

  await test.step('the page shows the account and its real numbers', async () => {
    await page.goto('/app/analytics/organic');
    const account = page.getByRole('region', { name: 'Instagram account' });
    await expect(account).toContainText('@roofseal.e2e');
    await expect(account).toContainText('31 followers');
    await expect(page.getByText('5,400 views · last 28 days')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Daily reach' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Top posts' })).toContainText('Monsoon offer');
    await expect(page.getByRole('region', { name: "What's working" })).toContainText('Monsoon offer · 1,240 reach');
  });

  await test.step('what Instagram does not share says why, and nothing is a sample', async () => {
    await expect(page.getByRole('region', { name: 'Audience' })).toContainText('Instagram shares this once an account has 100 followers.');
    await expect(page.getByRole('region', { name: 'Best posting times' })).toContainText('Needs at least 6 published posts with numbers — you have 1.');
    await expect(page.getByText(/Sample series/)).toHaveCount(0);
    await expect(page.getByText('Educational')).toHaveCount(0);
  });

  await test.step('the export holds the same numbers', async () => {
    const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export CSV' }).click()]);
    expect(file.suggestedFilename()).toMatch(/-organic-analytics\.csv$/);
    const lines = fs.readFileSync(await file.path(), 'utf8').replace(/^﻿/, '').split('\r\n');
    expect(lines).toContain('Instagram account,instagram.com/roofseal.e2e,Instagram');
    expect(lines).toContain('Reach (28 days),1240,Instagram');
    expect(lines.some((l) => l.startsWith('Monsoon offer,post,'))).toBeTruthy();
  });
});
