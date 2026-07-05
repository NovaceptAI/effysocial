import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Loader2, Plug } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, MetricCard, Badge, EmptyState } from '../../ui';

const STAGE_COLORS = {
  new: '#a89d93', contacted: '#e8a23d', qualified: '#3d8de8', appointment: '#8a5ce8',
  proposal: '#e85c9e', won: '#2f9e63', lost: '#c94433',
};
const QUALITY_TONES = { hot: 'error', warm: 'warning', cold: 'info' };

function Breakdown({ title, rows, labelKey, empty }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <Card className="p-5">
      <h3 className="font-bold text-ink mb-4">{title}</h3>
      {!rows.length ? <p className="text-sm text-ink-faint">{empty}</p> : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r[labelKey]}>
              <div className="flex items-baseline justify-between text-sm mb-1">
                <span className="font-semibold text-ink capitalize">{r[labelKey]}</span>
                <span className="text-ink-faint tabular-nums">{num(r.count)} · {r.qualified} qualified</span>
              </div>
              <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                <div className="h-full rounded-full bg-coral" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function LeadAnalytics() {
  const { workspace } = useWorkspace();
  const { data: a, isLoading } = useQuery({
    queryKey: ['leadAnalytics', workspace?.id],
    queryFn: () => effyApi.leadAnalytics(workspace.id),
    enabled: !!workspace,
  });

  if (isLoading || !a) {
    return (<><PageHeader title="Lead Analytics" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading lead analytics…</Card></>);
  }
  const k = a.kpis;

  return (
    <div>
      <PageHeader
        title="Lead Analytics"
        subtitle="Volume, quality and conversion — computed live from your pipeline."
        actions={a.spendProvider === 'mock' && (
          <Badge tone="warning"><Plug className="w-3 h-3" /> Cost/qualified uses sample ad spend (Phase 3)</Badge>
        )}
      />

      {!k.total ? (
        <EmptyState icon="📊" title="No leads yet" body="Once forms, landing pages and conversations start generating leads, this dashboard fills in automatically." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <MetricCard label="Total leads" value={num(k.total)} hint="all time" />
            <MetricCard label="Qualified" value={num(k.qualified)} hint={`${k.qualificationRate}% qualification rate`} />
            <MetricCard label="Pipeline value" value={inr(k.pipelineValue)} hint={`${num(k.won)} won`} />
            <MetricCard label="Cost / qualified lead" value={inr(k.costPerQualified, { compact: false })} hint="sample spend" />
          </div>

          <Card className="p-5 mb-5">
            <h3 className="font-bold text-ink mb-4">Stage funnel</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={a.funnel} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="#ece2d6" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {a.funnel.map((f) => <Cell key={f.stage} fill={STAGE_COLORS[f.stage] || '#e84a33'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <Breakdown title="Leads by source" rows={a.bySource} labelKey="source" empty="No sources yet." />
            <Breakdown title="Leads by campaign" rows={a.byCampaign} labelKey="campaign" empty="No campaign attribution yet." />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-bold text-ink mb-4">Lead quality</h3>
              <div className="flex flex-wrap gap-3">
                {a.quality.map((q) => (
                  <div key={q.quality} className="flex-1 min-w-[110px] rounded-xl bg-surface2/60 p-4 text-center">
                    <Badge tone={QUALITY_TONES[q.quality] || 'default'} className="capitalize">{q.quality}</Badge>
                    <p className="mt-2 text-2xl font-extrabold text-ink tabular-nums">{num(q.count)}</p>
                  </div>
                ))}
              </div>
              {a.outcomes.length > 0 && (
                <>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint mt-5 mb-2">Sales outcomes marked</h4>
                  <div className="flex flex-wrap gap-2">
                    {a.outcomes.map((o) => (
                      <Badge key={o.outcome} className="capitalize">{o.outcome.replaceAll('_', ' ')} · {o.count}</Badge>
                    ))}
                  </div>
                </>
              )}
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-ink mb-4">Lost reasons</h3>
              {!a.lostReasons.length ? <p className="text-sm text-ink-faint">No lost leads with a reason recorded.</p> : (
                <ul className="space-y-2">
                  {a.lostReasons.map((r) => (
                    <li key={r.reason} className="flex items-center justify-between rounded-lg bg-surface2/60 px-3.5 py-2.5 text-sm">
                      <span className="font-semibold text-ink">{r.reason}</span>
                      <span className="text-ink-faint tabular-nums">{num(r.count)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
