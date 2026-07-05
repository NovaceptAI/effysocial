import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plug, ArrowUpDown, Flame } from 'lucide-react';
import { useWorkspace, inr } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Badge, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

const SORTS = [
  ['ctr', 'CTR', (a, b) => b.ctr - a.ctr],
  ['cpl', 'CPL', (a, b) => a.cpl - b.cpl],
  ['spend', 'Spend', (a, b) => b.spend - a.spend],
];
const PLATFORM = {
  meta: { label: 'Meta', cls: 'bg-info-soft text-info' },
  google: { label: 'Google', cls: 'bg-warning-soft text-warning' },
};

export default function CreativeAnalytics() {
  const { workspace } = useWorkspace();
  const [sortKey, setSortKey] = useState('ctr');
  const { data: a, isLoading } = useQuery({
    queryKey: ['creativeAnalytics', workspace?.id],
    queryFn: () => effyApi.creativeAnalytics(workspace.id),
    enabled: !!workspace,
  });

  if (isLoading || !a) {
    return (<><PageHeader title="Creative Performance" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading creatives…</Card></>);
  }

  const sorter = SORTS.find(([k]) => k === sortKey)[2];
  const creatives = [...a.creatives].sort(sorter);

  return (
    <div>
      <PageHeader
        title="Creative Performance"
        subtitle="Which visuals actually earn their spend — sortable, with fatigue flags."
        actions={a.provider === 'mock' && (
          <Badge tone="warning"><Plug className="w-3 h-3" /> Sample data — connect ad accounts (Phase 3)</Badge>
        )}
      />

      {!creatives.length ? (
        <EmptyState icon="🎨" title="No creatives yet" body="Once ad campaigns run, every creative shows up here with CTR, CPL and fatigue signals." />
      ) : (
        <>
          {/* attribute analysis */}
          <Card className="p-4 mb-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <span className="block text-[0.7rem] text-ink-faint">Best format</span>
                <span className="text-sm font-bold text-ink capitalize">{a.attributes.bestFormat}</span>
              </div>
              {a.attributes.byFormat.map((f) => (
                <div key={f.format}>
                  <span className="block text-[0.7rem] text-ink-faint capitalize">{f.format} · avg CTR</span>
                  <span className="text-sm font-bold text-ink tabular-nums">{f.ctr}%</span>
                </div>
              ))}
              <div>
                <span className="block text-[0.7rem] text-ink-faint">Fatigued creatives</span>
                <span className={cn('text-sm font-bold tabular-nums', a.attributes.fatigued ? 'text-error' : 'text-ink')}>{a.attributes.fatigued}</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-ink-faint" />
                {SORTS.map(([k, label]) => (
                  <button key={k} onClick={() => setSortKey(k)}
                    className={cn('text-xs font-bold px-2.5 py-1 rounded-full',
                      sortKey === k ? 'bg-coral-soft text-coral-ink' : 'text-ink-faint hover:text-ink')}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatives.map((cr) => (
              <Card key={cr.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="grid place-items-center w-14 h-14 rounded-xl bg-surface2 text-2xl shrink-0">{cr.thumb}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink text-sm truncate">{cr.name}</p>
                    <p className="text-xs text-ink-faint truncate">{cr.campaign} · {cr.adset}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={cn('text-[0.65rem] font-bold px-2 py-0.5 rounded-full', PLATFORM[cr.platform]?.cls)}>{PLATFORM[cr.platform]?.label || cr.platform}</span>
                      <Badge className="capitalize">{cr.format}</Badge>
                      {cr.fatigue === 'high' && <Badge tone="error"><Flame className="w-3 h-3" /> Fatigued</Badge>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-surface2/60 py-2">
                    <span className="block text-[0.65rem] text-ink-faint">CTR</span>
                    <span className="text-sm font-extrabold text-ink tabular-nums">{cr.ctr}%</span>
                  </div>
                  <div className="rounded-lg bg-surface2/60 py-2">
                    <span className="block text-[0.65rem] text-ink-faint">CPL</span>
                    <span className="text-sm font-extrabold text-ink tabular-nums">{inr(cr.cpl, { compact: false })}</span>
                  </div>
                  <div className="rounded-lg bg-surface2/60 py-2">
                    <span className="block text-[0.65rem] text-ink-faint">Spend</span>
                    <span className="text-sm font-extrabold text-ink tabular-nums">{inr(cr.spend)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
