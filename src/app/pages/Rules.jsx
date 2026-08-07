import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plug, FlaskConical, Zap, Trash2, Plus, PlayCircle, PauseCircle, Bell } from 'lucide-react';
import { useWorkspace, inr } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

// Metric semantics for display + threshold hints.
const METRICS = {
  cpl: { label: 'CPL', fmt: (v) => inr(v, { compact: false }), hint: 'cost per lead (₹)' },
  roas: { label: 'ROAS', fmt: (v) => `${v}×`, hint: 'return on ad spend' },
  ctr: { label: 'CTR', fmt: (v) => `${v}%`, hint: 'click-through rate (%)' },
  pacing: { label: 'Pacing', fmt: (v) => `${Math.round(v * 100)}%`, hint: 'share of budget spent (0–1)' },
};
const OPS = { gt: 'goes above', lt: 'drops below' };
const ACTIONS = { pause: { label: 'Suggest pause', icon: PauseCircle }, notify: { label: 'Notify me', icon: Bell } };

function RuleSentence({ r }) {
  const m = METRICS[r.metric];
  return (
    <span className="text-sm text-ink-soft">
      When <strong className="text-ink">{m?.label || r.metric}</strong> {OPS[r.op] || r.op}{' '}
      <strong className="text-ink">{m ? m.fmt(r.threshold) : r.threshold}</strong>
      {' → '}{ACTIONS[r.action]?.label.toLowerCase() || r.action}
      {r.scope && r.scope !== 'all' && <span className="text-ink-faint"> · one campaign</span>}
    </span>
  );
}

