import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageHeader, Card, Button, Badge } from '../../ui';

const inr = (n) => '₹' + n.toLocaleString('en-IN');

// In-app plans view. Mirrors the public pricing; actions route to Billing.
const PLANS = [
  { id: 'creative', name: 'Creative', monthly: 0, tagline: 'The creative studio, free.',
    highlights: ['1 workspace', '150 credits / mo', 'AI Studio, Characters, Product Shots', 'Ad Films room', 'No Performance Marketing'] },
  { id: 'growth', name: 'Growth', monthly: 1999, tagline: 'For solo businesses getting consistent.',
    highlights: ['Performance Marketing (core)', 'Calendar, scheduling & inbox', 'Organic analytics', '2 seats', '500 credits / mo'] },
  { id: 'pro', name: 'Pro', monthly: 4999, popular: true, tagline: 'For growing businesses & freelancers.',
    highlights: ['3 workspaces · 5 seats', '1,500 credits / mo', 'Ads dashboard (Meta + Google)', 'Landing pages, forms & pipeline', 'Full analytics — leads, revenue, ROAS'] },
  { id: 'agency', name: 'Agency', monthly: 12999, tagline: 'For agencies & multi-brand teams.',
    highlights: ['15 workspaces · 20 seats', '6,000 credits / mo', 'White-label reports + client portals', 'API access + advanced roles', 'Priority support'] },
];

export default function PricingApp() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="Pricing" subtitle="One credit currency for every AI action. Upgrade or top up anytime — no per-feature walls." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 items-start">
        {PLANS.map((p) => (
          <Card key={p.id} className={`p-5 ${p.popular ? 'ring-2 ring-coral' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-semibold text-ink">{p.name}</h3>
              {p.popular && <Badge tone="coral">Popular</Badge>}
            </div>
            <p className="text-xs text-ink-faint mb-3 min-h-[32px]">{p.tagline}</p>
            <div className="mb-4">
              <span className="font-display text-2xl font-bold text-ink">{p.monthly === 0 ? 'Free' : inr(p.monthly)}</span>
              {p.monthly > 0 && <span className="text-sm text-ink-faint"> /mo</span>}
            </div>
            <ul className="space-y-2 mb-5">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-ink-soft">
                  <Check className="w-4 h-4 text-coral-ink shrink-0 mt-0.5" /> {h}
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={p.popular ? 'primary' : 'secondary'} onClick={() => navigate('/app/billing')}>
              {p.monthly === 0 ? 'Current plan' : 'Choose ' + p.name}
            </Button>
          </Card>
        ))}
      </div>
      <p className="text-center text-xs text-ink-faint mt-6">Metered by credits, not per-feature caps · cancel anytime · manage in <button onClick={() => navigate('/app/billing')} className="font-bold text-coral-ink bg-transparent">Billing</button>.</p>
    </div>
  );
}
