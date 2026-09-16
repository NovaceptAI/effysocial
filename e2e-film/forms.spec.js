import fs from 'node:fs';
import { test, expect } from '../e2e/support/test';

// Form submissions against the real engine (launch plan 5.7, G38; LEAD-011): two people
// fill in a public form, one from an Instagram link; the business opens the form's
// submissions, follows one to its lead, and exports them all as a CSV.
test('a form lists its submissions, links to their leads and exports them', async ({ page, browser }) => {
  let form;

  await test.step('sign up and publish a lead form', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `forms-${Date.now()}@example.in`, password: 'forms-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    const ws = (await r.json()).workspaces[0].id;
    form = (await (await page.request.post('/api/effy/forms', { data: { workspace: ws, name: 'Monsoon enquiry' } })).json()).form;
    expect((await page.request.patch(`/api/effy/forms/${form.id}`, { data: { status: 'published' } })).ok()).toBeTruthy();
  });

  await test.step('two people fill in the public form', async () => {
    for (const [name, phone, query] of [['Meera Iyer', '98765 11111', ''], ['Vikram Shah', '98765 22222', '?utm_source=instagram&utm_campaign=monsoon']]) {
      const visitor = await browser.newContext();
      const tab = await visitor.newPage();
      await tab.goto(`/f/${form.slug}${query}`);
      await tab.getByLabel(/Your name/).fill(name);
      await tab.getByLabel(/Phone/).fill(phone);
      await tab.getByRole('button', { name: 'Submit' }).click();
      await expect(tab.getByText(/Thanks!/)).toBeVisible();
      await visitor.close();
    }
  });

  await test.step('the form lists them, newest first, with where they came from', async () => {
    await page.goto('/app/forms');
    await page.getByRole('button', { name: /submissions to Monsoon enquiry/ }).click();
    const panel = page.getByRole('region', { name: 'Submissions to Monsoon enquiry' });
    await expect(panel).toContainText('2 submissions.');
    const rows = panel.getByRole('row');
    await expect(rows.nth(1)).toContainText('Vikram Shah');
    await expect(rows.nth(1)).toContainText('instagram · monsoon');
    await expect(rows.nth(2)).toContainText('Meera Iyer');
    await expect(rows.nth(2)).toContainText('Direct');
  });

  await test.step('the export holds both submissions', async () => {
    const panel = page.getByRole('region', { name: 'Submissions to Monsoon enquiry' });
    const [file] = await Promise.all([page.waitForEvent('download'), panel.getByRole('button', { name: /Export CSV/ }).click()]);
    expect(file.suggestedFilename()).toBe('monsoon-enquiry-submissions.csv');
    const lines = fs.readFileSync(await file.path(), 'utf8').replace(/^﻿/, '').split('\r\n');
    expect(lines[0]).toContain('Submitted,Your name,Phone,Email,UTM source');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('Vikram Shah,98765 22222,,instagram,,monsoon');
    expect(lines[2]).toContain('Meera Iyer,98765 11111');
  });

  await test.step('a submission opens its lead', async () => {
    const panel = page.getByRole('region', { name: 'Submissions to Monsoon enquiry' });
    await panel.getByRole('link', { name: /Vikram Shah/ }).click();
    await expect(page).toHaveURL(/\/app\/pipeline\/\d+$/);
    await expect(page.getByRole('heading', { name: 'Vikram Shah' })).toBeVisible();
  });
});
