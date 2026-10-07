import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Loader2 } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { useAppAuth } from '../context/AppAuth';
import { loadRazorpay } from '../../lib/razorpay';
import { Button } from '../../ui';
import { cn } from '../../lib/cn';

// Buy a plan with Razorpay Standard Checkout (launch plan 6.6, engine payments.py). The
// engine sets the price and creates the order; Razorpay's window takes the payment; the
// engine checks Razorpay's signature before the plan changes, then the app re-reads it.
const rupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const day = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const PLANS = ['Growth', 'Pro', 'Agency'];

export function usePlanCheckout() {
  return useQuery({ queryKey: ['billing-checkout'], queryFn: effyApi.billingCheckout });
}

// `pick` (Billing's ?plan=) is the plan chosen on a pricing page: it's outlined and scrolled to.
export default function PlanCheckout({ info, pick }) {
  const qc = useQueryClient();
  const { refresh } = useAppAuth();
  const { data, isLoading } = usePlanCheckout();
  const [period, setPeriod] = useState('month');
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);
  const section = useRef(null);
  useEffect(() => {
    if (pick && data?.available) section.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [pick, data?.available]);

  if (isLoading || !data) return null;
  if (!data.available) return <p className="text-xs text-ink-faint mt-3">{data.reason}</p>;

  const paid = info.paid && !info.paid.expired ? info.paid : null;
  const say = (ok, text) => setMsg({ ok, text });

  const pay = async (plan) => {
    setBusy(plan); setMsg(null);
    let order;
    try {
      order = await effyApi.createPaymentOrder(plan, period);
    } catch (e) {
      setBusy(null); say(false, e.message); return;
    }
    let Razorpay;
    try {
      Razorpay = await loadRazorpay();
    } catch {
      setBusy(null); say(false, 'Couldn’t open the payment window. Check your connection (or an ad blocker) and try again.'); return;
    }
    const rzp = new Razorpay({
      key: order.keyId, order_id: order.orderId, amount: order.amount, currency: order.currency,
      name: order.name, description: order.description, prefill: order.prefill, theme: { color: '#E84A33' },
      handler: async (response) => {
        try {
          const done = await effyApi.verifyPayment(response);
          say(true, `Paid. You’re on ${done.payment.plan} until ${day(done.payment.periodEnd)}.`);
          await refresh();
          qc.invalidateQueries({ queryKey: ['billing-checkout'] });
          qc.invalidateQueries({ queryKey: ['billing-credits'] });
        } catch (e) {
          say(false, e.message);
        } finally {
          setBusy(null);
        }
      },
      modal: { ondismiss: () => { setBusy(null); say(false, 'Payment cancelled — nothing was charged.'); } },
    });
    rzp.on('payment.failed', (r) => {
      say(false, `The payment didn’t go through: ${r?.error?.description || 'it was declined'}. Nothing was charged — you can try again.`);
    });
    rzp.open();
  };

  const prices = Object.fromEntries(data.prices.filter((p) => p.period === period).map((p) => [p.plan, p]));
  return (
    <section ref={section} aria-label="Change plan" className="mt-5 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="font-bold text-ink flex items-center gap-2"><CreditCard className="w-4 h-4 text-coral-ink" /> Change plan</h4>
        <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-lg border border-line p-0.5">
          {[['month', 'Monthly'], ['year', 'Yearly']].map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={period === k} onClick={() => setPeriod(k)}
              className={cn('px-3 py-1 text-xs font-semibold rounded-md transition', period === k ? 'bg-coral text-white' : 'bg-transparent text-ink-soft')}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {data.mode === 'test' && (
        <p role="note" className="mb-3 text-xs rounded-lg bg-warning-soft text-warning px-3 py-2">
          Test mode: no real money moves. Pay with a Razorpay test card or the test UPI ID success@razorpay. Only platform admins see this.
        </p>
      )}
      <ul className="grid gap-2 sm:grid-cols-3" aria-label="Plans you can buy">
        {PLANS.map((plan) => {
          const p = prices[plan];
          const current = paid?.plan === plan;
          const bigger = paid && !current && PLANS.indexOf(plan) > PLANS.indexOf(paid.plan);
          return (
            <li key={plan} aria-current={pick === plan ? 'true' : undefined}
              className={cn('rounded-xl border p-3 flex flex-col gap-2', current || pick === plan ? 'border-coral' : 'border-line', pick === plan && 'ring-2 ring-coral/30')}>
              <span className="text-sm font-bold text-ink">{plan}</span>
              <span className="text-lg font-extrabold text-ink tabular-nums">{rupees(p.amount)}<span className="text-xs font-semibold text-ink-faint"> / {period === 'month' ? 'month' : 'year'}</span></span>
              <span className="text-[0.7rem] text-ink-faint">{data.gstPercent ? `Includes ${data.gstPercent}% GST` : 'GST not added'}</span>
              {p.refusal
                ? <span className="text-xs text-ink-faint">{p.refusal}</span>
                : (
                  <Button size="sm" onClick={() => pay(plan)} disabled={busy != null} aria-label={`${current ? 'Extend' : 'Buy'} ${plan}, ${p.label}, ${rupees(p.amount)}`}>
                    {busy === plan ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</> : current ? `Extend by ${p.label}` : `Pay ${rupees(p.amount)}`}
                  </Button>
                )}
              {current && <span className="text-[0.7rem] text-ink-faint">Adds {p.label} after {day(paid.until)}.</span>}
              {bigger && <span className="text-[0.7rem] text-ink-faint">Starts today; the rest of your {paid.plan} plan isn’t credited.</span>}
            </li>
          );
        })}
      </ul>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={cn('mt-3 text-sm rounded-lg px-3.5 py-2.5', msg.ok ? 'bg-success-soft text-success' : 'bg-error-soft text-error')}>{msg.text}</p>}
      <p className="text-xs text-ink-faint mt-3">Plans are paid a month or a year at a time and don’t renew by themselves yet; Billing reminds you before yours ends.</p>
    </section>
  );
}

export function PaymentsList() {
  const { data } = usePlanCheckout();
  const list = data?.payments || [];
  if (!list.length) return <p className="text-sm text-ink-soft">No payments yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]" aria-label="Payments">
        <thead>
          <tr className="text-left text-xs font-bold text-ink-faint uppercase tracking-wide border-b border-line">
            {['Paid', 'Plan', 'Covers', 'Amount', 'Payment id'].map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} className="border-b border-line/60 last:border-0">
              <td className="py-2.5 pr-3 whitespace-nowrap">{day(p.paidAt)}{p.mode === 'test' && <span className="ml-1.5 text-[0.65rem] font-bold text-warning">TEST</span>}</td>
              <td className="py-2.5 pr-3">{p.plan} · {p.period === 'month' ? 'monthly' : 'yearly'}</td>
              <td className="py-2.5 pr-3 whitespace-nowrap">{day(p.periodStart)} – {day(p.periodEnd)}</td>
              <td className="py-2.5 pr-3 tabular-nums">{rupees(p.amount)}</td>
              <td className="py-2.5 pr-3 font-mono text-xs text-ink-soft">{p.paymentId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
