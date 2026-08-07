import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plug, FlaskConical, AlertTriangle, Pencil, Check, X, Play, Pause } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge, MetricCard, Pacing, StatusBadge } from '../../ui';
import { cn } from '../../lib/cn';

const PLATFORM = {
  meta: { label: 'Meta', cls: 'bg-info-soft text-info' },
  google: { label: 'Google', cls: 'bg-warning-soft text-warning' },
};

function BudgetCell({ row, ws, canWrite }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(row.budget);
  const save = useInvalidatingMutation(
    () => effyApi.adsSetBudget(row.id, ws.id, Number(value)),
    () => ['ads-budgets', ws?.id],
  );
  if (!canWrite) return <span className="tabular-nums">{inr(row.budget)}</span>;
  if (!editing) {
    return (
      <button onClick={() => { setValue(row.budget); setEditing(true); }} className="group flex items-center gap-1.5 tabular-nums hover:text-ink">
        {inr(row.budget)} <Pencil className="w-3 h-3 text-ink-faint opacity-0 group-hover:opacity-100" />
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <input
        type="number" value={value} onChange={(e) => setValue(e.target.value)} autoFocus
        className="w-24 px-2 py-1 rounded-lg border border-line bg-surface text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-coral/30"
      />
      <Button size="sm" variant="ghost" onClick={() => save.mutate(undefined, { onSuccess: () => setEditing(false) })} disabled={save.isPending}>
        {save.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" /></Button>
    </span>
  );
}

function StatusAction({ row, ws }) {
  const active = row.status === 'active';
  const toggle = useInvalidatingMutation(
    () => effyApi.adsSetStatus(row.id, ws.id, active ? 'paused' : 'active'),
    () => ['ads-budgets', ws?.id],
  );
  if (row.status === 'ended') return null;
  return (
    <Button size="sm" variant="ghost" onClick={() => toggle.mutate()} disabled={toggle.isPending}>
      {toggle.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : active ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Resume</>}
    </Button>
  );
}

export default function Budgets() {
  const { workspace } = useWorkspace();
  const { data, isLoading } = useQuery({
    queryKey: ['ads-budgets', workspace?.id],
    queryFn: () => effyApi.adsBudgets(workspace.id),
    enabled: !!workspace,
  });

  if (isLoading || !data) {
    return (<><PageHeader title="Budgets & Pacing" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading budgets…</Card></>);
  }

  // Nothing connected (mock provider) → honest connect state, no sample data.
  if (data.mode !== 'sandbox' && data.mode !== 'live') {
    return (
      <div>
        <PageHeader title="Budgets & Pacing" subtitle="Monthly budgets, spend pacing and cap alerts per campaign." />
        <div className="text-center py-20 px-6 bg-surface rounded-2xl shadow-e1 flex flex-col items-center gap-2.5">
          <div className="grid place-items-center w-16 h-16 rounded-2xl bg-coral-tint text-3xl mb-1.5">💰</div>
          <h4 className="font-display text-xl font-semibold tracking-tight text-ink">Connect an ad account</h4>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">Link Meta Ads or Google Ads to track budget pacing, get near-cap alerts and adjust budgets without leaving EffySocial.</p>
          <a href="/app/integrations" className="mt-3"><Button><Plug className="w-4 h-4" /> Connect ad accounts</Button></a>
        </div>
      </div>
    );
  }

  const t = data.totals;
  const canWrite = data.mode === 'sandbox' || data.mode === 'live';
  const nearCap = data.budgets.filter((b) => b.nearCap);
  const under = data.budgets.filter((b) => b.underPacing);

  return (
    <div>
      <PageHeader
        title="Budgets & Pacing"
        subtitle="Monthly budgets, spend pacing and cap alerts per campaign."
        actions={data.mode === 'sandbox' && (
          <Badge tone="warning" className="flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" /> Sandbox data — not live spend
          </Badge>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard label="Total budget" value={inr(t.budget)} hint="all campaigns, monthly" />
        <MetricCard label="Spent" value={inr(t.spend)} hint={`pacing ${Math.round(t.pacing * 100)}%`} />
        <MetricCard label="Near cap" value={num(nearCap.length)} hint="≥90% of budget spent" />
        <MetricCard label="Under-pacing" value={num(under.length)} hint="<50% spent while active" />
      </div>

      {nearCap.length > 0 && (
        <Card className="p-4 mb-4 flex items-center gap-3 border-l-4 border-warning">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">{nearCap.map((b) => b.campaign).join(', ')}</strong>
            {nearCap.length === 1 ? ' is' : ' are'} close to the monthly cap — raise the budget or expect delivery to stop.
          </p>
        </Card>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-faint border-b border-line">
            {['Campaign', 'Platform', 'Status', 'Budget (monthly)', 'Spent', 'Pacing', 'CPL', 'ROAS', ''].map((h) => <th key={h} className="font-semibold px-4 py-3 whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {data.budgets.map((b) => (
              <tr key={b.id} className={cn('border-b border-line/70 hover:bg-surface2/60', b.status === 'paused' && 'opacity-55')}>
                <td className="px-4 py-3">
                  <span className="font-semibold text-ink">{b.campaign}</span>
                  {b.nearCap && <Badge tone="warning" className="ml-2">Near cap</Badge>}
                  {b.underPacing && <Badge tone="info" className="ml-2">Under-pacing</Badge>}
                </td>
                <td className="px-4 py-3"><span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', PLATFORM[b.platform]?.cls)}>{PLATFORM[b.platform]?.label}</span></td>
                <td className="px-4 py-3"><StatusBadge status={b.status === 'active' ? 'live' : b.status} /></td>
                <td className="px-4 py-3"><BudgetCell row={b} ws={workspace} canWrite={canWrite} /></td>
                <td className="px-4 py-3 tabular-nums">{inr(b.spent)}</td>
                <td className="px-4 py-3 w-36"><Pacing value={b.spent} max={b.budget} tone={b.nearCap ? 'warning' : 'coral'} /></td>
                <td className="px-4 py-3 tabular-nums">{inr(b.cpl, { compact: false })}</td>
                <td className="px-4 py-3 tabular-nums">{b.roas}×</td>
                <td className="px-4 py-3 text-right"><StatusAction row={b} ws={workspace} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
