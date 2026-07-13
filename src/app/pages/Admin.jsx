import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Film, ImageIcon, Mic, Users, RefreshCw } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Badge, MetricCard, Pacing, EmptyState } from '../../ui';

const usd = (v) => `$${Number(v || 0).toFixed(2)}`;

export default function Admin() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-usage'],
    queryFn: () => effyApi.adminUsage(),
    refetchOnWindowFocus: true,
    retry: false,
  });

  if (isLoading) {
    return <div className="py-24 grid place-items-center text-ink-soft text-sm"><span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Loading platform usage…</span></div>;
  }
  if (isError) {
    return (
      <div>
        <PageHeader title="Admin" subtitle="Platform usage & limits" />
        <EmptyState icon="🔒" title="Admin access only" body={error?.message || 'This area is restricted to the EffySocial platform owner.'} />
      </div>
    );
  }

  const { totals, workspaces, platform, limits, recent, month } = data;

  return (
    <div>
      <PageHeader
        title="Admin — AI usage & limits"
        subtitle={`Metered AI across every org, since ${month}. Costs are estimates — Google/ElevenLabs bill exact.`}
        actions={<Badge tone="coral"><ShieldCheck className="w-3 h-3" /> Platform owner</Badge>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Veo video renders" value={totals.veo_video} hint={`limit ${limits.veo_video}/mo per workspace`} />
        <MetricCard label="AI images" value={totals.image} hint={`limit ${limits.image}/mo per workspace`} />
        <MetricCard label="Voiceover characters" value={(totals.tts_chars || 0).toLocaleString('en-IN')} hint="ElevenLabs, metered per char" />
        <MetricCard label="Est. spend this month" value={usd(totals.est_usd)} hint="estimate — see Google/EL consoles for exact" />
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-ink">Usage by workspace</h3>
          <span className="text-xs text-ink-faint inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {platform.users} users · {platform.orgs} orgs · {platform.workspaces} workspaces</span>
        </div>
        {workspaces.length === 0 ? (
          <p className="text-sm text-ink-faint py-6 text-center">No metered AI usage recorded this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-xs font-bold text-ink-faint uppercase tracking-wide border-b border-line">
                  {['Org / workspace', 'Plan', 'Veo renders', 'Images', 'Voiceover', 'Est. cost'].map((h) => <th key={h} className="py-2 pr-3 font-bold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {workspaces.map((w) => (
                  <tr key={w.workspaceId} className="border-b border-line/60 last:border-0">
                    <td className="py-3 pr-3">
                      <span className="block font-semibold text-ink">{w.workspace}</span>
                      <span className="block text-xs text-ink-faint">{w.org}</span>
                    </td>
                    <td className="py-3 pr-3"><Badge>{w.plan}</Badge></td>
                    <td className="py-3 pr-3">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1 tabular-nums">
                          <span className="font-bold text-ink">{w.veo_video}</span>
                          <span className="text-ink-faint">/ {w.veoLimit}</span>
                        </div>
                        <Pacing value={w.veo_video} max={w.veoLimit || 1} tone={w.veo_video >= w.veoLimit ? 'warning' : 'coral'} />
                      </div>
                    </td>
                    <td className="py-3 pr-3 tabular-nums">{w.image} <span className="text-xs text-ink-faint">/ {w.imgLimit}</span></td>
                    <td className="py-3 pr-3 tabular-nums">{(w.tts_chars || 0).toLocaleString('en-IN')} <span className="text-xs text-ink-faint">chars</span></td>
                    <td className="py-3 pr-3 font-bold tabular-nums">{usd(w.est_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-ink mb-3">Recent events</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-faint py-4 text-center">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-line/60">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2 text-sm">
                {e.kind === 'veo_video' ? <Film className="w-4 h-4 text-coral-ink shrink-0" />
                  : e.kind === 'tts' ? <Mic className="w-4 h-4 text-info shrink-0" />
                    : <ImageIcon className="w-4 h-4 text-ink-faint shrink-0" />}
                <span className="flex-1 min-w-0 truncate text-ink">{e.workspace} · <span className="text-ink-soft">{e.kind.replace('_', ' ')}</span> <span className="text-ink-faint">({e.surface}{e.kind === 'tts' ? ` · ${e.qty} chars` : ''})</span></span>
                <span className="text-xs text-ink-faint whitespace-nowrap">{new Date(e.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-xs text-ink-faint mt-4">Limits are set in the engine env (EFFY_LIMIT_VEO_MONTHLY, EFFY_LIMIT_IMG_MONTHLY) and enforced per workspace per calendar month — over-limit requests get an honest 429, nothing silent. Admin access: EFFY_ADMIN_EMAILS.</p>
    </div>
  );
}
