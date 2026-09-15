import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ArrowRight, Sparkles, Zap, Check, Lock, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { FEATURES, PLAN_SUMMARY } from '../plans';
import { Card, PageHeader, Button, Badge } from '../../ui';

// The organisation's plan, what it includes, and usage against its limits (G22).
// Online checkout arrives with the payment provider (launch plan 6.6); until then a
// platform admin changes plans. Credits warn at 80% and 100% but don't block work.
function Meter({ label, used, limit, hint }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const tone = used >= limit ? 'bg-error' : pct >= 80 ? 'bg-warning' : 'bg-coral-btn';
  return (
    <div role="group" aria-label={label}>
      <div className="flex items-end justify-between mb-1.5">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="text-sm tabular-nums text-ink-soft"><strong className="text-ink">{used.toLocaleString('en-IN')}</strong> / {limit.toLocaleString('en-IN')}</span>
      </div>
      <div className="h-2 rounded-full bg-surface2 overflow-hidden"><div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} /></div>
      {hint && <p className="text-xs text-ink-faint mt-1.5">{hint}</p>}
    </div>
  );
}

export default function Billing() {
  const { workspace, planInfo: bootInfo } = useWorkspace();
  const { data } = useQuery({
    queryKey: ['billing-credits', workspace?.id],
    queryFn: () => effyApi.billingCredits(workspace.id),
    enabled: !!workspace,
  });
  const info = data?.planInfo || bootInfo;
  if (!info) return <p className="text-sm text-ink-soft">Loading your plan…</p>;

  const trial = info.trial;
  const creditHint = data?.warning === 'over'
    ? 'You’ve used this month’s allowance. Work isn’t blocked yet — upgrade for more. Credits reset on the 1st.'
    : data?.warning === 'near'
      ? 'You’re close to this month’s allowance. Credits reset on the 1st.'
      : 'One credit covers a small AI action: an image, part of a video render, voice-over characters. Resets on the 1st.';

  return (
    <div>
      <PageHeader title="Billing" subtitle="Your plan, what it includes and what you’ve used" />
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-ink">Current plan</h3>
            <Badge tone="new"><Sparkles className="w-3 h-3" /> {trial && !trial.expired ? 'Free trial' : info.plan}</Badge>
          </div>
          {trial && (
            <p role="status" className={`mb-4 text-sm rounded-lg px-3.5 py-2.5 flex gap-2 ${trial.expired ? 'bg-warning-soft text-warning' : 'bg-coral-tint text-ink'}`}>
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              {trial.expired
                ? 'Your free trial has ended, so you’re on the free Creative plan. Your campaigns, leads and pages are kept — upgrade to use them again.'
                : `Your free trial includes everything in Pro and ends in ${trial.daysLeft} day${trial.daysLeft === 1 ? '' : 's'} (${new Date(trial.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}). After that you’ll be on the free Creative plan.`}
            </p>
          )}
          <ul className="space-y-2 mb-5" aria-label="What your plan includes">
            <li className="flex items-center gap-2 text-sm text-ink"><Check className="w-4 h-4 text-success" /> AI Studio, Ad Films, Product Shots and Brand Brain</li>
            {Object.entries(FEATURES).map(([key, f]) => (
              info.features.includes(key)
                ? <li key={key} className="flex items-center gap-2 text-sm text-ink"><Check className="w-4 h-4 text-success" /> {f.label}</li>
                : <li key={key} className="flex items-center gap-2 text-sm text-ink-faint"><Lock className="w-4 h-4" /> {f.label} — on {f.plan} and above</li>
            ))}
          </ul>
          <a href="/pricing" target="_blank" rel="noreferrer">
            <Button variant="secondary">Compare plans and prices <ArrowRight className="w-4 h-4" /></Button>
          </a>
          <p className="text-xs text-ink-faint mt-3">Online payment is coming soon. To change your plan now, contact the EffySocial team.</p>
        </Card>

        <Card className="p-6 space-y-5">
          <h3 className="font-bold text-ink flex items-center gap-2"><Zap className="w-4 h-4 text-coral-ink" /> Usage</h3>
          <Meter label="Credits this month" used={data?.used ?? 0} limit={info.limits.credits} hint={creditHint} />
          <Meter label="Workspaces" used={info.usage.workspaces} limit={info.limits.workspaces} />
          <Meter label="Seats" used={info.usage.seats} limit={info.limits.seats} hint="Members plus pending invites." />
        </Card>

        <Card className="lg:col-span-3 p-6">
          <h3 className="font-bold text-ink mb-3">Plans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]" aria-label="Plans">
              <thead>
                <tr className="text-left text-xs font-bold text-ink-faint uppercase tracking-wide border-b border-line">
                  {['Plan', 'Includes', 'Credits / mo', 'Workspaces', 'Seats'].map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {PLAN_SUMMARY.map((p) => (
                  <tr key={p.name} className={`border-b border-line/60 last:border-0 ${p.name === info.plan ? 'bg-coral-tint/50' : ''}`}>
                    <td className="py-2.5 pr-3 font-semibold text-ink whitespace-nowrap">{p.name}{p.name === info.plan && <span className="ml-2 text-xs text-coral-ink">yours</span>}</td>
                    <td className="py-2.5 pr-3 text-ink-soft">{p.includes}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{p.credits.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{p.workspaces}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{p.seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6">
          <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-coral-ink" /> Invoices</h3>
          <p className="text-sm text-ink-soft">No invoices yet. They’ll appear here once online payment is live.</p>
        </Card>
      </div>
    </div>
  );
}
