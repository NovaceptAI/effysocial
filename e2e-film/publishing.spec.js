import { test, expect } from '../e2e/support/test';

// Publishing against the real engine (launch plan 4.1, G26), with Instagram's Graph API
// replaced by a tiny in-process Instagram (scripts/e2e_film_server.py) that publishes at
// once and refuses an image named refuse-once the first time. Connecting with a token,
// what's refused before sending, Instagram's own reason recorded on the post, and Retry
// publishing it for real. PUBL-005, PUBL-006, PUBL-007, PUBL-008, PUBL-013.
test('a refused post shows Instagram’s reason, and Retry publishes it', async ({ page }) => {
  const email = `publish-${Date.now()}@example.in`;
  const instagram = page.getByRole('group', { name: 'Instagram' });
  const testPost = page.getByRole('dialog', { name: 'Post to Instagram' });

  await test.step('connect Instagram with a token', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', { data: { email, password: 'publish-e2e-123', name: 'Asha Rao' } });
    expect(r.ok()).toBeTruthy();
    await page.goto('/app/integrations');
    await instagram.getByRole('button', { name: 'Use token' }).click();
    const dialog = page.getByRole('dialog', { name: 'Connect Instagram with a token' });
    await dialog.getByPlaceholder('Paste user access token…').fill('e2e-user-token');
    await dialog.getByRole('button', { name: 'Connect' }).click();
    await expect(instagram.getByText('@roofseal.e2e')).toBeVisible();
    await expect(instagram.getByText('Connected', { exact: true })).toBeVisible();
  });

  await test.step('an http image is refused before anything is sent (PUBL-008)', async () => {
    await instagram.getByRole('button', { name: 'Test post' }).click();
    await testPost.getByLabel('Image URL').fill('http://cdn.example.in/roof.jpg');
    await testPost.getByRole('button', { name: 'Publish now' }).click();
    await expect(testPost.getByRole('alert')).toHaveText('A public image URL (https) is required by Instagram.');
  });

  await test.step('a caption Instagram would refuse is flagged first (PUBL-013)', async () => {
    await testPost.getByLabel('Caption').fill(Array.from({ length: 31 }, (_, i) => `#roof${i}`).join(' '));
    await expect(testPost.getByRole('alert')).toHaveText('Instagram allows up to 30 hashtags. This caption has 31.');
    await expect(testPost.getByRole('button', { name: 'Publish now' })).toBeDisabled();
  });

  await test.step('Instagram refuses the image and says why (PUBL-006)', async () => {
    await testPost.getByLabel('Caption').fill('Monsoon roof check #roofseal');
    await testPost.getByLabel('Image URL').fill('https://cdn.example.in/refuse-once.jpg');
    await testPost.getByRole('button', { name: 'Publish now' }).click();
    await expect(testPost.getByRole('alert')).toHaveText('The aspect ratio is not supported.');
    await testPost.getByRole('button', { name: 'Close' }).click();
  });

  await test.step('Published shows the refusal, and Retry publishes it (PUBL-005, PUBL-007)', async () => {
    await page.goto('/app/published');
    const post = page.getByRole('article', { name: 'Instagram test post' });
    await expect(post.getByRole('alert')).toHaveText('The aspect ratio is not supported.');
    await expect(post.getByText('Failed', { exact: true })).toBeVisible();
    await post.getByRole('button', { name: 'Retry' }).click();
    await expect(post.getByRole('link', { name: /view on instagram/i })).toHaveAttribute('href', /^https:\/\/www\.instagram\.com\/p\/e2e\d+\/$/);
    await expect(post.getByText('Published', { exact: true })).toBeVisible();
    await expect(post.getByRole('alert')).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('article', { name: 'Instagram test post' }).getByRole('link', { name: /view on instagram/i })).toBeVisible();
  });
});
