import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, Trash2, Zap, GitBranch, Clock, Send, Play, History, Loader2, ChevronDown } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

const TRIGGERS = [
  { type: 'lead_created', label: 'Lead created' },
  { type: 'stage_changed', label: 'Pipeline stage changed' },
];
const SOURCES = ['', 'form', 'whatsapp', 'dm', 'manual'];
const STAGES = ['', 'new', 'contacted', 'qualified', 'appointment', 'proposal', 'won', 'lost'];
const CONDITION_FIELDS = ['source', 'quality', 'stage', 'channel'];
const DELAY_UNITS = ['minutes', 'hours', 'days'];
const ACTIONS = [
  ['whatsapp', 'Instant WhatsApp response'], ['email', 'Email response'], ['sms', 'SMS response'],
  ['ai_voice', 'AI voice callback'], ['assign_salesperson', 'Assign salesperson'],
  ['reminder', 'Follow-up reminder'], ['appointment_link', 'Appointment link'],
  ['retargeting_audience', 'Retargeting audience'], ['nurture', 'Nurture sequence'],
  ['reactivation', 'Lost-lead reactivation'],
];
const ACTION_LABEL = Object.fromEntries(ACTIONS);
const MESSAGE_ACTIONS = new Set(['whatsapp', 'email', 'sms', 'ai_voice', 'reminder', 'reactivation', 'nurture']);

// One-click starting points for common performance-marketing workflows.
// Presets only pre-fill blocks — everything stays editable before activation.
const PRESETS = [
  {
    key: 'whatsapp_lead',
    label: 'WhatsApp lead responder',
    hint: 'Instant reply + salesperson assignment for new WhatsApp leads',
    name: 'WhatsApp lead responder',
    trigger: { type: 'lead_created', source: 'whatsapp' },
    steps: [
      { kind: 'action', type: 'whatsapp', message: 'Hi {name}! Thanks for reaching out — how can we help you today?' },
      { kind: 'action', type: 'assign_salesperson', owner: '' },
      { kind: 'delay', amount: 1, unit: 'hours' },
      { kind: 'action', type: 'reminder', message: 'Check {name} got a reply on WhatsApp' },
    ],
  },
  {
    key: 'retargeting',
    label: 'Retargeting audience builder',
    hint: 'Add every new lead to a retargeting audience (ready for ad-platform sync)',
    name: 'Retargeting audience builder',
    trigger: { type: 'lead_created' },
    steps: [
      { kind: 'action', type: 'retargeting_audience', audience: 'All leads — 30 days' },
    ],
  },
  {
    key: 'reactivation',
    label: 'Lost-lead reactivation',
    hint: 'Win-back message 7 days after a lead is marked lost',
    name: 'Lost-lead reactivation',
    trigger: { type: 'stage_changed', stage: 'lost' },
    steps: [
      { kind: 'delay', amount: 7, unit: 'days' },
      { kind: 'action', type: 'reactivation', message: 'Hi {name}, we’d love another chance to help — anything we could have done better?' },
    ],
  },
];

const BLOCK_META = {
  trigger: { icon: Zap, tone: 'bg-coral-soft text-coral-ink', label: 'Trigger' },
  condition: { icon: GitBranch, tone: 'bg-info-soft text-info', label: 'Condition' },
  delay: { icon: Clock, tone: 'bg-warning-soft text-warning', label: 'Delay' },
  action: { icon: Send, tone: 'bg-success-soft text-success', label: 'Action' },
};

const inputCls = 'rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm';

function Block({ kind, children, onRemove }) {
  const m = BLOCK_META[kind];
  return (
    <div className="relative pl-9">
      <span className={cn('absolute left-0 top-2 w-7 h-7 rounded-lg flex items-center justify-center', m.tone)}>
        <m.icon className="w-3.5 h-3.5" />
      </span>
      <div className="rounded-lg border border-line bg-surface p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{m.label}</span>
          {onRemove && <button onClick={onRemove} className="text-ink-faint hover:text-error"><Trash2 className="w-3.5 h-3.5" /></button>}
        </div>
        {children}
      </div>
    </div>
  );
}

