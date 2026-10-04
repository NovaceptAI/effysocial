import { test, expect } from './support/test';
import { stubApi } from './support/api';
import pay from '../src/test/fixtures/payments';

// Buying a plan with Razorpay Standard Checkout (launch plan 6.6) under the production
// Content-Security-Policy: the checkout script comes from checkout.razorpay.com and the
// payment window is an iframe from api.razorpay.com. Both are stand-ins here (no network),
// served from Razorpay's own origins so the policy is checked for real.
const FAKE_CHECKOUT = `
window.Razorpay = function (options) {
  this.open = function () {
    var frame = document.createElement('iframe');
    frame.src = 'https://api.razorpay.com/v1/checkout/embedded';
    frame.title = 'Razorpay Checkout';
    document.body.appendChild(frame);
    setTimeout(function () { options.handler(${JSON.stringify(pay.razorpayResponse)}); }, 50);
  };
  this.on = function () {};
};`;

test('an admin buys Pro in test mode and the plan follows', async ({ page }) => {
  let paid = false;
  await page.route('https://checkout.razorpay.com/v1/checkout.js', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_CHECKOUT }));
  await page.route('https://api.razorpay.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Razorpay</p>' }));
  const api = await stubApi(page, {
    'GET /bootstrap': () => (paid ? pay.bootstrapPaid : pay.bootstrap),
    'GET /billing/credits': { status: 'ok', used: 0, allowance: 150, remaining: 150, warning: null },
    'GET /billing/checkout': () => (paid ? pay.checkoutPaid : pay.checkoutTest),
    'POST /billing/orders': pay.order,
    'POST /billing/verify': () => { paid = true; return pay.verified; },
  });

  await page.goto('/app/billing');
  const section = page.getByRole('region', { name: 'Change plan' });
  await expect(section.getByRole('note')).toContainText('Test mode');
  await section.getByRole('button', { name: 'Buy Pro, 1 month, ₹4,999' }).click();
  await expect(page.getByTitle('Razorpay Checkout')).toBeAttached();
  await expect(section.getByText(/^Paid\. You’re on Pro until /)).toBeVisible();
  await expect(page.getByText(/^Pro, paid until /)).toBeVisible();
  await expect(page.getByRole('table', { name: 'Payments' })).toContainText('pay_Rz9QhX7y8Z9a0B');
  expect(api.callsTo('POST /billing/verify').map((c) => c.body)).toEqual([pay.razorpayResponse]);
});
