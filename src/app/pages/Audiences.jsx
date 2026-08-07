import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plug, FlaskConical, AlertTriangle, UsersRound } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, MetricCard } from '../../ui';

const TYPE = {
  saved: { label: 'Saved', tone: 'default' },
  custom: { label: 'Custom', tone: 'info' },
  lookalike: { label: 'Lookalike', tone: 'success' },
};

export default function Audiences() {
  const { workspace } = useWorkspace();
  const { data, isLoading } = useQuery({
    queryKey: ['ads-audiences', workspace?.id],
    queryFn: () => effyApi.adsAudiences(workspace.id),
    enabled: !!workspace,
  });

  if (isLoading || !data) {
    return (<><PageHeader title="Audiences" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading audiences…</Card></>);
  }

  // Nothing connected (mock provider) → honest connect state, no sample data.
  if (data.mode !== 'sandbox' && data.mode !== 'live') {
    return (
      <div>
        <PageHeader title="Audiences" subtitle="Saved, custom and lookalike audiences with size and performance." />
        <div className="text-center py-20 px-6 bg-surface rounded-2xl shadow-e1 flex flex-col items-center gap-2.5">
          <div className="grid place-items-center w-16 h-16 rounded-2xl bg-coral-tint text-3xl mb-1.5">👥</div>
          <h4 className="font-display text-xl font-semibold tracking-tight text-ink">Connect an ad account</h4>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">Link Meta Ads or Google Ads to see audience sizes, cost per lead by audience, and where each audience is used.</p>
          <a href="/app/integrations" className="mt-3"><Button><Plug className="w-4 h-4" /> Connect ad accounts</Button></a>
        </div>
      </div>
    );
  }

  const rows = data.audiences;
  const totalSize = rows.reduce((s, a) => s + a.size, 0);
  const withSpend = rows.filter((a) => a.spend > 0);
  const bestCpl = withSpend.length ? withSpend.reduce((m, a) => (a.cpl < m.cpl ? a : m)) : null;

  return (
    <div>
      <PageHeader
        title="Audiences"
        subtitle="Saved, custom and lookalike audiences with size and performance."
        actions={data.mode === 'sandbox' && (
          <Badge tone="warning" className="flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" /> Sandbox data — not live spend
          </Badge>
        )}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard label="Audiences" value={num(rows.length)} hint={`${withSpend.length} in active use`} />
        <MetricCard label="Total reach" value={num(totalSize)} hint="combined audience size" />
        <MetricCard label="Best CPL" value={bestCpl ? inr(bestCpl.cpl, { compact: false }) : '—'} hint={bestCpl ? bestCpl.name : 'no spend yet'} />
        <MetricCard label="Spend" value={inr(withSpend.reduce((s, a) => s + a.spend, 0))} hint="across all audiences" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((a) => {
          const t = TYPE[a.type] || TYPE.saved;
          return (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface2 text-ink-soft"><UsersRound className="w-[18px] h-[18px]" /></span>
                  <div>
                    <div className="font-bold text-ink text-sm">{a.name}</div>
                    <div className="text-xs text-ink-faint">{a.description}</div>
                  </div>
                </div>
                <Badge tone={t.tone}>{t.label}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div><div className="text-xs text-ink-faint mb-0.5">Size</div><div className="font-semibold text-ink tabular-nums">{num(a.size)}</div></div>
                <div><div className="text-xs text-ink-faint mb-0.5">Spend</div><div className="font-semibold text-ink tabular-nums">{a.spend ? inr(a.spend) : '—'}</div></div>
                <div><div className="text-xs text-ink-faint mb-0.5">CPL</div><div className="font-semibold text-ink tabular-nums">{a.cpl ? inr(a.cpl, { compact: false }) : '—'}</div></div>
              </div>

              {a.overlapWarning && (
                <p className="flex items-center gap-1.5 text-xs text-warning mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> High overlap with your broad audience — may compete in auctions.
                </p>
              )}

              <div className="text-xs text-ink-faint">
                {a.usedIn.length ? <>Used in: <span className="text-ink-soft font-medium">{a.usedIn.join(', ')}</span></> : 'Not used in any campaign yet.'}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
