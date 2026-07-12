import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Sparkles, FileText, Target, Globe, FileInput, ChevronRight, Loader2 } from 'lucide-react';
import { inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, StatusBadge, Badge, Tabs, Pacing, MetricCard, EmptyState } from '../../ui';

// Funnel steps derived from the campaign's REAL kpis (zeros until data flows in).
const campaignFunnel = (c) => {
  const k = c.kpis || {};
  return [
    { stage: 'Impressions', value: k.impressions || 0, color: 'var(--dv-6)' },
    { stage: 'Clicks', value: k.clicks || 0, color: 'var(--dv-5)' },
    { stage: 'Leads', value: k.leads || 0, color: 'var(--dv-3)' },
    { stage: 'Qualified', value: k.qualified || 0, color: 'var(--dv-2)' },
    { stage: 'Customers', value: k.customers || 0, color: 'var(--dv-1)' },
  ];
};

const TABS = [
  { id: 'overview', label: 'Overview' }, { id: 'plan', label: 'Plan' },
  { id: 'content', label: 'Content' }, { id: 'ads', label: 'Ads' },
  { id: 'conversion', label: 'Conversion' }, { id: 'leads', label: 'Leads' },
  { id: 'analytics', label: 'Analytics' }, { id: 'activity', label: 'Activity' },
];

function Funnel({ steps }) {
  const max = steps[0]?.value || 1;
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => {
        const pct = (s.value / max) * 100;
        const conv = i > 0 && steps[i - 1].value ? ((s.value / steps[i - 1].value) * 100).toFixed(1) : null;
        return (
          <div key={s.stage}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-semibold text-ink">{s.stage}</span>
              <span className="tabular-nums text-ink-soft">
                {num(s.value)}{conv && <span className="text-ink-faint ml-2 text-xs">{conv}% ↓</span>}
              </span>
            </div>
            <div className="h-7 rounded-md bg-surface2 overflow-hidden">
              <div className="h-full rounded-md flex items-center" style={{ width: `${Math.max(pct, 4)}%`, background: s.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConnectedObjects({ c }) {
  const items = [
    { icon: FileText, label: 'Content items', count: c.counts.content, to: '/app/calendar' },
    { icon: Target, label: 'Ads', count: c.counts.ads, to: '/app/ads' },
    { icon: Globe, label: 'Landing pages', count: c.counts.landingPages, to: '/app/landing' },
    { icon: FileInput, label: 'Lead forms', count: c.counts.forms, to: '/app/forms' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <Link key={it.label} to={it.to} className="flex items-center gap-3 p-3 rounded-lg border border-line hover:border-coral hover:bg-surface2/50 transition">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-coral-soft text-coral-ink"><it.icon className="w-[18px] h-[18px]" /></span>
          <span className="flex-1"><span className="block text-lg font-extrabold tabular-nums leading-none">{it.count}</span><span className="text-xs text-ink-faint">{it.label}</span></span>
          <ChevronRight className="w-4 h-4 text-ink-faint" />
        </Link>
      ))}
    </div>
  );
}

export default function CampaignWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const { data: c, isLoading, isError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => effyApi.getCampaign(id),
  });

  if (isLoading) {
    return <Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading campaign…</Card>;
  }
  if (isError || !c) {
    return <EmptyState icon="🔍" title="Campaign not found" body="It may have been archived or belongs to another workspace." action={<Button onClick={() => navigate('/app/campaigns')}>Back to campaigns</Button>} />;
  }

  const k = c.kpis;

  return (
    <div>
      <button onClick={() => navigate('/app/campaigns')} className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink mb-3">
        <ArrowLeft className="w-4 h-4" /> Campaigns
      </button>

      <PageHeader
        title={c.name}
        subtitle={`${c.objective} · ${c.start} → ${c.end} · ${c.owner}`}
        actions={
          <>
            <StatusBadge status={c.status} />
            <Button variant="secondary">Edit</Button>
            <Button variant="spark"><Sparkles className="w-4 h-4" /> Ask Effy</Button>
          </>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Leads" value={num(k.leads)} hint={`${num(k.qualified)} qualified`} />
            <MetricCard label="Revenue" value={inr(k.revenue)} hint={`${num(k.customers)} customers`} />
            <MetricCard label="CPL" value={k.cpl ? inr(k.cpl, { compact: false }) : '—'} hint={k.ctr != null ? `CTR ${k.ctr}%` : 'CTR —'} />
            <MetricCard label="ROAS" value={k.roas ? `${k.roas}×` : '—'} hint="blended" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-5">
              <h3 className="font-bold text-ink mb-4">Funnel — strategy to revenue</h3>
              <Funnel steps={campaignFunnel(c)} />
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="font-bold text-ink mb-3">Budget</h3>
                <Pacing value={c.spent} max={c.budget} tone={c.spent / c.budget > 0.9 ? 'warning' : 'coral'} />
                <div className="flex justify-between text-sm mt-2 tabular-nums">
                  <span className="text-ink-soft">{inr(c.spent)} spent</span>
                  <span className="text-ink-faint">of {inr(c.budget)}</span>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-5">
            <h3 className="font-bold text-ink mb-3">Connected objects</h3>
            <ConnectedObjects c={c} />
          </Card>
        </div>
      )}

      {tab !== 'overview' && (
        <EmptyState
          icon="✦"
          title={`${TABS.find((t) => t.id === tab).label} — next in the build`}
          body="The campaign object graph is wired; this tab's detailed view lands as we build the corresponding module."
        />
      )}
    </div>
  );
}
