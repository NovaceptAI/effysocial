import { test, expect } from '../e2e/support/test';

// Inviting a teammate against the real engine (launch plan 3.3, G23): the owner invites a
// copywriter, copies the link (no email provider here, as in production for now), the
// copywriter joins in their own browser, a role change applies on their next request,
// and removing them ends their access. RBAC-008, RBAC-009, SET-004.
test('an owner invites a teammate who joins with that role, then changes and removes it', async ({ page, browser }) => {
  const stamp = Date.now();
  const teammate = `kiran-${stamp}@example.in`;
  let link;
  let ws;

  await test.step('owner invites a copywriter', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `owner-${stamp}@example.in`, password: 'team-e2e-123', name: 'Asha Rao', orgName: 'Northwind', orgType: 'agency' },
    });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    await page.goto('/app/team');
    await page.getByRole('button', { name: /invite member/i }).click();
    const dialog = page.getByRole('dialog', { name: 'Invite a teammate' });
    await dialog.getByLabel('Email').fill(teammate);
    await dialog.getByRole('radio', { name: /Copywriter/ }).check();
    await dialog.getByRole('button', { name: /send invite/i }).click();
    const ready = page.getByRole('dialog', { name: 'Invite ready' });
    await expect(ready).toContainText('the email couldn’t be sent');
    link = await ready.getByLabel('Invite link').inputValue();
    expect(link).toMatch(/\/join\?token=/);
    await ready.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('region', { name: 'Pending invites' })).toContainText(teammate);
  });

  const other = await browser.newContext();
  const invitee = await other.newPage();

  await test.step('the teammate joins from the link in their own browser (RBAC-009)', async () => {
    await invitee.goto(link);
    await expect(invitee.getByRole('heading', { name: 'Join Northwind on EffySocial' })).toBeVisible();
    await expect(invitee.getByText('Asha Rao invited you as Copywriter.')).toBeVisible();
    await invitee.getByLabel('Your name').fill('Kiran Patil');
    await invitee.getByLabel('Choose a password').fill('joining-123');
    await invitee.getByRole('button', { name: /create account and join/i }).click();
    await expect(invitee).toHaveURL(/\/app$/);
    await invitee.goto('/app/team');
    const members = invitee.getByRole('table', { name: 'Members' });
    await expect(members.getByRole('row')).toHaveCount(3); // header + owner + teammate
    await expect(members).toContainText('Kiran Patil');
    await expect(invitee.getByRole('button', { name: /invite member/i })).toBeDisabled();
    const post = await invitee.request.post('/api/effy/posts', { data: { workspace: ws, title: 'Monsoon reel' } });
    expect(post.status()).toBe(200);
    // The link can't be used twice.
    const again = await browser.newContext();
    const reuse = await again.newPage();
    await reuse.goto(link);
    await expect(reuse.getByRole('alert')).toHaveText('This invite has already been used.');
    await again.close();
  });

  await test.step('the owner sees them and changes their role; it applies at once (RBAC-008, SET-004)', async () => {
    await page.reload();
    const row = page.getByRole('table', { name: 'Members' }).getByRole('row').filter({ hasText: teammate });
    await expect(row).toContainText('Kiran Patil');
    await expect(page.getByRole('region', { name: 'Pending invites' })).toHaveCount(0);
    await row.getByRole('combobox', { name: `Role for ${teammate}` }).selectOption('View-only');
    await expect.poll(async () => (await invitee.request.post('/api/effy/posts', { data: { workspace: ws, title: 'Blocked' } })).status()).toBe(403);
  });

  await test.step('removing the teammate ends their access', async () => {
    const row = page.getByRole('table', { name: 'Members' }).getByRole('row').filter({ hasText: teammate });
    await row.getByRole('button', { name: `Remove ${teammate}` }).click();
    await row.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(page.getByRole('table', { name: 'Members' }).getByRole('row')).toHaveCount(2);
    await invitee.goto('/app');
    await expect(invitee.getByRole('heading', { name: 'You’re not part of a team' })).toBeVisible();
  });

  await other.close();
});
