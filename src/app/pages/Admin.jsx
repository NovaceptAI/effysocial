import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Film, ImageIcon, Mic, Users, RefreshCw, Zap } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Badge, MetricCard, Pacing, EmptyState, Button } from '../../ui';
import { cn } from '../../lib/cn';

const usd = (v) => `$${Number(v || 0).toFixed(2)}`;

// Platform engine switch — flips instantly for ALL workspaces (DB-backed).
const ENGINES = [
  { key: 'image_provider', label: 'Image engine', icon: ImageIcon,
    options: [{ v: 'imagen', name: 'Imagen 4', hint: 'paid · ~$0.04/image · best quality' },
              { v: 'flux', name: 'FLUX (Cloudflare)', hint: 'free · lower quality' }] },
  { key: 'video_provider', label: 'Video engine', icon: Film,
    options: [{ v: 'veo', name: 'Veo 3.1', hint: 'paid · ~$1.2/render · real AI motion' },
              { v: 'free', name: 'Free animator', hint: 'free · Ken-Burns from image' }] },
];

// Plans by hand until checkout exists (G22): every organisation, its plan in force,
// trial and usage; changing the plan applies on the organisation's next request.
function OrgPlans() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-orgs'], queryFn: () => effyApi.adminOrgs(), retry: false });
  const [problem, setProblem] = React.useState('');
  const save = useMutation({
    mutationFn: ({ id, plan }) => effyApi.adminSetPlan(id, plan, plan === 'Trial' ? 14 : undefined),
    onSuccess: () => { setProblem(''); qc.invalidateQueries({ queryKey: ['admin-orgs'] }); },
    onError: (e) => setProblem(e.message),
  });
  if (!data) return null;
  return (
    <Card className="p-5 mb-6">
      <section aria-label="Organisations and plans">
        <h3 className="font-bold text-ink mb-1">Organisations and plans</h3>
        <p className="text-xs text-ink-faint mb-4">Change a plan here until online checkout is live. Choosing Trial starts a fresh 14-day trial.</p>
        {problem && <p role="alert" className="text-sm text-error mb-3">{problem}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs font-bold text-ink-faint uppercase tracking-wide border-b border-line">
                {['Organisation', 'Plan', 'In force', 'Workspaces', 'Seats', 'Credits'].map((h) => <th key={h} className="py-2 pr-3 font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.orgs.map((o) => (
                <tr key={o.id} className="border-b border-line/60 last:border-0">
                  <td className="py-3 pr-3">
                    <span className="block font-semibold text-ink">{o.name}</span>
                    <span className="block text-xs text-ink-faint">{o.owner || '—'} · {o.type}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <select aria-label={`Plan for ${o.name}`} value={o.storedPlan} disabled={save.isPending}
                      onChange={(e) => save.mutate({ id: o.id, plan: e.target.value })}
                      className="rounded-lg bg-surface2 px-2.5 py-1.5 text-sm text-ink">
                      {data.plans.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="py-3 pr-3 text-xs">
                    <Badge tone={o.trial?.expired ? 'warning' : 'default'}>{o.plan}</Badge>
                    {o.trial && <span className="block text-ink-faint mt-1">{o.trial.expired ? 'trial ended' : `${o.trial.daysLeft} days left`}</span>}
                  </td>
                  <td className="py-3 pr-3 tabular-nums">{o.usage.workspaces} / {o.limits.workspaces}</td>
                  <td className="py-3 pr-3 tabular-nums">{o.usage.seats} / {o.limits.seats}</td>
                  <td className="py-3 pr-3 tabular-nums">{o.creditsUsed} / {o.limits.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Card>
  );
}

// Who asked to hear about coming features (G49).
function Interest() {
  const { data } = useQuery({ queryKey: ['admin-interest'], queryFn: () => effyApi.adminInterest(), retry: false });
  if (!data) return null;
  return (
    <Card className="p-5 mb-6">
      <section aria-label="Interest in coming features">
        <h3 className="font-bold text-ink mb-1">Interest in coming features</h3>
        <p className="text-xs text-ink-faint mb-3">People who pressed “Notify me when ready” — tell them first when it ships.</p>
        <ul className="divide-y divide-line/60">
          {data.map((f) => (
            <li key={f.feature} className="py-2.5">
              <div className="flex items-center justify-between text-sm"><span className="font-semibold text-ink">{f.label}</span><Badge>{f.count}</Badge></div>
              {f.people.length > 0 && <p className="text-xs text-ink-faint mt-1">{f.people.map((p) => (p.org ? `${p.email} (${p.org})` : p.email)).join(', ')}</p>}
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
}

function EngineSwitch() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ['admin-settings'], queryFn: () => effyApi.adminSettings(), retry: false });
  const save = useMutation({
    mutationFn: (p) => effyApi.adminSetSettings(p),
    onSuccess: (s) => qc.setQueryData(['admin-settings'], s),
  });
  if (!settings) return null;
  return (
    <Card className="p-5 mb-6">
      <h3 className="font-bold text-ink mb-1 inline-flex items-center gap-2"><Zap className="w-4 h-4 text-coral-ink" /> AI engines</h3>
      <p className="text-xs text-ink-faint mb-4">Applies instantly, platform-wide — flip to free engines while testing to avoid paid renders.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {ENGINES.map((e) => (
          <div key={e.key}>
            <div className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">{e.label}</div>
            <div className="space-y-1.5">
              {e.options.map((o) => {
                const active = settings[e.key] === o.v;
                return (
                  <button key={o.v} disabled={save.isPending}
                    onClick={() => !active && save.mutate({ [e.key]: o.v })}
                    className={cn('w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition',
                      active ? 'bg-coral-tint ring-2 ring-coral/40' : 'bg-surface2 hover:bg-surface2/70')}>
                    <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', active ? 'bg-coral' : 'bg-ink-faint/30')} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-ink">{o.name}</span>
                      <span className="block text-[0.7rem] text-ink-faint">{o.hint}</span>
                    </span>
                    {active && <Badge tone="coral">active</Badge>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// The minute scheduler (launch plan 4.2): is it running, and how did each job's last run go.
function ago(iso) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 90) return `${seconds} s ago`;
  if (seconds < 90 * 60) return `${Math.round(seconds / 60)} min ago`;
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

function Scheduler() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-scheduler'], queryFn: () => effyApi.adminScheduler(), retry: false, refetchInterval: 30_000 });
  const [run, setRun] = useState({ busy: false, note: '', error: '' });
  if (!data) return null;

  // Run the jobs now — after fixing whatever made one fail, without waiting a minute.
  const runNow = async () => {
    setRun({ busy: true, note: '', error: '' });
    try {
      const r = await effyApi.adminSchedulerRun();
      setRun({ busy: false, error: '', note: r.ran ? `Ran ${Object.keys(r.jobs).length} job(s).` : 'A run was already in progress.' });
      qc.invalidateQueries({ queryKey: ['admin-scheduler'] });
    } catch (e) {
      setRun({ busy: false, note: '', error: e.message || 'Could not run the scheduler.' });
    }
  };

  return (
    <Card className="p-5 mb-6">
      <section aria-label="Scheduler">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3 className="font-bold text-ink">Scheduler</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={runNow} disabled={run.busy}>
              <RefreshCw className={run.busy ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} /> {run.busy ? 'Running…' : 'Run now'}
            </Button>
            <Badge tone={data.running ? 'success' : 'error'}>{data.running ? 'Running' : 'Not running'}</Badge>
          </div>
        </div>
        {run.note && <p role="status" className="text-xs text-success mb-1">{run.note}</p>}
        {run.error && <p role="alert" className="text-xs text-error mb-1">{run.error}</p>}
        <p className="text-xs text-ink-faint mb-3">
          {data.lastRunAt ? `Last run ${ago(data.lastRunAt)}. ` : 'It hasn’t run yet. '}
          Runs every minute: publishes scheduled posts when they’re due and finishes uploads Instagram is still processing.
        </p>
        <ul className="divide-y divide-line/60">
          {data.jobs.map((j) => (
            <li key={j.name} className="py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-ink">{j.label}</span>
              <span className={cn('text-xs', j.ok === false ? 'text-error' : 'text-ink-faint')}>
                {j.ok === false ? `Last run failed: ${j.error}` : `${j.runs.toLocaleString('en-IN')} runs · ${j.failures} failed`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
}

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

      <OrgPlans />
      <Scheduler />
      <Interest />
      <EngineSwitch />

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
