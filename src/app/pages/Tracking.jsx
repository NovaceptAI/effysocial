import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Zap, ShieldCheck, Globe2, AlertTriangle, Info, ArrowRight, BookOpen } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const STATUS = {
  healthy: { tone: 'success', label: 'Healthy' },
  warning: { tone: 'warning', label: 'No events yet' },
  not_connected: { tone: 'default', label: 'Not connected' },
};

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

function SourceRow({ s, onTest, testing }) {
  const st = STATUS[s.status] || STATUS.not_connected;
  return (
    <tr className="border-t border-line">
      <td className="py-3 pr-3">
        <p className="font-bold text-ink">{s.name}</p>
        <p className="text-xs text-ink-faint mt-0.5">{s.detail}</p>
      </td>
      <td className="py-3 pr-3"><Badge tone={st.tone}>{st.label}</Badge></td>
      <td className="py-3 pr-3 font-bold tabular-nums">{s.events.toLocaleString('en-IN')}</td>
      <td className="py-3 pr-3 text-ink-soft whitespace-nowrap">{fmtTime(s.lastEvent)}</td>
      <td className="py-3 pr-3">
        {s.matchQuality == null ? <span className="text-ink-faint">—</span> : (
          <span className={cn('font-bold', s.matchQuality >= 70 ? 'text-success' : 'text-warning')}>{s.matchQuality}%</span>
        )}
      </td>
      <td className="py-3 pr-3">
        {s.duplicates > 0
          ? <Badge tone="warning">{s.duplicates} dup</Badge>
          : <span className="text-ink-faint">0</span>}
      </td>
      <td className="py-3 pr-3">
        {s.consent === 'ok' ? <Badge tone="success">ok</Badge>
          : s.consent === 'n/a' ? <span className="text-ink-faint">n/a</span>
          : <Badge tone="warning">{s.consent}</Badge>}
      </td>
      <td className="py-3 text-right whitespace-nowrap">
        <Button variant="secondary" size="sm" disabled={testing} onClick={() => onTest(s.id)}>
          <Zap className="w-3.5 h-3.5" /> Test
        </Button>
        <p className="text-[11px] text-ink-faint mt-1">{s.lastTest ? `last test ${fmtTime(s.lastTest)}` : 'never tested'}</p>
      </td>
    </tr>
  );
}

export default function Tracking() {
  const { workspace } = useWorkspace();
  const { data, isLoading } = useQuery({
    queryKey: ['tracking', workspace?.id],
    queryFn: () => effyApi.getTracking(workspace.id),
    enabled: !!workspace,
  });
  const test = useInvalidatingMutation(
    (source) => effyApi.sendTestEvent({ workspace: workspace.id, source }),
    () => ['tracking', workspace?.id],
  );

  if (isLoading || !data) {
    return <p className="flex items-center gap-2 text-ink-soft text-sm py-10"><Loader2 className="w-4 h-4 animate-spin" /> Loading tracking diagnostics…</p>;
  }

  const { sources, domain, utm, recommendations, guide } = data;

  return (
    <div>
      <PageHeader
        title="Conversion Tracking"
        subtitle="Diagnose every conversion source — events, match quality, duplicates, consent and attribution"
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-xs font-bold text-ink-faint uppercase tracking-wide">
              <th className="pb-2 pr-3">Source</th>
              <th className="pb-2 pr-3">Status</th>
              <th className="pb-2 pr-3">Events</th>
              <th className="pb-2 pr-3">Last event</th>
              <th className="pb-2 pr-3">Match quality</th>
              <th className="pb-2 pr-3">Duplicates</th>
              <th className="pb-2 pr-3">Consent</th>
              <th className="pb-2 text-right">Test event</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => <SourceRow key={s.id} s={s} onTest={(id) => test.mutate(id)} testing={test.isPending} />)}
          </tbody>
        </table>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card>
          <h3 className="font-extrabold tracking-tight mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-coral" /> UTM coverage</h3>
          {utm.submissions === 0 ? (
            <p className="text-sm text-ink-soft">No form submissions yet — coverage appears once leads start coming in.</p>
          ) : (
            <>
              <p className="text-3xl font-extrabold">{utm.coverage}%</p>
              <p className="text-sm text-ink-soft mt-1">{utm.tagged} of {utm.submissions} submissions carried UTM tags</p>
              <div className="mt-3 space-y-1.5">
                {utm.topSources.map((t) => (
                  <div key={t.source} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-soft">{t.source}</span>
                    <span className="font-bold tabular-nums">{t.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <h3 className="font-extrabold tracking-tight mb-3 flex items-center gap-2"><Globe2 className="w-4 h-4 text-coral" /> Domain verification</h3>
          <Badge tone={domain.status === 'verified' ? 'success' : 'default'}>{domain.status}</Badge>
          <p className="text-sm text-ink-soft mt-3">{domain.detail}</p>
        </Card>

        <Card>
          <h3 className="font-extrabold tracking-tight mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-coral" /> Setup guide</h3>
          <ol className="space-y-2 text-sm text-ink-soft list-decimal list-inside">
            {guide.map((g, i) => <li key={i}>{g}</li>)}
          </ol>
        </Card>
      </div>

      <Card className="mt-4">
        <h3 className="font-extrabold tracking-tight mb-3">Fix recommendations</h3>
        <div className="space-y-2">
          {recommendations.map((r) => (
            <Link key={r.id} to={r.to} className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 hover:border-coral transition group">
              {r.severity === 'warn'
                ? <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                : <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />}
              <span className="text-sm font-semibold text-ink-soft flex-1">{r.text}</span>
              <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-coral shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
