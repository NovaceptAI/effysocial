import React from 'react';
import { CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, PageHeader, Button, Badge } from '../../ui';

// REAL plan from the org record. Payments/usage metering are future slices —
// no fabricated invoices or usage numbers.
export default function Billing() {
  const { org } = useWorkspace();
  return (
    <div>
      <PageHeader title="Billing" subtitle="Your plan and payments" />
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-ink">Current plan</h3>
            <Badge tone="new"><Sparkles className="w-3 h-3" /> {org?.plan || 'Trial'}</Badge>
          </div>
          <p className="text-sm text-ink-soft leading-relaxed mb-5">
            You're on the <strong>{org?.plan || 'Trial'}</strong> plan with full access while we're in early access.
            Paid plans (Plus · Pro · Business) launch with metered AI usage — see what's coming on the pricing page.
          </p>
          <a href="/pricing" target="_blank" rel="noreferrer">
            <Button variant="secondary">View plans &amp; pricing <ArrowRight className="w-4 h-4" /></Button>
          </a>
        </Card>
        <Card className="p-6 h-max">
          <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-coral-ink" /> Invoices</h3>
          <p className="text-sm text-ink-soft">No invoices yet — billing begins when paid plans go live (Razorpay &amp; Stripe).</p>
        </Card>
      </div>
    </div>
  );
}
