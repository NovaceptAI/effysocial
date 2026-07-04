import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChevronRight, TrendingUp, TrendingDown, Loader2, Plug } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, MetricCard, Pacing, StatusBadge } from '../../ui';
import { cn } from '../../lib/cn';

const PLATFORM = {
  meta: { label: 'Meta', cls: 'bg-info-soft text-info' },
  google: { label: 'Google', cls: 'bg-warning-soft text-warning' },
};

function CampaignRow({ c }) {
  const [open, setOpen] = useState(false);
  const paused = c.status === 'paused';
  return (
    <>
      <tr onClick={() => setOpen((v) => !v)} className={cn('border-b border-line/70 cursor-pointer hover:bg-surface2/60', paused && 'opacity-55')}>
        <td className="px-4 py-3">
          <span className="flex items-center gap-2">
            <ChevronRight className={cn('w-4 h-4 text-ink-faint transition-transform', open && 'rotate-90')} />
            <span className="font-semibold text-ink">{c.name}</span>
          </span>
          <span className="block text-xs text-ink-faint ml-6">{c.objective}</span>
        </td>
        <td className="px-4 py-3"><span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', PLATFORM[c.platform]?.cls)}>{PLATFORM[c.platform]?.label}</span></td>
        <td className="px-4 py-3"><StatusBadge status={c.status === 'active' ? 'live' : c.status} /></td>
        <td className="px-4 py-3 w-36">
          <Pacing value={c.spent} max={c.budget} tone={c.pacing > 0.9 ? 'warning' : 'coral'} />
          <span className="block text-xs text-ink-faint mt-1 tabular-nums">{inr(c.spent)} / {inr(c.budget)}</span>
        </td>
        <td className="px-4 py-3 tabular-nums">{num(c.leads)}</td>
        <td className="px-4 py-3 tabular-nums">{inr(c.cpl, { compact: false })}</td>
        <td className="px-4 py-3 tabular-nums font-semibold">{c.roas}×</td>
        <td className="px-4 py-3">{c.trend === 'up' ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-error" />}</td>
      </tr>
      {open && c.adsets.map((as) => (
        <React.Fragment key={as.id}>
          <tr className="bg-surface2/40 border-b border-line/50 text-sm">
            <td className="px-4 py-2 pl-12 font-semibold text-ink-soft" colSpan={3}>↳ {as.name}</td>
            <td className="px-4 py-2 text-xs tabular-nums text-ink-soft">{inr(as.spend)}</td>
            <td className="px-4 py-2 tabular-nums text-ink-soft">{num(as.leads)}</td>
            <td className="px-4 py-2 tabular-nums text-ink-soft">{inr(as.cpl, { compact: false })}</td>
            <td colSpan={2} />
          </tr>
          {as.ads.map((ad) => (
            <tr key={ad.id} className="bg-surface2/20 border-b border-line/40 text-xs">
              <td className="px-4 py-1.5 pl-20 text-ink-soft" colSpan={3}>
                {ad.name} <span className="text-ink-faint">· {ad.format}</span>
                {ad.fatigue === 'high' && <Badge tone="warning" className="ml-2">fatigue</Badge>}
              </td>
              <td className="px-4 py-1.5 text-ink-faint">CTR {ad.ctr}%</td>
              <td />
              <td className="px-4 py-1.5 tabular-nums text-ink-faint">{inr(ad.cpl, { compact: false })}</td>
              <td colSpan={2} />
            </tr>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

export default function AdsDashboard() {
  const { workspace } = useWorkspace();
  const { data, isLoading } = useQuery({
    queryKey: ['ads', workspace?.id],
    queryFn: () => fetch(`/api/effy/ads/dashboard?workspace=${workspace.id}`, { credentials: 'include' }).then((r) => r.json()),
    enabled: !!workspace,
  });

  if (isLoading || !data) {
    return (<><PageHeader title="Advertising" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading ad performance…</Card></>);
  }
  const t = data.totals;

  return (
    <div>
      <PageHeader
        title="Advertising"
        subtitle="Cross-platform paid performance — campaigns, ad sets and ads."
        actions={data.provider === 'mock' && (
          <Badge tone="warning"><Plug className="w-3 h-3" /> Sample data — connect Meta / Google ad accounts (Phase 3)</Badge>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard label="Spend" value={inr(t.spend)} hint={`pacing ${Math.round(t.pacing * 100)}% of ${inr(t.budget)}`} />
        <MetricCard label="Leads" value={num(t.leads)} hint={`CPL ${inr(t.cpl, { compact: false })}`} />
        <MetricCard label="ROAS" value={`${t.roas}×`} hint="blended, active campaigns" />
        <MetricCard label="CTR" value={`${t.ctr}%`} hint={`CPM ${inr(t.cpm, { compact: false })} · CPC ${inr(t.cpc, { compact: false })}`} />
      </div>

      <Card className="p-5 mb-4">
        <h3 className="font-bold text-ink mb-4">Spend & leads — last 8 weeks</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.series} margin={{ left: -8, right: 8 }}>
            <defs>
              <linearGradient id="adSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e84a33" stopOpacity={0.3} /><stop offset="100%" stopColor="#e84a33" stopOpacity={0} /></linearGradient>
              <linearGradient id="adLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} /><stop offset="100%" stopColor="#14b8a6" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid stroke="#ece2d6" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} width={54} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} formatter={(v, n) => [n === 'leads' ? num(v) : inr(v), n]} />
            <Area type="monotone" dataKey="spend" stroke="#e84a33" strokeWidth={2.5} fill="url(#adSpend)" />
            <Area type="monotone" dataKey="leads" stroke="#14b8a6" strokeWidth={2.5} fill="url(#adLeads)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-faint border-b border-line">
            {['Campaign (click to drill down)', 'Platform', 'Status', 'Pacing', 'Leads', 'CPL', 'ROAS', ''].map((h) => <th key={h} className="font-semibold px-4 py-3 whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {data.campaigns.map((c) => <CampaignRow key={c.id} c={c} />)}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
