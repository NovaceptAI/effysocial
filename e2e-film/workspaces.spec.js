import { test, expect } from '../e2e/support/test';

// Workspaces and client workspaces against the real engine (launch plan 3.1, G21):
// an agency adds a client, each client's figures come from its own rows, switching
// workspace leaves no rows from the last one, and a new workspace can be created and
// stays selected across a reload. TEN-004, TEN-006, TEN-007, TEN-008.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

test('an agency adds a client, sees real figures and switches cleanly', async ({ page }) => {
  const api = page.request;
  let first;
  let second;

  await test.step('sign up as an agency', async () => {
    await page.goto('/login');
    const r = await api.post('/api/effy/auth/register', {
      data: { email: `agency-${Date.now()}@example.in`, password: 'clients-e2e-1', name: 'Asha Rao', orgName: 'Northwind', orgType: 'agency' },
    });
    expect(r.ok()).toBeTruthy();
    first = (await r.json()).workspaces[0];
  });

  await test.step('add a client from the Clients page (TEN-007)', async () => {
    await page.goto('/app/clients');
    await page.getByRole('button', { name: /add client/i }).click();
    const dialog = page.getByRole('dialog', { name: 'Add a client' });
    await dialog.getByLabel('Client name').fill('Sunrise Motors');
    await dialog.getByLabel('Industry').fill('Automotive');
    await dialog.getByLabel('Location').fill('Nashik');
    await dialog.getByRole('button', { name: 'Add client' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('2 workspaces under management')).toBeVisible();
    const boot = await (await api.get('/api/effy/bootstrap')).json();
    second = boot.workspaces.find((w) => w.name === 'Sunrise Motors');
    expect(second).toBeTruthy();
    await expect(page.getByTestId(`client-${second.id}`)).toContainText('Sunrise Motors');
  });

  await test.step('give each client different activity', async () => {
    const lead = (ws, name) => api.post('/api/effy/leads', { data: { workspace: ws.id, name } });
    expect((await lead(first, 'Kiran Patil')).ok()).toBeTruthy();
    expect((await lead(second, 'Meera Shah')).ok()).toBeTruthy();
    expect((await lead(second, 'Dev Joshi')).ok()).toBeTruthy();
    const post = await api.post('/api/effy/posts', { data: { workspace: second.id, title: 'Service camp', status: 'client_review' } });
    expect(post.ok()).toBeTruthy();
    const campaign = await api.post('/api/effy/campaigns', { data: { workspace: first.id, name: 'Monsoon', status: 'live', budget: 20000, spent: 12500 } });
    expect(campaign.ok()).toBeTruthy();
    const upload = await api.post('/api/effy/library/upload', {
      multipart: { workspace: first.id, file: { name: 'northwind-banner.png', mimeType: 'image/png', buffer: PNG } },
    });
    expect(upload.ok()).toBeTruthy();
  });

  await test.step('the Clients table shows each client’s own figures (TEN-008)', async () => {
    await page.reload();
    await expect(page.getByRole('columnheader', { name: 'Leads (30d)' })).toBeVisible();
    const headers = await page.getByRole('columnheader').allTextContents();
    const cell = (ws, column) => page.getByTestId(`client-${ws.id}`).getByRole('cell').nth(headers.indexOf(column));
    await expect(cell(first, 'Leads (30d)')).toHaveText('1');
    await expect(cell(second, 'Leads (30d)')).toHaveText('2');
    await expect(cell(first, 'Spend')).toHaveText('₹12.5K');
    await expect(cell(second, 'Spend')).toHaveText('₹0');
    await expect(cell(first, 'Approvals')).toHaveText('0');
    await expect(cell(second, 'Approvals')).toHaveText('1');
    await expect(cell(first, 'Manager')).toHaveText('Asha Rao');
    await expect(cell(first, 'Paid').getByRole('img')).toHaveAttribute('aria-label', /^Paid: Poor — “Monsoon” is spending with no leads in 30 days\.$/);
    await expect(cell(second, 'Paid').getByRole('img')).toHaveAttribute('aria-label', 'Paid: No activity — No live campaigns.');
  });

  await test.step('switching workspace leaves no rows from the last one (TEN-004)', async () => {
    const seen = [];
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.pathname.startsWith('/api/effy/')) seen.push(`${url.pathname}?${url.searchParams.get('workspace') || ''}`);
    });

    await page.getByTestId(`client-${first.id}`).click();
    await page.goto('/app/pipeline');
    await expect(page.getByRole('link', { name: 'Kiran Patil' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Meera Shah' })).toHaveCount(0);
    await page.goto('/app/media');
    await expect(page.getByText('northwind-banner.png')).toBeVisible();

    // Switch from the profile menu while on the Media Library.
    await page.getByTitle('Asha Rao').click();
    await page.getByRole('button', { name: /Workspace\s*Northwind/ }).click();
    await page.getByRole('button', { name: 'Sunrise Motors' }).click();
    await expect(page.getByText('northwind-banner.png')).toHaveCount(0);
    await expect.poll(() => seen.includes(`/api/effy/library?${second.id}`)).toBe(true);

    await page.goto('/app/pipeline');
    await expect(page.getByRole('link', { name: 'Meera Shah' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dev Joshi' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Kiran Patil' })).toHaveCount(0);

    // A half-typed lead must not follow the user into the other workspace.
    await page.getByRole('button', { name: 'Add lead' }).first().click();
    await page.getByPlaceholder('Lead name…').fill('Half typed');
    await page.getByTitle('Asha Rao').click();
    await page.getByRole('button', { name: /Workspace\s*Sunrise Motors/ }).click();
    await page.getByRole('button', { name: 'Northwind' }).click();
    await expect(page.getByRole('link', { name: 'Kiran Patil' }).first()).toBeVisible();
    await expect(page.getByPlaceholder('Lead name…')).toHaveCount(0);
    await page.getByTitle('Asha Rao').click();
    await page.getByRole('button', { name: /Workspace\s*Northwind/ }).click();
    await page.getByRole('button', { name: 'Sunrise Motors' }).click();
    await expect(page.getByRole('link', { name: 'Meera Shah' }).first()).toBeVisible();

    for (const [path, endpoint] of [['/app/integrations', '/api/effy/integrations'], ['/app/billing', '/api/effy/billing/credits']]) {
      seen.length = 0;
      await page.goto(path);
      await expect.poll(() => seen.some((s) => s.startsWith(`${endpoint}?`))).toBe(true);
      expect(seen.filter((s) => s.startsWith(`${endpoint}?`)), path).toEqual(expect.arrayContaining([`${endpoint}?${second.id}`]));
      expect(seen.filter((s) => s.startsWith(`${endpoint}?`) && s !== `${endpoint}?${second.id}`), path).toEqual([]);
    }
  });

  await test.step('create a new workspace, which stays selected after a reload (TEN-006)', async () => {
    await page.goto('/app/workspaces');
    await page.getByRole('button', { name: /new workspace/i }).click();
    const dialog = page.getByRole('dialog', { name: 'Add a client' });
    await dialog.getByLabel('Client name').fill('Lakeview Homes');
    await dialog.getByRole('button', { name: 'Add client' }).click();
    await expect(page).toHaveURL(/\/app$/);
    await page.reload();
    await page.getByTitle('Asha Rao').click();
    await expect(page.getByRole('button', { name: /Workspace\s*Lakeview Homes/ })).toBeVisible();
  });
});
