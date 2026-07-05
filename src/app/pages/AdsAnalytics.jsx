import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Loader2, Plug } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, MetricCard, Badge, Pacing, EmptyState } from '../../ui';

const PLATFORM = {
  meta: { label: 'Meta', color: '#3d8de8' },
  google: { label: 'Google', color: '#e8a23d' },
};

function byPlatform(campaigns) {
  const groups = {};
  for (const c of campaigns) {
    const g = groups[c.platform] ||= { platform: c.platform, spend: 0, budget: 0, impressions: 0, clicks: 0, leads: 0, revenue: 0, campaigns: 0 };
    g.spend += c.spent; g.budget += c.budget; g.impressions += c.impressions;
    g.clicks += c.clicks; g.leads += c.leads; g.revenue += Math.round(c.roas * c.spent);
    g.campaigns += 1;
  }
  return Object.values(groups).map((g) => ({
    ...g,
    ctr: +(g.clicks / Math.max(g.impressions, 1) * 100).toFixed(2),
    cpl: Math.floor(g.spend / Math.max(g.leads, 1)),
    roas: +(g.revenue / Math.max(g.spend, 1)).toFixed(1),
  })).sort((a, b) => b.spend - a.spend);
}

export default function AdsAnalytics() {
  const { workspace } = useWorkspace();
  const { data: a, isLoading } = useQuery({
    queryKey: ['adsDashboard', workspace?.id],
    queryFn: () => effyApi.adsDashboard(workspace.id),
    enabled: !!workspace,
  });

  if (isLoading || !a) {
    return (<><PageHeader title="Ads Analytics" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading ads analytics…</Card></>);
  }

  const t = a.totals;
  const channels = byPlatform(a.campaigns);
  const active = a.campaigns.filter((c) => c.status === 'active');

  return (
    <div>
      <PageHeader
        title="Ads Analytics"
        subtitle="Channel comparison and spend pacing across every ad account."
        actions={a.provider === 'mock' && (
          <Badge tone="warning"><Plug className="w-3 h-3" /> Sample data — connect ad accounts (Phase 3)</Badge>
        )}
      />

      {!a.campaigns.length ? (
        <EmptyState icon="📣" title="No campaigns yet" body="Once ad campaigns run, channel comparison and pacing show up here." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <MetricCard label="Total spend" value={inr(t.spend)} hint={`${Math.round(t.pacing * 100)}% of budget`} />
            <MetricCard label="Leads" value={num(t.leads)} hint={`${inr(t.cpl, { compact: false })} CPL`} />
            <MetricCard label="CTR" value={`${t.ctr}%`} hint={`${inr(t.cpc, { compact: false })} CPC`} />
            <MetricCard label="Blended ROAS" value={`${t.roas}×`} hint="revenue ÷ spend" />
          </div>

          {/* channel comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <Card className="p-5">
              <h3 className="font-bold text-ink mb-4">Spend & leads by channel</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={channels.map((g) => ({ ...g, name: PLATFORM[g.platform]?.label || g.platform }))} margin={{ left: -10, right: 8 }}>
                  <CartesianGrid stroke="#ece2d6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="spend" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => inr(v)} />
                  <YAxis yAxisId="leads" orientation="right" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} formatter={(v, k) => (k === 'spend' ? inr(v) : num(v))} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="spend" dataKey="spend" name="Spend" fill="#e84a33" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="leads" dataKey="leads" name="Leads" fill="#2f9e63" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5 overflow-x-auto">
              <h3 className="font-bold text-ink mb-4">Channel scorecard</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-faint border-b border-line">
                    <th className="pb-2 pr-3 font-semibold">Channel</th>
                    <th className="pb-2 pr-3 font-semibold">Spend</th>
                    <th className="pb-2 pr-3 font-semibold">Leads</th>
                    <th className="pb-2 pr-3 font-semibold">CPL</th>
                    <th className="pb-2 pr-3 font-semibold">CTR</th>
                    <th className="pb-2 font-semibold">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((g) => (
                    <tr key={g.platform} className="border-b border-line/60 last:border-0">
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-2 font-semibold text-ink">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: PLATFORM[g.platform]?.color || '#a89d93' }} />
                          {PLATFORM[g.platform]?.label || g.platform}
                        </span>
                        <span className="block text-xs text-ink-faint ml-[18px]">{g.campaigns} campaign{g.campaigns === 1 ? '' : 's'}</span>
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">{inr(g.spend)}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{num(g.leads)}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{inr(g.cpl, { compact: false })}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{g.ctr}%</td>
                      <td className="py-2.5 tabular-nums font-semibold">{g.roas}×</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* spend pacing */}
          <Card className="p-5">
            <h3 className="font-bold text-ink mb-1">Spend pacing</h3>
            <p className="text-xs text-ink-faint mb-4">Active campaigns — spend vs budget. Over 90% pacing is flagged.</p>
            <div className="space-y-4">
              {active.map((c) => (
                <div key={c.id}>
                  <div className="flex items-baseline justify-between text-sm mb-1">
                    <span className="font-semibold text-ink">{c.name} <span className="text-xs text-ink-faint font-normal">· {PLATFORM[c.platform]?.label || c.platform}</span></span>
                    <span className="text-ink-faint tabular-nums">{inr(c.spent)} / {inr(c.budget)} · {Math.round(c.pacing * 100)}%{c.pacing > 0.9 && <Badge tone="warning" className="ml-2">near cap</Badge>}</span>
                  </div>
                  <Pacing value={c.spent} max={c.budget} tone={c.pacing > 0.9 ? 'warning' : 'coral'} />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
