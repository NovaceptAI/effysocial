import { test, expect } from '../e2e/support/test';

// The Calendar, Approvals and Published actions against the real engine (launch plan
// 4.3, G29), with Instagram replaced by the in-process fake in scripts/e2e_film_server.py
// and no AI (as when Groq is down). PUBL-004 and PUBL-016 through the UI, PUBL-015,
// PUBL-017, PUBL-018 and PUBL-019.
const IMAGE = 'https://cdn.example.in/monsoon-offer.jpg';

// 'YYYY-MM-DD' in India time, n days from now: posts are planned in the organisation's timezone.
const indiaDate = (n) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(Date.now() + n * 86400000));

test('plan, schedule, approve, review and report', async ({ page, browser }) => {
  const stamp = Date.now();
  const tomorrow = indiaDate(1);
  let ws;
  const api = (path, data) => page.request.post(`/api/effy${path}`, { data });

  await test.step('sign up and connect Instagram', async () => {
    await page.goto('/login');
    const r = await api('/auth/register', { email: `planner-${stamp}@example.in`, password: 'calendar-e2e-123', name: 'Asha Rao', orgName: 'Northwind' });
    expect(r.ok()).toBeTruthy();
    ws = (await r.json()).workspaces[0].id;
    expect((await api('/integrations/instagram/connect-token', { workspace: ws, token: 'e2e-user-token' })).ok()).toBeTruthy();
  });

  await test.step('New post scheduled for 23:30 keeps its date in month and list views (PUBL-017, PUBL-004, PUBL-016, PUBL-015)', async () => {
    await page.goto('/app/calendar');
    await expect(page.getByText(/Times are India time\./)).toBeVisible();
    await expect(page.locator('[aria-current="date"]')).toHaveAttribute('data-date', indiaDate(0));
    await page.getByRole('button', { name: 'New post', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'New post' });
    await dialog.getByLabel('Title').fill('Late monsoon offer');
    await dialog.getByLabel(/^Caption/).fill('Free roof check before the rains return. #monsoon');
    await dialog.getByRole('button', { name: 'Use a link' }).click();
    await dialog.getByLabel('Media link').fill(IMAGE);
    await dialog.getByRole('button', { name: 'Use', exact: true }).click();
    await dialog.getByLabel('Date').fill(tomorrow);
    await dialog.getByLabel('Time').fill('23:30');
    await dialog.getByRole('button', { name: 'Schedule', exact: true }).click();
    await expect(dialog).toBeHidden();

    const day = page.locator(`[data-date="${tomorrow}"]`);
    await day.getByRole('button', { name: /Late monsoon offer/ }).click();
    const details = page.getByRole('dialog', { name: 'Edit post' });
    await expect(details.getByText('Scheduled', { exact: true })).toBeVisible();
    await expect(details.getByRole('button', { name: 'Reschedule' })).toBeVisible();
    await details.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'List', exact: true }).click();
    await expect(page.getByRole('button', { name: /Late monsoon offer/ })).toContainText(`${tomorrow} 23:30`);
  });

  await test.step('Fill gaps suggests from the Ideas board and says what AI couldn’t fill (PUBL-017)', async () => {
    expect((await api('/ideas', { workspace: ws, title: 'Why terraces leak', notes: 'The three usual causes' })).ok()).toBeTruthy();
    await page.getByRole('button', { name: 'Month', exact: true }).click();
    await page.getByRole('button', { name: 'Fill gaps', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Fill gaps' });
    const idea = dialog.locator('label').filter({ hasText: 'Why terraces leak' });
    await expect(idea).toContainText('Ideas board');
    await expect(dialog.getByText(/more empty days? needs? an idea/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Add 1 to calendar' }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'List', exact: true }).click();
    await expect(page.getByRole('button', { name: /Why terraces leak/ })).toContainText('Idea');
  });

  let approver;
  await test.step('Bulk approve moves the selected posts on together (PUBL-017)', async () => {
    for (const title of ['Terrace before and after', 'Waterproofing myths']) {
      const r = await api('/posts', { workspace: ws, title, status: 'internal_review', caption: `${title} caption`, mediaUrl: IMAGE, date: indiaDate(3), time: '18:00' });
      expect(r.ok()).toBeTruthy();
    }
    await page.goto('/app/approvals');
    await page.getByRole('checkbox', { name: 'Select Terrace before and after' }).check();
    await page.getByRole('checkbox', { name: 'Select Waterproofing myths' }).check();
    await page.getByRole('button', { name: 'Approve selected (2)' }).click();
    await expect(page.getByRole('status')).toHaveText('Approved 2.');
    await expect(page.getByRole('button', { name: /Terrace before and after/ })).toContainText('Client review');
  });

  await test.step('a client approver approves one post and asks for changes on another (PUBL-019, PUBL-002)', async () => {
    const invite = await (await api('/team/invites', { email: `meera-${stamp}@client.in`, role: 'Client approver' })).json();
    const token = new URL(invite.link).searchParams.get('token');
    const context = await browser.newContext();
    approver = await context.newPage();
    await approver.goto('/login');
    expect((await approver.request.post(`/api/effy/invites/${token}/accept`, { data: { name: 'Meera Iyer', password: 'client-e2e-123' } })).ok()).toBeTruthy();
    await approver.goto('/app/approvals');
    await expect(approver.getByText('2 items awaiting your review')).toBeVisible();

    await approver.getByRole('button', { name: /Terrace before and after/ }).click();
    const first = approver.getByRole('region', { name: 'Review Terrace before and after' });
    await expect(first.getByText('Terrace before and after caption')).toBeVisible();
    await first.getByRole('button', { name: 'Approve', exact: true }).click();
    await expect(approver.getByRole('button', { name: /Terrace before and after/ })).toHaveCount(0);

    const second = approver.getByRole('region', { name: 'Review Waterproofing myths' });
    await second.getByLabel('Add a comment').fill('Use the new logo please');
    await second.getByRole('button', { name: 'Request changes' }).click();
    await expect(approver.getByRole('heading', { name: 'Nothing to review' })).toBeVisible();
    expect((await approver.request.post('/api/effy/posts', { data: { workspace: ws, title: 'Not allowed' } })).status()).toBe(403);

    await page.goto('/app/calendar');
    await page.getByRole('button', { name: 'List', exact: true }).click();
    await page.getByRole('button', { name: /Waterproofing myths/ }).click();
    const details = page.getByRole('dialog', { name: 'Edit post' });
    await expect(details.getByText('Draft', { exact: true })).toBeVisible();
    await details.getByRole('button', { name: 'Close' }).click();
    await context.close();
  });

  await test.step('Report reads the numbers from Instagram; Create ad and Repurpose hand the post on (PUBL-018)', async () => {
    const published = await (await api('/publish/instagram', { workspace: ws, imageUrl: IMAGE, caption: 'Monsoon offer is live', title: 'Offer live' })).json();
    expect(published.status).toBe('ok');
    await page.goto('/app/published');
    const card = page.getByRole('article', { name: 'Offer live' });
    await card.getByRole('button', { name: 'Report', exact: true }).click();
    const report = page.getByRole('dialog', { name: 'Report: Offer live' });
    await expect(report.getByText('Reach', { exact: true }).locator('xpath=following-sibling::dd')).toHaveText('1,240');
    await expect(report.getByText(/Engagement rate/)).toContainText('10.9%');
    await report.getByRole('button', { name: 'Close' }).click();
    await expect(card.getByText('Reach').locator('xpath=preceding-sibling::div')).toHaveText('1,240');

    await card.getByRole('button', { name: 'Create ad' }).click();
    await expect(page).toHaveURL(new RegExp(`/app/launch\\?post=${published.postId}$`));
    await expect(page.getByText('Creating an ad from a post')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Monsoon Checkup Drive')).toHaveValue('Offer live — ad');

    await page.goto('/app/published');
    await page.getByRole('article', { name: 'Offer live' }).getByRole('button', { name: 'Repurpose' }).click();
    await expect(page.getByRole('heading', { name: 'Repurpose a post' })).toBeVisible();
  });
});
