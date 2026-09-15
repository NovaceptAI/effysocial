import crypto from 'node:crypto';
import { test, expect } from '../e2e/support/test';

// Settings and two-factor sign-in against the real engine (launch plan 3.5, G44):
// Profile & settings opens Settings, preferences survive a reload, and two-factor sign-in
// is turned on with a real authenticator code and then asked for at sign-in.
// SET-001, SET-003, SHELL-008.
function base32(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = [...secret.replace(/[\s=]/g, '').toUpperCase()].map((c) => alphabet.indexOf(c).toString(2).padStart(5, '0')).join('');
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

// What an authenticator app shows (RFC 6238), `ahead` steps from now.
function totp(secret, ahead = 0) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000) + ahead));
  const digest = crypto.createHmac('sha1', base32(secret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, '0');
}

test('settings save, and two-factor sign-in works end to end', async ({ page }) => {
  const email = `settings-${Date.now()}@example.in`;
  const password = 'settings-e2e-123';

  await test.step('Profile & settings opens Settings (SHELL-008)', async () => {
    await page.goto('/login');
    const r = await page.request.post('/api/effy/auth/register', { data: { email, password, name: 'Asha Rao' } });
    expect(r.ok()).toBeTruthy();
    await page.goto('/app/brand');
    await page.getByTitle('Asha Rao').click();
    await page.getByRole('button', { name: 'Profile & settings' }).click();
    await expect(page).toHaveURL(/\/app\/settings$/);
  });

  await test.step('preferences survive a reload (SET-001)', async () => {
    const leads = page.getByRole('region', { name: 'Notifications' }).getByRole('switch', { name: 'New leads' });
    await expect(leads).toHaveAttribute('aria-checked', 'true');
    await leads.click();
    await expect(leads).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('region', { name: 'Appearance' }).getByRole('button', { name: 'compact' }).click();
    await expect(page.getByRole('region', { name: 'Appearance' }).getByRole('button', { name: 'compact' })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('region', { name: 'Notifications' }).getByRole('switch', { name: 'New leads' })).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('region', { name: 'Appearance' }).getByRole('button', { name: 'compact' })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe('14.5px');
  });

  let secret;
  await test.step('turn on two-factor sign-in with an authenticator code (SET-003)', async () => {
    await page.getByRole('region', { name: 'Security' }).getByRole('button', { name: 'Turn on' }).click();
    const dialog = page.getByRole('dialog', { name: 'Turn on two-factor sign-in' });
    await dialog.getByLabel('Your password').fill(password);
    await dialog.getByRole('button', { name: 'Continue' }).click();
    await expect(dialog.getByRole('img', { name: 'QR code for your authenticator app' }).locator('svg')).toBeVisible();
    secret = (await dialog.getByLabel('Setup key').textContent()).replace(/\s/g, '');
    await dialog.getByLabel('Code from the app').fill(totp(secret));
    await dialog.getByRole('button', { name: 'Turn on' }).click();
    await expect(dialog.getByRole('list', { name: 'Recovery codes' }).getByRole('listitem')).toHaveCount(8);
    await dialog.getByRole('button', { name: 'I’ve saved them' }).click();
    await expect(page.getByRole('region', { name: 'Security' })).toContainText('On · 8 recovery codes left');
  });

  await test.step('signing in now asks for the code', async () => {
    await page.getByTitle('Asha Rao').click();
    await page.getByRole('button', { name: 'Log out' }).click();
    await page.goto('/login');
    await page.getByPlaceholder('you@company.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByRole('heading', { name: 'Two-factor sign-in' })).toBeVisible();
    expect((await page.request.get('/api/effy/bootstrap')).status()).toBe(401); // the password alone isn't a session
    await page.getByLabel('Authentication code').fill('000000');
    await page.getByRole('button', { name: /verify/i }).click();
    await expect(page.getByRole('alert')).toContainText("doesn't match");
    await page.getByLabel('Authentication code').fill(totp(secret, 1)); // the enabling code can't be reused
    await page.getByRole('button', { name: /verify/i }).click();
    await expect(page).toHaveURL(/\/app$/);
  });
});
