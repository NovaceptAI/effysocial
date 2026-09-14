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
