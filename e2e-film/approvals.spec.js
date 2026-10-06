import { test, expect } from '../e2e/support/test';

// Settings → Roles & client approval against the real engine (launch plan 6.16): a Business
// turns on "Require approval before publishing"; a new post can then only be sent for
// review, is approved in one step (no client review stage), and nothing can be saved as
// approved to skip it.
test('with approval required, a post goes through review before it can be scheduled', async ({ page }) => {
  const api = page.request;
  let ws;

  await test.step('a Business turns on Require approval', async () => {
    await page.goto('/login');
    const r = await api.post('/api/effy/auth/register', {
      data: { email: `approvals-${Date.now()}@example.in`, password: 'kettle-e2e-123', name: 'Asha Rao', orgName: 'Rao Dental', orgType: 'business' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    await page.goto('/app/settings');
    const roles = page.getByRole('region', { name: 'Roles & client approval' });
    await expect(roles.getByRole('switch')).toHaveCount(4);
    await roles.getByRole('switch', { name: 'Require approval before publishing' }).click();
    await expect(roles.getByRole('switch', { name: 'Require approval before publishing' })).toHaveAttribute('aria-checked', 'true');
  });

  await test.step('a new post can only be sent for review', async () => {
    await page.goto('/app/calendar');
    await page.getByRole('button', { name: 'New post', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'New post' });
    await expect(dialog.getByRole('note')).toContainText('Posts here need approval before they’re scheduled or published.');
    await expect(dialog.getByRole('button', { name: 'Schedule', exact: true })).toHaveCount(0);
    await dialog.getByLabel('Title').fill('Smile week offer');
    await dialog.getByRole('button', { name: 'Send for review' }).click();
    await expect(dialog).toBeHidden();
  });

  await test.step('it is approved in one step, and nothing skips review', async () => {
    await page.goto('/app/approvals');
    const review = page.getByRole('region', { name: 'Review Smile week offer' });
    await expect(review.getByText('Client Review')).toHaveCount(0);           // no client stage here
    await review.getByRole('button', { name: 'Approve', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Nothing to review' })).toBeVisible();
    const skip = await api.post('/api/effy/posts', { data: { workspace: ws, title: 'Straight out', status: 'approved' } });
    expect(skip.status()).toBe(400);
    expect((await skip.json()).message).toBe('Posts here need approval before they’re scheduled or published. Send it for review first.');
  });
});
