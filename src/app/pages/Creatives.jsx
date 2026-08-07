import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plug, FlaskConical, AlertTriangle } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, MetricCard, Tabs, StatusBadge } from '../../ui';
import { cn } from '../../lib/cn';

const PLATFORM = {
  meta: { label: 'Meta', cls: 'bg-info-soft text-info' },
  google: { label: 'Google', cls: 'bg-warning-soft text-warning' },
};

const FORMAT_TABS = [
  { id: 'all', label: 'All formats' },
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
  { id: 'carousel', label: 'Carousel' },
];

function FatigueBadge({ level }) {
  if (level === 'high') return <Badge tone="error" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Fatigued</Badge>;
  if (level === 'medium') return <Badge tone="warning">Watch</Badge>;
  return <Badge tone="success">Fresh</Badge>;
}

export default function Creatives() {
  const { workspace } = useWorkspace();
  const [format, setFormat] = useState('all');
  const { data, isLoading } = useQuery({
    queryKey: ['ads-creatives', workspace?.id],
    queryFn: () => effyApi.adsCreatives(workspace.id),
    enabled: !!workspace,
  });

  const rows = useMemo(() => {
    const all = data?.creatives || [];
    const filtered = format === 'all' ? all : all.filter((c) => c.format === format);
    return [...filtered].sort((a, b) => a.cpl - b.cpl);
  }, [data, format]);

  if (isLoading || !data) {
    return (<><PageHeader title="Creatives" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading creatives…</Card></>);
  }

  // Nothing connected (mock provider) → honest connect state, no sample data.
  if (data.mode !== 'sandbox' && data.mode !== 'live') {
    return (
      <div>
        <PageHeader title="Creatives" subtitle="Every ad creative ranked by cost per lead — spot winners and fatigue early." />
        <div className="text-center py-20 px-6 bg-surface rounded-2xl shadow-e1 flex flex-col items-center gap-2.5">
          <div className="grid place-items-center w-16 h-16 rounded-2xl bg-coral-tint text-3xl mb-1.5">🎬</div>
          <h4 className="font-display text-xl font-semibold tracking-tight text-ink">Connect an ad account</h4>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">Link Meta Ads or Google Ads to compare creative performance — CTR, CPL and fatigue across every ad you run.</p>
          <a href="/app/integrations" className="mt-3"><Button><Plug className="w-4 h-4" /> Connect ad accounts</Button></a>
        </div>
      </div>
    );
  }

  const totalSpend = rows.reduce((s, c) => s + c.spend, 0);
  const totalLeads = rows.reduce((s, c) => s + c.leads, 0);
  const fatigued = rows.filter((c) => c.fatigue === 'high').length;
  const best = rows[0];

  return (
    <div>
      <PageHeader
        title="Creatives"
        subtitle="Every ad creative ranked by cost per lead — spot winners and fatigue early."
        actions={data.mode === 'sandbox' && (
          <Badge tone="warning" className="flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" /> Sandbox data — not live spend
          </Badge>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard label="Creatives" value={num(rows.length)} hint={`${fatigued} fatigued`} />
        <MetricCard label="Spend" value={inr(totalSpend)} hint="across shown creatives" />
        <MetricCard label="Leads" value={num(totalLeads)} hint={`avg CPL ${inr(Math.round(totalSpend / Math.max(totalLeads, 1)), { compact: false })}`} />
        <MetricCard label="Best CPL" value={best ? inr(best.cpl, { compact: false }) : '—'} hint={best ? best.name : 'no creatives'} />
      </div>

      <div className="mb-4"><Tabs tabs={FORMAT_TABS} active={format} onChange={setFormat} /></div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-faint border-b border-line">
            {['Creative', 'Campaign · Ad set', 'Platform', 'Status', 'Spend', 'Leads', 'CTR', 'CPL', 'Fatigue'].map((h) => <th key={h} className="font-semibold px-4 py-3 whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className={cn('border-b border-line/70 hover:bg-surface2/60', c.status === 'paused' && 'opacity-55')}>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface2 text-lg shrink-0">{c.thumb}</span>
                    <span>
                      <span className="block font-semibold text-ink">{c.name}</span>
                      <span className="block text-xs text-ink-faint capitalize">{c.format}</span>
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  <span className="block">{c.campaign}</span>
                  <span className="block text-xs text-ink-faint">{c.adset}</span>
                </td>
                <td className="px-4 py-3"><span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', PLATFORM[c.platform]?.cls)}>{PLATFORM[c.platform]?.label}</span></td>
                <td className="px-4 py-3"><StatusBadge status={c.status === 'active' ? 'live' : c.status} /></td>
                <td className="px-4 py-3 tabular-nums">{inr(c.spend)}</td>
                <td className="px-4 py-3 tabular-nums">{num(c.leads)}</td>
                <td className="px-4 py-3 tabular-nums">{c.ctr}%</td>
                <td className="px-4 py-3 tabular-nums font-semibold text-ink">{inr(c.cpl, { compact: false })}</td>
                <td className="px-4 py-3"><FatigueBadge level={c.fatigue} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-ink-faint">No {format === 'all' ? '' : format + ' '}creatives found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
