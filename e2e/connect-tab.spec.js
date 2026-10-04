import { test, expect } from './support/test';
import { stubApi, bootstrap } from './support/api';

// Connecting an account opens the provider's sign-in in its own tab (lib/connectTab.js):
// Integrations stays put, the tab comes back to /connected, reports how it went and closes.
// The provider is played by the stub: its "sign-in" address is /connected itself.
const integrations = (state) => ({ status: 'ok', integrations: [
  { provider: 'linkedin', label: 'LinkedIn', category: 'Social publishing', state, account: state === 'connected' ? 'Asha Rao' : '' },
] });

test('Connect opens a new tab that closes itself, and this page shows the result', async ({ page }) => {
  let linked = false;
  const api = await stubApi(page, {
    'GET /bootstrap': bootstrap,
    'GET /integrations': () => integrations(linked ? 'connected' : 'available'),
    'POST /integrations/linkedin/connect': () => {
      linked = true;   // the provider's sign-in happens in the other tab
      return { status: 'ok', state: 'redirect', redirect: '/connected/integrations?connected=linkedin&status=success' };
    },
  });
  await page.goto('/app/integrations');
  const startUrl = page.url();
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Connect' }).first().click();
  const tab = await popup;
  await tab.waitForEvent('close', { timeout: 10_000 });
  expect(page.url()).toBe(startUrl.split('?')[0] + '?connected=linkedin&status=success');
  await expect(page.getByText(/Connected successfully\./)).toBeVisible();
  await expect(page.getByText('Asha Rao')).toBeVisible();
  expect(api.callsTo('POST /integrations/linkedin/connect')[0].body.returnTo).toBe('integrations-tab');
});
