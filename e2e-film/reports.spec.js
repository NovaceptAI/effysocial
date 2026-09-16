import fs from 'node:fs';
import { test, expect } from '../e2e/support/test';

// Campaign reports against the real engine, under the production CSP (launch plan 5.10,
// G42; ANL-008): the business downloads the report as a PDF and shares a read-only link;
// someone signed out opens it and downloads it too; once the link is ended it stops.
test('a report downloads as a PDF and a shared link opens read-only until it is ended', async ({ page, browser }) => {
  let reportUrl;

  await test.step('sign up and start a campaign', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `reports-${Date.now()}@example.in`, password: 'reports-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    const ws = (await r.json()).workspaces[0].id;
    expect((await page.request.post('/api/effy/campaigns', {
      data: { workspace: ws, name: 'Monsoon Drive', objective: 'Lead generation', budget: 40000 },
    })).ok()).toBeTruthy();
  });

  await test.step('the report shows the campaign and downloads as a PDF', async () => {
    await page.goto('/app/reports');
    await expect(page.getByRole('region', { name: 'Results' })).toContainText('of ₹40,000 budget (0%)');
    await expect(page.getByRole('region', { name: 'Results' })).toContainText('needs spend and leads');
    const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Download PDF/ }).click()]);
    expect(file.suggestedFilename()).toMatch(/-monsoon-drive-report\.pdf$/);
    const pdf = fs.readFileSync(await file.path(), 'latin1');
    expect(pdf.startsWith('%PDF-')).toBeTruthy();
    expect(pdf).toContain('Campaign report: Monsoon Drive');
  });

  await test.step('a share link is made and shown once', async () => {
    await page.getByRole('button', { name: /Share link/ }).click();
    const dialog = page.getByRole('dialog', { name: /Share “Monsoon Drive” report/ });
    await dialog.getByRole('button', { name: /Create link/ }).click();
    const link = dialog.getByLabel('Share link', { exact: true });
    await expect(link).toHaveValue(/\/report\/[\w-]{30,}$/);
    reportUrl = new URL(await link.inputValue()).pathname;
    await expect(dialog.getByRole('list', { name: 'Share links' })).toContainText('active');
  });

  await test.step('someone signed out opens it and downloads it', async () => {
    const guest = await browser.newContext();
    const tab = await guest.newPage();
    await tab.goto(reportUrl);
    await expect(tab.getByRole('heading', { name: 'Monsoon Drive' })).toBeVisible();
    await expect(tab.getByRole('region', { name: 'Results' })).toContainText('₹40,000');
    await expect(tab.getByText(/This link ends/)).toBeVisible();
    await expect(tab.getByText(/EffySocial/)).toHaveCount(0);
    const [file] = await Promise.all([tab.waitForEvent('download'), tab.getByRole('button', { name: /Download PDF/ }).click()]);
    expect(fs.readFileSync(await file.path(), 'latin1')).toContain('Campaign report: Monsoon Drive');
    await guest.close();
  });

  await test.step('once ended, the link stops working', async () => {
    const dialog = page.getByRole('dialog', { name: /Share “Monsoon Drive” report/ });
    await dialog.getByRole('button', { name: 'End link' }).click();
    await expect(dialog.getByRole('list', { name: 'Share links' })).toContainText('revoked');
    const guest = await browser.newContext();
    const tab = await guest.newPage();
    await tab.goto(reportUrl);
    await expect(tab.getByRole('alert')).toHaveText('This report link has ended. Ask for a new one.');
    await guest.close();
  });
});
