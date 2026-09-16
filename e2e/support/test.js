import { test as base, expect } from '@playwright/test';

// Every end-to-end test fails if the page reports a Content-Security-Policy
// violation, so a change that needs a new source cannot ship without updating
// deploy/content-security-policy.conf.
export const test = base.extend({
  page: async ({ page }, use) => {
    const violations = [];
    page.on('console', (msg) => {
      if (/Content Security Policy|Refused to (load|execute|apply|connect|frame)/i.test(msg.text())) violations.push(msg.text());
    });
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => {
        console.error(`Content Security Policy violation: ${e.violatedDirective} blocked ${e.blockedURI || 'inline'}`);
      });
    });
    await use(page);
    expect(violations, 'Content-Security-Policy violations').toEqual([]);
  },
});
export { expect };

// The one platform admin the real-engine run shares (EFFY_ADMIN_EMAILS in
// scripts/e2e_film_server.py). Whichever spec reaches it first creates it, so
// every spec must sign in with the same password.
export const PLATFORM_ADMIN = { email: 'admin-e2e@example.in', password: 'plans-admin-123' };

export async function signInPlatformAdmin(page) {
  await page.goto('/login');
  const made = await page.request.post('/api/effy/auth/register', {
    data: { ...PLATFORM_ADMIN, name: 'Platform Admin' },
  });
  if (!made.ok()) {
    const back = await page.request.post('/api/effy/auth/login', { data: PLATFORM_ADMIN });
    if (!back.ok()) throw new Error(`could not sign in the platform admin: ${back.status()}`);
  }
}