const Connector = () => <div className="ml-3.5 w-px h-4 bg-line" />;

function TriggerBlock({ wf, setWf }) {
  const t = wf.trigger;
  const setT = (patch) => setWf({ ...wf, trigger: { ...t, ...patch } });
  return (
    <Block kind="trigger">
      <div className="flex flex-wrap items-center gap-2">
        <select value={t.type} onChange={(e) => setWf({ ...wf, trigger: { type: e.target.value } })} className={inputCls}>
          {TRIGGERS.map((x) => <option key={x.type} value={x.type}>{x.label}</option>)}
        </select>
        {t.type === 'lead_created' && (
          <select value={t.source || ''} onChange={(e) => setT({ source: e.target.value })} className={inputCls}>
            {SOURCES.map((s) => <option key={s} value={s}>{s ? `source: ${s}` : 'any source'}</option>)}
          </select>
        )}
        {t.type === 'stage_changed' && (
          <select value={t.stage || ''} onChange={(e) => setT({ stage: e.target.value })} className={inputCls}>
            {STAGES.map((s) => <option key={s} value={s}>{s ? `to: ${s}` : 'any stage'}</option>)}
          </select>
        )}
      </div>
    </Block>
  );
}

function StepBlock({ step, onChange, onRemove }) {
  if (step.kind === 'condition') {
    return (
      <Block kind="condition" onRemove={onRemove}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span>Continue only if</span>
          <select value={step.field} onChange={(e) => onChange({ ...step, field: e.target.value })} className={inputCls}>
            {CONDITION_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <span>is</span>
          <input value={step.value} onChange={(e) => onChange({ ...step, value: e.target.value })}
            placeholder="value e.g. whatsapp" className={cn(inputCls, 'w-40')} />
        </div>
      </Block>
    );
  }
  if (step.kind === 'delay') {
    return (
      <Block kind="delay" onRemove={onRemove}>
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <span>Wait</span>
          <input type="number" min="1" max="90" value={step.amount}
            onChange={(e) => onChange({ ...step, amount: Number(e.target.value) || 1 })} className={cn(inputCls, 'w-20')} />
          <select value={step.unit} onChange={(e) => onChange({ ...step, unit: e.target.value })} className={inputCls}>
            {DELAY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </Block>
    );
  }
  return (
    <Block kind="action" onRemove={onRemove}>
      <div className="space-y-2">
        <select value={step.type} onChange={(e) => onChange({ ...step, type: e.target.value })} className={inputCls}>
          {ACTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {MESSAGE_ACTIONS.has(step.type) && (
          <textarea value={step.message || ''} onChange={(e) => onChange({ ...step, message: e.target.value })}
            placeholder="Message — use {name} for the lead's name" rows={2}
            className={cn(inputCls, 'w-full resize-none')} />
        )}
        {step.type === 'assign_salesperson' && (
          <input value={step.owner || ''} onChange={(e) => onChange({ ...step, owner: e.target.value })}
            placeholder="Salesperson name" className={cn(inputCls, 'w-full')} />
        )}
        {step.type === 'appointment_link' && (
          <input value={step.link || ''} onChange={(e) => onChange({ ...step, link: e.target.value })}
            placeholder="https://cal.com/…" className={cn(inputCls, 'w-full')} />
        )}
        {step.type === 'retargeting_audience' && (
          <>
            <input value={step.audience || ''} onChange={(e) => onChange({ ...step, audience: e.target.value })}
              placeholder="Audience name — e.g. All leads, 30 days" className={cn(inputCls, 'w-full')} />
            <p className="text-[0.7rem] text-ink-faint">Audience setup — saved and ready for integration. Syncs to Meta/Google once an ad account is connected.</p>
          </>
        )}
        {(step.type === 'reactivation' || step.type === 'nurture') && (
          <p className="text-[0.7rem] text-ink-faint">Sends via your messaging provider once connected — until then it’s logged on the lead.</p>
        )}
      </div>
    </Block>
  );
}

function PresetMenu({ onPick, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setOpen(!open)} disabled={disabled}>
        <Zap className="w-4 h-4" /> Use preset <ChevronDown className="w-3.5 h-3.5" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-1 w-72 rounded-xl border border-line bg-surface shadow-e3 p-1.5">
            {PRESETS.map((p) => (
              <button key={p.key} onClick={() => { setOpen(false); onPick(p); }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface2">
                <span className="block text-sm font-bold text-ink">{p.label}</span>
                <span className="block text-xs text-ink-faint leading-snug">{p.hint}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AddBlockMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
  const add = (step) => { onAdd(step); setOpen(false); };
  return (
    <div className="relative ml-9">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-bold text-coral-ink">
        <Plus className="w-4 h-4" /> Add block <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-52 rounded-lg border border-line bg-surface shadow-lg p-1">
          {[
            ['Condition', { kind: 'condition', field: 'source', value: '' }],
            ['Delay', { kind: 'delay', amount: 1, unit: 'hours' }],
            ['Action', { kind: 'action', type: 'whatsapp', message: '' }],
          ].map(([label, step]) => (
            <button key={label} onClick={() => add(step)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-surface2">{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function Editor({ workflow, onClose, onSaved }) {
  const [wf, setWf] = useState(workflow);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [error, setError] = useState('');

  const setStep = (i, step) => setWf({ ...wf, steps: wf.steps.map((s, j) => (j === i ? step : s)) });
  const removeStep = (i) => setWf({ ...wf, steps: wf.steps.filter((_, j) => j !== i) });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await effyApi.updateFollowup(wf.id, { name: wf.name, trigger: wf.trigger, steps: wf.steps });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };
  const dryRun = async () => {
    setPreviewBusy(true);
    setError('');
    try {
      await effyApi.updateFollowup(wf.id, { name: wf.name, trigger: wf.trigger, steps: wf.steps });
      onSaved();
      setPreview(await effyApi.followupDryRun(wf.id, {}));
    } catch (err) {
      setError(err.message || 'Preview failed.');
    } finally {
      setPreviewBusy(false);
    }
  };

  return (
    <Card className="p-5 mb-5 border-coral">
      <div className="flex items-center justify-between mb-4">
        <input value={wf.name} onChange={(e) => setWf({ ...wf, name: e.target.value })}
          className="text-lg font-extrabold text-ink bg-transparent border-b border-dashed border-line focus:border-coral outline-none" />
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={dryRun} disabled={previewBusy}>
            {previewBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Preview run
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving}><Check className="w-3.5 h-3.5" /> Save</Button>
        </div>
      </div>
      {error && <div className="mb-3 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <TriggerBlock wf={wf} setWf={setWf} />
          {wf.steps.map((step, i) => (
            <React.Fragment key={i}>
              <Connector />
              <StepBlock step={step} onChange={(s) => setStep(i, s)} onRemove={() => removeStep(i)} />
            </React.Fragment>
          ))}
          <Connector />
          {wf.steps.length < 10 && <AddBlockMenu onAdd={(s) => setWf({ ...wf, steps: [...wf.steps, s] })} />}
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">Preview (sample lead, nothing is sent)</h4>
          {preview ? (
            <ol className="space-y-1.5">
              {preview.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                  <Badge tone={e.step === 'action' ? 'success' : 'default'}>{e.step}</Badge>
                  <span className="pt-0.5">{e.text}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-faint">Click “Preview run” to see how this workflow executes against a sample lead.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function RunsDrawer({ workflowId }) {
  const { data: runs = [], isLoading } = useQuery({
    queryKey: ['followup-runs', workflowId],
    queryFn: () => effyApi.followupRuns(workflowId),
  });
  if (isLoading) return <p className="text-sm text-ink-faint px-4 py-3">Loading runs…</p>;
  if (!runs.length) return <p className="text-sm text-ink-faint px-4 py-3">No runs yet — activate the workflow and it will fire on matching lead events.</p>;
  return (
    <div className="px-4 py-3 space-y-3">
      {runs.map((r) => (
        <div key={r.id} className="rounded-lg border border-line p-3">
          <p className="text-sm font-bold text-ink mb-1.5">{r.lead} <span className="font-normal text-xs text-ink-faint">· {new Date(r.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></p>
          <ol className="space-y-1">
            {r.log.map((e, i) => (
              <li key={i} className="text-xs text-ink-soft flex items-start gap-1.5">
                <span className="font-bold uppercase text-[10px] text-ink-faint pt-px w-16 shrink-0">{e.step}</span> {e.text}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default function Followups() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['followups', workspace?.id],
    queryFn: () => effyApi.listFollowups(workspace.id),
    enabled: !!workspace,
  });
  const invalidate = () => ['followups', workspace?.id];
  const create = useInvalidatingMutation((p) => effyApi.createFollowup(p), invalidate);
  const update = useInvalidatingMutation(({ id, ...p }) => effyApi.updateFollowup(id, p), invalidate);

  const [editing, setEditing] = useState(null);
  const [runsFor, setRunsFor] = useState(null);
  const refresh = () => qc.invalidateQueries({ queryKey: invalidate() });

  const startCreate = async () => {
    const wf = await create.mutateAsync({
      workspace: workspace.id, name: 'New workflow',
      trigger: { type: 'lead_created' },
      steps: [{ kind: 'action', type: 'whatsapp', message: 'Hi {name}! Thanks for reaching out — how can we help?' }],
    });
    setEditing(wf);
  };
  const startPreset = async (preset) => {
    const wf = await create.mutateAsync({
      workspace: workspace.id, name: preset.name, trigger: preset.trigger, steps: preset.steps,
    });
    setEditing(wf);
  };
  const toggleStatus = (wf) =>
    update.mutate({ id: wf.id, status: wf.status === 'active' ? 'paused' : 'active' });

  const triggerLabel = (t) => {
    const base = TRIGGERS.find((x) => x.type === t.type)?.label || t.type;
    if (t.source) return `${base} · ${t.source}`;
    if (t.stage) return `${base} · ${t.stage}`;
    return base;
  };

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        subtitle="Automated responses to new leads and stage changes — trigger, condition, delay and action blocks."
        actions={
          <>
            <PresetMenu onPick={startPreset} disabled={create.isPending} />
            <Button onClick={startCreate} disabled={create.isPending}><Plus className="w-4 h-4" /> New workflow</Button>
          </>
        }
      />

      {editing && <Editor workflow={editing} onClose={() => setEditing(null)} onSaved={refresh} />}

      {isLoading ? (
        <Card className="p-10 text-center text-ink-soft">Loading workflows…</Card>
      ) : !workflows.length ? (
        <EmptyState icon="⚡" title="No follow-up workflows yet" body="Respond to every lead instantly — build a workflow from trigger, condition, delay and action blocks, then activate it." action={<Button onClick={startCreate}>Create workflow</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">{['Workflow', 'Trigger', 'Blocks', 'Runs', 'Status', ''].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {workflows.map((wf) => (
                <React.Fragment key={wf.id}>
                  <tr className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-semibold text-ink"><Zap className="w-4 h-4 text-ink-faint" /> {wf.name}</span>
                      <span className="block text-xs text-ink-faint ml-6">{wf.created}</span>
                    </td>
                    <td className="px-4 py-3"><Badge>{triggerLabel(wf.trigger)}</Badge></td>
                    <td className="px-4 py-3 text-ink-soft">
                      {wf.steps.length ? wf.steps.map((s) => (s.kind === 'action' ? ACTION_LABEL[s.type] || s.type : s.kind)).join(' → ') : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{wf.runs}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(wf)}
                        className={cn('text-xs font-bold px-3 py-1.5 rounded-full', wf.status === 'active' ? 'bg-success-soft text-success' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                        {wf.status === 'active' ? '● Active' : wf.status === 'paused' ? 'Paused — activate' : 'Draft — activate'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => setRunsFor(runsFor === wf.id ? null : wf.id)}><History className="w-3.5 h-3.5" /> Runs</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(wf)}>Edit</Button>
                    </td>
                  </tr>
                  {runsFor === wf.id && (
                    <tr className="border-b border-line/70 bg-surface2/40">
                      <td colSpan={6}><RunsDrawer workflowId={wf.id} /></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