export default function Rules() {
  const { workspace } = useWorkspace();
  const [form, setForm] = useState({ name: '', metric: 'cpl', op: 'gt', threshold: '', action: 'notify' });
  const [formErr, setFormErr] = useState('');
  const [dryRun, setDryRun] = useState(null);
  const [running, setRunning] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['ads-rules', workspace?.id],
    queryFn: () => effyApi.adsRules(workspace.id),
    enabled: !!workspace,
  });
  const invalidate = () => ['ads-rules', workspace?.id];
  const create = useInvalidatingMutation(
    (rule) => effyApi.adsCreateRule(workspace.id, rule), invalidate,
  );
  const toggle = useInvalidatingMutation(
    ({ id, enabled }) => effyApi.adsToggleRule(id, workspace.id, enabled), invalidate,
  );
  const remove = useInvalidatingMutation(
    (id) => effyApi.adsDeleteRule(id, workspace.id), invalidate,
  );

  const submit = () => {
    setFormErr('');
    const threshold = Number(form.threshold);
    if (!form.name.trim()) { setFormErr('Give the rule a name.'); return; }
    if (!Number.isFinite(threshold)) { setFormErr('Threshold must be a number.'); return; }
    create.mutate({ ...form, name: form.name.trim(), threshold }, {
      onSuccess: () => { setForm({ name: '', metric: 'cpl', op: 'gt', threshold: '', action: 'notify' }); setDryRun(null); },
      onError: (e) => setFormErr(e.message || 'Could not create the rule.'),
    });
  };

  const runDry = async () => {
    setRunning(true);
    try { setDryRun(await effyApi.adsRulesDryRun(workspace.id)); }
    finally { setRunning(false); }
  };

  if (isLoading || !data) {
    return (<><PageHeader title="Automated Rules" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading rules…</Card></>);
  }

  // Nothing connected (mock provider) → honest connect state, no sample data.
  if (data.mode !== 'sandbox' && data.mode !== 'live') {
    return (
      <div>
        <PageHeader title="Automated Rules" subtitle="Guardrails on your ad spend — get alerted or suggested pauses when metrics slip." />
        <div className="text-center py-20 px-6 bg-surface rounded-2xl shadow-e1 flex flex-col items-center gap-2.5">
          <div className="grid place-items-center w-16 h-16 rounded-2xl bg-coral-tint text-3xl mb-1.5">⚡</div>
          <h4 className="font-display text-xl font-semibold tracking-tight text-ink">Connect an ad account</h4>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">Link Meta Ads or Google Ads to set rules like "notify me when CPL goes above ₹500" — checked against live campaign metrics.</p>
          <a href="/app/integrations" className="mt-3"><Button><Plug className="w-4 h-4" /> Connect ad accounts</Button></a>
        </div>
      </div>
    );
  }

  const rules = data.rules || [];

  return (
    <div>
      <PageHeader
        title="Automated Rules"
        subtitle="Guardrails on your ad spend — rules suggest actions, they never fire without you."
        actions={data.mode === 'sandbox' && (
          <Badge tone="warning" className="flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" /> Sandbox data — not live spend
          </Badge>
        )}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          {rules.length === 0 && (
            <Card className="p-10 text-center text-sm text-ink-faint">
              No rules yet — create one on the right, e.g. “notify me when CPL goes above ₹500”.
            </Card>
          )}
          {rules.map((r) => (
            <Card key={r.id} className={cn('p-4 flex items-center gap-3', !r.enabled && 'opacity-55')}>
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-coral-tint text-coral-ink shrink-0"><Zap className="w-4 h-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink truncate">{r.name}</p>
                <RuleSentence r={r} />
              </div>
              <Badge tone={r.enabled ? 'success' : 'default'}>{r.enabled ? 'Active' : 'Paused'}</Badge>
              <Button size="sm" variant="ghost" onClick={() => toggle.mutate({ id: r.id, enabled: !r.enabled })} disabled={toggle.isPending}>
                {r.enabled ? 'Pause' : 'Resume'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(r.id)} disabled={remove.isPending}>
                <Trash2 className="w-3.5 h-3.5 text-error" />
              </Button>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-bold text-ink mb-3">New rule</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-faint mb-1">Name</label>
                <input
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. CPL guardrail"
                  className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink-faint mb-1">Metric</label>
                  <select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-coral/30">
                    {Object.entries(METRICS).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-faint mb-1">Condition</label>
                  <select value={form.op} onChange={(e) => setForm({ ...form, op: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-coral/30">
                    {Object.entries(OPS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-faint mb-1">
                  Threshold <span className="font-normal">— {METRICS[form.metric].hint}</span>
                </label>
                <input
                  type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  placeholder={form.metric === 'cpl' ? '500' : form.metric === 'roas' ? '2' : form.metric === 'ctr' ? '1.5' : '0.9'}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-coral/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-faint mb-1">Then</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ACTIONS).map(([k, a]) => (
                    <button key={k} onClick={() => setForm({ ...form, action: k })}
                      className={cn('inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                        form.action === k ? 'border-coral bg-coral-tint text-coral-ink' : 'border-line text-ink-soft hover:text-ink')}>
                      <a.icon className="w-4 h-4" /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
              {formErr && <p className="text-xs text-error">{formErr}</p>}
              <Button className="w-full" onClick={submit} disabled={create.isPending}>
                {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create rule
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-bold text-ink mb-1">Check rules now</h3>
            <p className="text-xs text-ink-faint mb-3">Evaluates every active rule against current campaign metrics — suggestions only, nothing is paused automatically.</p>
            <Button variant="secondary" className="w-full" onClick={runDry} disabled={running || rules.length === 0}>
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />} Run check
            </Button>
            {dryRun && (
              <div className="mt-3 space-y-2">
                {dryRun.results.length === 0 && <p className="text-xs text-ink-faint">No active rules to check.</p>}
                {dryRun.results.map((res) => (
                  <div key={res.ruleId} className="rounded-xl bg-surface2/60 px-3 py-2">
                    <p className="text-xs font-bold text-ink mb-1">{res.rule}</p>
                    {res.matches.length === 0
                      ? <p className="text-xs text-success">All clear — no campaigns match.</p>
                      : res.matches.map((m) => (
                        <p key={m.campaignId} className="text-xs text-ink-soft">
                          <strong className="text-warning">{m.campaign}</strong> — {METRICS[m.metric]?.label || m.metric}{' '}
                          {METRICS[m.metric] ? METRICS[m.metric].fmt(m.value) : m.value} ({OPS[m.op]}{' '}
                          {METRICS[m.metric] ? METRICS[m.metric].fmt(m.threshold) : m.threshold}) → {ACTIONS[m.suggestedAction]?.label.toLowerCase()}
                        </p>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
