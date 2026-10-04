import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Billing from './Billing';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import pay from '../../test/fixtures/payments';

// Buying a plan with Razorpay Standard Checkout (launch plan 6.6). Engine payloads come from
// fixtures/payments.js; Razorpay's window is a stand-in that answers as the real one does.
const credits = { status: 'ok', used: 0, allowance: 150, remaining: 150, warning: null };

function fakeRazorpay(outcome) {
  const opened = [];
  window.Razorpay = class {
    constructor(options) { this.options = options; this.events = {}; opened.push(this); }
    on(name, fn) { this.events[name] = fn; }
    open() {
      if (outcome === 'pay') this.options.handler(pay.razorpayResponse);
      if (outcome === 'dismiss') this.options.modal.ondismiss();
      if (outcome === 'fail') {
        this.events['payment.failed']({ error: { description: 'Your bank declined this payment.' } });
        this.options.modal.ondismiss();
      }
    }
  };
  return opened;
}

afterEach(() => { delete window.Razorpay; });

describe('Billing → buy a plan', () => {
  it('pays with Razorpay at the engine’s price, verifies, and shows the new plan', async () => {
    const user = userEvent.setup();
    const opened = fakeRazorpay('pay');
    let paid = false;
    const api = mockApi({
      'GET /bootstrap': () => (paid ? pay.bootstrapPaid : pay.bootstrap),
      'GET /billing/credits': credits,
      'GET /billing/checkout': () => (paid ? pay.checkoutPaid : pay.checkoutTest),
      'POST /billing/orders': pay.order,
      'POST /billing/verify': () => { paid = true; return pay.verified; },
    });
    renderApp(<Billing />, { route: '/app/billing' });
    const section = await screen.findByRole('region', { name: 'Change plan' });
    expect(within(section).getByRole('note')).toHaveTextContent('Test mode: no real money moves.');
    expect(within(section).getAllByRole('listitem').map((li) => li.textContent.slice(0, 40))).toEqual([
      expect.stringContaining('Growth₹1,999 / month'), expect.stringContaining('Pro₹4,999 / month'), expect.stringContaining('Agency₹12,999 / month')]);
    await user.click(within(section).getByRole('radio', { name: 'Yearly' }));
    expect(within(section).getByRole('button', { name: 'Buy Pro, 1 year, ₹49,990' })).toBeInTheDocument();
    await user.click(within(section).getByRole('radio', { name: 'Monthly' }));
    await user.click(within(section).getByRole('button', { name: 'Buy Pro, 1 month, ₹4,999' }));

    await waitFor(() => expect(within(section).getByText(/^Paid\. You’re on Pro until /)).toBeInTheDocument());
    expect(api.callsTo('POST /billing/orders').map((c) => c.body)).toEqual([{ plan: 'Pro', period: 'month' }]);
    expect(api.callsTo('POST /billing/verify').map((c) => c.body)).toEqual([pay.razorpayResponse]);
    const o = opened[0].options;
    expect([o.key, o.order_id, o.amount, o.currency, o.description]).toEqual(['rzp_test_Capture1234', pay.order.orderId, 499900, 'INR', 'Pro plan, 1 month']);
    expect(o.prefill.email).toBe(pay.order.prefill.email);
    // The plan and the payment show once the app has re-read them.
    expect(await screen.findByText(/^Pro, paid until /)).toBeInTheDocument();
    const rows = within(await screen.findByRole('table', { name: 'Payments' })).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Pro · monthly');
    expect(rows[1]).toHaveTextContent('₹4,999');
    expect(rows[1]).toHaveTextContent('pay_Rz9QhX7y8Z9a0B');
    expect(rows[1]).toHaveTextContent('TEST');
  });

  it('says nothing was charged when the window is closed', async () => {
    const user = userEvent.setup();
    fakeRazorpay('dismiss');
    const api = mockApi({ 'GET /bootstrap': pay.bootstrap, 'GET /billing/credits': credits,
      'GET /billing/checkout': pay.checkoutTest, 'POST /billing/orders': pay.order });
    renderApp(<Billing />, { route: '/app/billing' });
    await user.click(await screen.findByRole('button', { name: 'Buy Growth, 1 month, ₹1,999' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Payment cancelled — nothing was charged.');
    expect(api.callsTo('POST /billing/verify')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Buy Growth, 1 month, ₹1,999' })).toBeEnabled();
  });

  it('shows why a payment failed', async () => {
    const user = userEvent.setup();
    fakeRazorpay('fail');
    mockApi({ 'GET /bootstrap': pay.bootstrap, 'GET /billing/credits': credits,
      'GET /billing/checkout': pay.checkoutTest, 'POST /billing/orders': pay.order });
    renderApp(<Billing />, { route: '/app/billing' });
    await user.click(await screen.findByRole('button', { name: 'Buy Pro, 1 month, ₹4,999' }));
    // The failure is shown; closing the window afterwards says nothing was charged.
    expect(await screen.findByRole('alert')).toHaveTextContent('nothing was charged');
  });

  it('shows the engine’s refusal when the signature doesn’t match', async () => {
    const user = userEvent.setup();
    fakeRazorpay('pay');
    mockApi({ 'GET /bootstrap': pay.bootstrap, 'GET /billing/credits': credits, 'GET /billing/checkout': pay.checkoutTest,
      'POST /billing/orders': pay.order, 'POST /billing/verify': [400, pay.badSignature] });
    renderApp(<Billing />, { route: '/app/billing' });
    await user.click(await screen.findByRole('button', { name: 'Buy Pro, 1 month, ₹4,999' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(pay.badSignature.message);
  });

  it('says so when the order can’t be made', async () => {
    const user = userEvent.setup();
    const opened = fakeRazorpay('pay');
    mockApi({ 'GET /bootstrap': pay.bootstrap, 'GET /billing/credits': credits, 'GET /billing/checkout': pay.checkoutTest,
      'POST /billing/orders': [502, { status: 'error', message: 'Couldn’t start the payment just now — please try again.' }] });
    renderApp(<Billing />, { route: '/app/billing' });
    await user.click(await screen.findByRole('button', { name: 'Buy Pro, 1 month, ₹4,999' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t start the payment just now');
    expect(opened).toHaveLength(0);
  });

  it('without checkout for this person, Billing says payment is coming', async () => {
    mockApi({ 'GET /bootstrap': pay.bootstrap, 'GET /billing/credits': credits, 'GET /billing/checkout': pay.checkoutTestOwner });
    renderApp(<Billing />, { route: '/app/billing' });
    expect(await screen.findByText('Online payment is coming soon. To change your plan now, contact the EffySocial team.')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Change plan' })).not.toBeInTheDocument();
    expect(screen.getByText('No payments yet.')).toBeInTheDocument();
  });

  it('a plan that ran out says so', async () => {
    mockApi({ 'GET /bootstrap': pay.bootstrapLapsed, 'GET /billing/credits': credits, 'GET /billing/checkout': pay.checkoutTest });
    renderApp(<Billing />, { route: '/app/billing' });
    expect(await screen.findByText(/^Your Pro plan ended on .*, so you’re on the free Creative plan\. Your campaigns, leads and pages are kept — renew below/)).toBeInTheDocument();
  });

  it('the script that can’t load is explained', async () => {
    const user = userEvent.setup();
    const append = vi.spyOn(document.head, 'appendChild').mockImplementation((el) => { setTimeout(() => el.onerror?.(), 0); return el; });
    mockApi({ 'GET /bootstrap': pay.bootstrap, 'GET /billing/credits': credits, 'GET /billing/checkout': pay.checkoutTest, 'POST /billing/orders': pay.order });
    renderApp(<Billing />, { route: '/app/billing' });
    await user.click(await screen.findByRole('button', { name: 'Buy Pro, 1 month, ₹4,999' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t open the payment window.');
    expect(append.mock.calls[0][0].src).toBe('https://checkout.razorpay.com/v1/checkout.js');
    append.mockRestore();
  });
});
