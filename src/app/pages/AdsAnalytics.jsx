import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Plug, FlaskConical, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { PageHeader, Card, Button, Badge, MetricCard } from '../../ui';
import { cn } from '../../lib/cn';

// Paid performance, cut the ways a marketer reads it. The same adapter feeds the
// Advertise dashboard, so this page works on sandbox data now and on a live ad
// account later with no new code — and says which it is (launch plan 5.3, G34).
const CUTS = [
  { id: 'byPlatform', label: 'Platform' },
  { id: 'byObjective', label: 'Objective' },
  { id: 'byFormat', label: 'Creative format' },
  { id: 'byAudience', label: 'Audience' },
];

export default function AdsAnalytics() {
  const { workspace } = useWorkspace();
  const [cut, setCut] = useState('byPlatform');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ads-analytics', workspace.id],
    queryFn: () => effyApi.adsAnalytics(workspace.id),
  });

  const header = (
    <PageHeader
      title="Advertising Analytics"
      subtitle={`Paid performance for ${workspace.name}`}
      actions={data?.mode === 'sandbox' && (
        <Badge tone="warning" className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5" /> Sandbox data — not live spend
        </Badge>
      )}
    />
  );

  if (isLoading) {
    return <div>{header}<Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Reading your ad accounts…</Card></div>;
  }
  if (isError) return <div>{header}<p role="alert" className="text-sm text-error">{error.message}</p></div>;

  // Nothing connected (mock provider) → the honest connect state, never sample data.
  if (data.mode !== 'sandbox' && data.mode !== 'live') {
    return (
      <div>
        {header}
        <div className="text-center py-20 px-6 bg-surface rounded-2xl shadow-e1 flex flex-col items-center gap-2.5">
          <div className="grid place-items-center w-16 h-16 rounded-2xl bg-coral-tint text-3xl mb-1.5">📈</div>
          <h4 className="font-display text-xl font-semibold tracking-tight text-ink">Connect an ad account</h4>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">
            Spend, CPM, CTR, CPL and ROAS — cut by platform, objective, creative format and audience — appear here once Meta Ads or Google Ads is connected. Real numbers only.
          </p>
          <Link to="/app/integrations" className="mt-3"><Button><Plug className="w-4 h-4" /> Connect ad accounts</Button></Link>
        </div>
      </div>
    );
  }

  const t = data.totals;
  const rows = data[cut] || [];
  const top = Math.max(...rows.map((r) => r.spend), 1);
  const biggest = Math.max(...data.funnel.map((f) => f.value), 1);

  return (
    <div>
      {header}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard label="Spend" value={inr(t.spend)} hint={`${Math.round(t.pacing * 100)}% of ${inr(t.budget)} budget`} />
        <MetricCard label="Cost per lead" value={inr(t.cpl, { compact: false })} hint={`${num(t.leads)} leads`} />
        <MetricCard label="ROAS" value={`${t.roas}×`} hint="blended, active campaigns" />
        <MetricCard label="CTR" value={`${t.ctr}%`} hint={`CPM ${inr(t.cpm, { compact: false })} · CPC ${inr(t.cpc, { compact: false })}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        <Card className="p-5 lg:col-span-2" role="region" aria-label="Spend and cost per lead">
          <h3 className="font-bold text-ink mb-4">Spend and cost per lead — last 8 weeks</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.series} margin={{ left: -8, right: 8 }}>
              <defs>
                <linearGradient id="anlSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e84a33" stopOpacity={0.3} /><stop offset="100%" stopColor="#e84a33" stopOpacity={0} /></linearGradient>
                <linearGradient id="anlCpl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} /><stop offset="100%" stopColor="#14b8a6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="#ece2d6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} width={54} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} formatter={(v, n) => [inr(v), n === 'cpl' ? 'cost per lead' : n]} />
              <Area type="monotone" dataKey="spend" stroke="#e84a33" strokeWidth={2.5} fill="url(#anlSpend)" />
              <Area type="monotone" dataKey="cpl" stroke="#14b8a6" strokeWidth={2.5} fill="url(#anlCpl)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5" role="region" aria-label="Impressions to leads">
          <h3 className="font-bold text-ink mb-4">Impressions to leads</h3>
          <ul className="space-y-3">
            {data.funnel.map((f) => (
              <li key={f.key}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{f.label}</span>
                  <span className="tabular-nums text-ink-soft">{num(f.value)}</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-surface2 overflow-hidden">
                  <div className="h-full rounded-full bg-coral" style={{ width: `${Math.max((f.value / biggest) * 100, 1.5)}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-faint mt-4">
            {t.ctr}% of impressions click; {((t.leads / Math.max(t.clicks, 1)) * 100).toFixed(1)}% of clicks become leads.
          </p>
        </Card>
      </div>

      {data.bestCampaign && (
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <CampaignNote tone="good" title="Cheapest leads" c={data.bestCampaign} />
          {data.worstCampaign && <CampaignNote tone="bad" title="Most expensive leads" c={data.worstCampaign} />}
        </div>
      )}

      <Card className="overflow-hidden" role="region" aria-label="Where the money went">
        <div className="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-ink">Where the money went</h3>
            <p className="text-xs text-ink-soft mt-0.5">Active campaigns only — paused spend is left out of every cut.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CUTS.map((c) => (
              <button key={c.id} onClick={() => setCut(c.id)} aria-pressed={cut === c.id}
                className={cn('px-3.5 py-1.5 rounded-full text-[0.8rem] font-semibold transition',
                  cut === c.id ? 'bg-rail-active text-rail-active-ink' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">
              {[CUTS.find((c) => c.id === cut).label, 'Spend', 'Leads', 'CPL',
                cut === 'byFormat' ? 'CTR' : cut === 'byAudience' ? 'Size' : 'ROAS'].map((h) => (
                  <th key={h} className="font-semibold px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{r.label}</div>
                    <div className="mt-1.5 h-1.5 w-36 max-w-full rounded-full bg-surface2 overflow-hidden">
                      <div className="h-full rounded-full bg-coral" style={{ width: `${Math.round((r.spend / top) * 100)}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{inr(r.spend)}</td>
                  <td className="px-4 py-3 tabular-nums">{num(r.leads)}</td>
                  <td className="px-4 py-3 tabular-nums">{inr(r.cpl, { compact: false })}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-soft">
                    {cut === 'byFormat' ? `${r.ctr}%` : cut === 'byAudience' ? num(r.size) : `${r.roas}×`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CampaignNote({ tone, title, c }) {
  const Icon = tone === 'good' ? TrendingUp : TrendingDown;
  return (
    <Card className="p-5 flex items-start gap-3" role="region" aria-label={title}>
      <span className={cn('grid place-items-center w-9 h-9 rounded-xl shrink-0',
        tone === 'good' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning')}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[0.7rem] font-bold text-ink-faint uppercase tracking-[0.08em]">{title}</div>
        <div className="font-semibold text-ink truncate">{c.name}</div>
        <p className="text-sm text-ink-soft mt-0.5">
          {inr(c.cpl, { compact: false })} per lead · {c.roas}× ROAS on {inr(c.spend)}
        </p>
      </div>
    </Card>
  );
}
