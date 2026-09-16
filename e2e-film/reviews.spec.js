import { test, expect } from '../e2e/support/test';

// The review-request link against the real engine (launch plan 5.8, G31): the business
// makes its link in Reviews, a customer opens it, goes to Google and also leaves private
// feedback; the business sees the visit, the click and the feedback.
test('a review link is shared, used, and its feedback lands in Reviews', async ({ page, browser }) => {
  let publicUrl;

  await test.step('sign up and make the review link', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', {
      data: { email: `reviews-${Date.now()}@example.in`, password: 'reviews-e2e-123', name: 'Asha Rao', orgName: 'Roofseal' },
    });
    expect(r.ok()).toBeTruthy();
    await page.goto('/app/reviews');
    await page.getByRole('button', { name: 'Request reviews' }).click();
    const dialog = page.getByRole('dialog', { name: 'Request reviews' });
    await dialog.getByLabel('Google review link').fill('http://g.page/r/roofseal/review');
    await dialog.getByRole('button', { name: 'Create link' }).click();
    await expect(dialog.getByRole('alert')).toHaveText('Google: Review links must be full https:// addresses.');
    await dialog.getByLabel('Google review link').fill('https://g.page/r/roofseal/review');
    await dialog.getByRole('button', { name: 'Create link' }).click();
    const link = dialog.getByLabel('Review link', { exact: true });
    await expect(link).toHaveValue(/\/r\/[\w-]+$/);
    publicUrl = new URL(await link.inputValue()).pathname;
    await dialog.getByRole('button', { name: 'Close' }).click();
  });

  await test.step('a customer opens it, goes to Google, and tells the business privately', async () => {
    const visitor = await browser.newContext();
    await visitor.route('https://g.page/**', (route) => route.fulfill({ status: 200, body: 'Google review page' }));
    const tab = await visitor.newPage();
    await tab.goto(publicUrl);
    await expect(tab.getByRole('heading', { name: /How was your experience with/ })).toBeVisible();

    // A low rating still shows the public review site.
    await tab.getByRole('button', { name: '2 stars' }).click();
    const google = tab.getByRole('link', { name: 'Review us on Google' });
    await expect(google).toHaveAttribute('href', 'https://g.page/r/roofseal/review');
    const [opened] = await Promise.all([visitor.waitForEvent('page'), google.click()]);
    await opened.close();

    await tab.getByLabel('What happened?').fill('Came two days late');
    await tab.getByLabel('Your name (optional)').fill('Meera');
    await tab.getByRole('button', { name: 'Send privately' }).click();
    await expect(tab.getByText(/has your feedback/)).toBeVisible();
    await visitor.close();
  });

  await test.step('the business sees the visit, the click and the feedback', async () => {
    await page.reload();
    await expect(page.getByText('Came two days late')).toBeVisible();
    await expect(page.getByText(/private feedback/i).first()).toBeVisible();
    await page.getByRole('button', { name: 'Request reviews' }).click();
    const share = page.getByRole('region', { name: 'Your review link' });
    await expect(share).toContainText('Opened 1 time · 1 went to Google.');
  });
});
