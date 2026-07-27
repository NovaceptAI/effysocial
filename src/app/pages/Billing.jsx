import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';

// Real plan + credits balance from the backend ledger (see aiusage.py
// credits_used_this_month / credits_allowance). Payment processing itself is
// a future slice — no fabricated invoices.
export default function Billing() {
  const { workspace, org } = useWorkspace();
  const { data } = useQuery({
    queryKey: ['billing-credits', workspace?.id],
    queryFn: () => effyApi.billingCredits(workspace.id),
    enabled: !!workspace,
  });
  const plan = data?.plan || org?.plan || 'Trial';
  const used = data?.used ?? 0;
  const allowance = data?.allowance ?? 0;
  const pct = allowance > 0 ? Math.min(100, Math.round((used / allowance) * 100)) : 0;

  return (
    <div>
      <PageHeader title="Billing" subtitle="Your plan and credits" />
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-ink">Current plan</h3>
            <Badge tone="new"><Sparkles className="w-3 h-3" /> {plan}</Badge>
          </div>
          <p className="text-sm text-ink-soft leading-relaxed mb-5">
            You're on the <strong>{plan}</strong> plan.
            {data?.hasPerformanceMarketing === false
              ? ' Performance Marketing isn’t included on this plan yet — upgrade any time you’re ready to publish, run ads or track leads.'
              : ' Performance Marketing is included on this plan.'}
          </p>
          <a href="/pricing" target="_blank" rel="noreferrer">
            <Button variant="secondary">View plans &amp; pricing <ArrowRight className="w-4 h-4" /></Button>
          </a>
        </Card>
        <Card className="p-6 h-max">
          <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-coral-ink" /> Credits this month</h3>
          <div className="flex items-end gap-1.5 mb-2">
            <span className="text-2xl font-extrabold tracking-tightest tabular-nums text-ink">{used}</span>
            <span className="text-sm text-ink-faint mb-0.5">/ {allowance}</span>
          </div>
          <div className="h-2 rounded-full bg-surface2 overflow-hidden mb-3">
            <div className="h-full bg-coral-btn rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-ink-faint leading-relaxed">
            One credit covers a small AI action (an image, part of a Veo render, TTS characters). Resets on the 1st.
          </p>
        </Card>
        <Card className="lg:col-span-3 p-6">
          <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-coral-ink" /> Invoices</h3>
          <p className="text-sm text-ink-soft">No invoices yet — billing begins when paid plans go live (Razorpay &amp; Stripe).</p>
        </Card>
      </div>
    </div>
  );
}
