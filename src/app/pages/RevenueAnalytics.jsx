import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plug, IndianRupee } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, MetricCard, Badge, EmptyState } from '../../ui';

function RevenueBreakdown({ title, rows, labelKey, empty }) {
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  return (
    <Card className="p-5">
      <h3 className="font-bold text-ink mb-4">{title}</h3>
      {!rows.length ? <p className="text-sm text-ink-faint">{empty}</p> : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r[labelKey]}>
              <div className="flex items-baseline justify-between text-sm mb-1">
                <span className="font-semibold text-ink capitalize">{r[labelKey]}</span>
                <span className="text-ink-faint tabular-nums">{inr(r.revenue)} · {r.customers} customer{r.customers === 1 ? '' : 's'}</span>
              </div>
              <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                <div className="h-full rounded-full bg-success" style={{ width: `${(r.revenue / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function RevenueAnalytics() {
  const { workspace } = useWorkspace();
  const { data: a, isLoading } = useQuery({
    queryKey: ['revenueAnalytics', workspace?.id],
    queryFn: () => effyApi.revenueAnalytics(workspace.id),
    enabled: !!workspace,
  });

  if (isLoading || !a) {
    return (<><PageHeader title="Revenue Analytics" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading revenue analytics…</Card></>);
  }
  const k = a.kpis;

  return (
    <div>
      <PageHeader
        title="Revenue Analytics"
        subtitle={`Marketing → money, closed-loop. Attribution model: ${a.attributionModel}.`}
        actions={a.spendProvider === 'mock' && (
          <Badge tone="warning"><Plug className="w-3 h-3" /> CAC/ROAS use sample ad spend (Phase 3)</Badge>
        )}
      />

      {!k.customers ? (
        <EmptyState icon="💰" title="No attributed revenue yet" body="Mark leads as Won (with a deal value) or record a purchase-completed outcome on the lead detail page — revenue, CAC and ROAS light up here." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <MetricCard label="Attributed revenue" value={inr(k.revenue)} hint={`${num(k.customers)} customers`} />
            <MetricCard label="Avg deal size" value={inr(k.avgDeal)} hint="per customer" />
            <MetricCard label="Ad spend" value={inr(k.spend)} hint="sample (Phase 3: live)" />
            <MetricCard label="CAC" value={inr(k.cac, { compact: false })} hint="spend ÷ customers" />
            <MetricCard label="ROAS" value={`${k.roas}×`} hint="revenue ÷ spend" />
            <Card className="p-4 flex flex-col justify-center items-center text-center">
              <IndianRupee className="w-5 h-5 text-success mb-1" />
              <p className="text-xs text-ink-faint">Every ₹1 of spend returned</p>
              <p className="text-lg font-extrabold text-ink">{inr(Math.round(k.roas * 100) / 100 * 1, { compact: false })}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueBreakdown title="Revenue by channel" rows={a.byChannel} labelKey="channel" empty="No channel data yet." />
            <RevenueBreakdown title="Revenue by campaign" rows={a.byCampaign} labelKey="campaign" empty="No campaign attribution yet." />
          </div>
        </>
      )}
    </div>
  );
}
