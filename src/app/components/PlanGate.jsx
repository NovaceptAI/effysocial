import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { FEATURES } from '../plans';
import { Button, Card } from '../../ui';

// Shown in place of a page the organisation's plan doesn't include (G22).
export default function PlanGate({ feature, planInfo }) {
  const needed = FEATURES[feature];
  const trialEnded = planInfo?.trial?.expired;
  return (
    <Card role="region" aria-label="Upgrade needed" className="max-w-xl mx-auto mt-10 p-8 text-center">
      <span className="grid place-items-center w-12 h-12 rounded-2xl bg-coral-tint text-coral-ink mx-auto mb-4"><Lock className="w-6 h-6" /></span>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{needed.label} {feature === 'marketing' ? 'is' : 'are'} on the {needed.plan} plan</h1>
      <p className="text-sm text-ink-soft mt-2 mb-6">
        {trialEnded
          ? 'Your free trial has ended, so your organisation is on the free Creative plan. AI Studio, Ad Films, Product Shots and Brand Brain are still yours.'
          : `Your organisation is on ${planInfo?.plan}. Upgrade to ${needed.plan} or above to use this.`}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/app/billing"><Button>See your plan <ArrowRight className="w-4 h-4" /></Button></Link>
        <Link to="/app/studio"><Button variant="secondary">Go to AI Studio</Button></Link>
      </div>
    </Card>
  );
}
