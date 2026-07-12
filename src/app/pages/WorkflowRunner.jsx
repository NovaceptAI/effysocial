import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Check, Circle, Minus, RefreshCw, Wand2, Globe,
  FileInput, Crosshair, Target, GitBranch, Repeat2, Megaphone, Plug,
} from 'lucide-react';
import { useWorkspace, inr } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, Pacing } from '../../ui';
import { cn } from '../../lib/cn';

const STEP_ICONS = {
  campaign: Megaphone, creative: Wand2, landing: Globe, form: FileInput,
  tracking: Crosshair, ads: Target, pipeline: GitBranch, followup: Repeat2,
};

/* Inline Ads draft editor — stores a plan ready to push once an account connects. */
function AdsDraft({ wf, step, onSave, saving }) {
  const d = step.draft || {};
  const [audience, setAudience] = useState(d.audience || '');
  const [pct, setPct] = useState(d.awarenessPct ?? 40);
  const [notes, setNotes] = useState(d.notes || '');
  const budget = wf.campaign?.budget || 0;
  const aw = Math.round((budget * pct) / 100);

  return (
    <div className="mt-3 rounded-xl bg-surface2/60 p-4 space-y-3">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Target audience</label>
        <textarea rows={2} value={audience} onChange={(e) => setAudience(e.target.value)}
          placeholder="e.g. 25–45, within 8km, interested in family healthcare…"
          className="w-full rounded-xl bg-surface px-3.5 py-2.5 text-sm" />
      </div>
      <div>
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-ink">Budget split</span>
          <span className="text-ink-soft tabular-nums">{pct}% awareness ({inr(aw)}) · {100 - pct}% retargeting ({inr(budget - aw)})</span>
        </div>
        <input type="range" min="0" max="100" step="5" value={pct} onChange={(e) => setPct(Number(e.target.value))} className="w-full accent-coral" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Creative angle, exclusions…"
          className="w-full rounded-xl bg-surface px-3.5 py-2.5 text-sm" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" onClick={() => onSave({ audience, awarenessPct: pct, notes })} disabled={saving}>
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save draft plan
        </Button>
        <Link to="/app/integrations" className="inline-flex items-center gap-1 text-xs font-bold text-coral-ink">
          <Plug className="w-3.5 h-3.5" /> Connect ad account to push live
        </Link>
      </div>
    </div>
  );
}

export default function WorkflowRunner() {
  const { id } = useParams();
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busyKey, setBusyKey] = useState('');

  const { data: wf, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => effyApi.getWorkflow(id),
    refetchOnWindowFocus: true,   // reflect work done in other modules on return
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ['workflow', id] });

  const patch = useMutation({
    mutationFn: (payload) => effyApi.updateWorkflow(id, payload),
    onSuccess: refresh,
  });

  // Inline creates (same pattern as Campaign Launch) — attach to this campaign.
  const createLanding = async () => {
    setBusyKey('landing');
    try {
      await effyApi.createLanding({ workspace: workspace.id, name: `${wf.campaign.name} — landing`, campaignId: wf.campaign.id });
      refresh();
    } finally { setBusyKey(''); }
  };
  const createForm = async () => {
    setBusyKey('form');
    try {
      await effyApi.createForm({ workspace: workspace.id, name: `${wf.campaign.name} — enquiry`, campaignId: wf.campaign.id });
      refresh();
    } finally { setBusyKey(''); }
  };

  if (isLoading || !wf) {
    return <div className="py-24 grid place-items-center text-ink-soft text-sm"><span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Loading workflow…</span></div>;
  }

  const steps = wf.steps || [];
  const done = wf.progress?.done || 0;
  const total = wf.progress?.total || steps.length;
  const nextIdx = steps.findIndex((s) => s.status === 'todo');

  // Primary action per step — deep-links carry the campaign context.
  const ACTIONS = {
    campaign: { label: 'Open campaign', onClick: () => navigate(`/app/campaigns/${wf.campaign.id}`) },
    creative: { label: 'Create in Studio', onClick: () => navigate(`/app/studio?campaign=${wf.campaign.id}&topic=${encodeURIComponent(wf.campaign.name)}`) },
    landing: steps.find((s) => s.key === 'landing')?.done
      ? { label: 'Open landing pages', onClick: () => navigate('/app/landing') }
      : { label: 'Create landing page', onClick: createLanding, busy: busyKey === 'landing' },
    form: steps.find((s) => s.key === 'form')?.done
      ? { label: 'Open forms', onClick: () => navigate('/app/forms') }
      : { label: 'Create lead form', onClick: createForm, busy: busyKey === 'form' },
    tracking: { label: 'Open Tracking Centre', onClick: () => navigate('/app/tracking') },
    ads: null, // rendered inline as the draft editor
    pipeline: { label: 'Open pipeline', onClick: () => navigate('/app/pipeline') },
    followup: { label: 'Set up follow-ups', onClick: () => navigate('/app/followups') },
  };

  return (
    <div>
      <button onClick={() => navigate('/app/workflows')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink mb-3">
        <ArrowLeft className="w-4 h-4" /> Workflows
      </button>
      <PageHeader
        title={wf.campaign?.name || wf.templateName}
        subtitle={`${wf.templateName} · ${wf.campaign?.objective} · budget ${inr(wf.campaign?.budget || 0)}`}
        actions={<Badge tone={done === total ? 'success' : 'info'}>{done}/{total} steps</Badge>}
      />
      <div className="max-w-md mb-8"><Pacing value={done} max={total} tone={done === total ? 'success' : 'coral'} /></div>

      <div className="space-y-3 max-w-3xl">
        {steps.map((s, i) => {
          const Icon = STEP_ICONS[s.key] || Circle;
          const action = ACTIONS[s.key];
          const isNext = i === nextIdx;
          return (
            <Card key={s.key} className={cn('p-4 transition-all', isNext && 'ring-2 ring-coral/30 shadow-e3')}>
              <div className="flex items-start gap-3.5">
                {/* status dot */}
                <span className={cn(
                  'grid place-items-center w-9 h-9 rounded-xl shrink-0 mt-0.5',
                  s.status === 'done' ? 'bg-success text-white'
                    : s.status === 'skipped' ? 'bg-surface2 text-ink-faint'
                      : isNext ? 'bg-coral text-white shadow-coral' : 'bg-surface2 text-ink-soft',
                )}>
                  {s.status === 'done' ? <Check className="w-4.5 h-4.5" strokeWidth={3} />
                    : s.status === 'skipped' ? <Minus className="w-4 h-4" />
                      : <Icon className="w-[18px] h-[18px]" />}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[0.7rem] font-bold text-ink-faint">STEP {i + 1}</span>
                    <h3 className={cn('font-bold', s.status === 'skipped' ? 'text-ink-faint line-through' : 'text-ink')}>{s.label}</h3>
                    {s.status === 'done' && <Badge tone="success">Done</Badge>}
                    {isNext && <Badge tone="coral">Up next</Badge>}
                    {!s.auto && s.status !== 'done' && <Badge>manual</Badge>}
                  </div>
                  <p className="text-sm text-ink-soft mt-0.5">{s.detail}</p>

                  {/* Ads: inline draft editor instead of a nav action */}
                  {s.key === 'ads' && s.status !== 'skipped' && (
                    <AdsDraft wf={wf} step={s} saving={patch.isPending}
                      onSave={(draft) => patch.mutate({ adsDraft: draft })} />
                  )}

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {action && (
                      <Button size="sm" variant={s.status === 'done' ? 'secondary' : isNext ? 'primary' : 'secondary'}
                        onClick={action.onClick} disabled={action.busy}>
                        {action.busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                        {action.label} <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {s.manual && s.status === 'todo' && (
                      <Button size="sm" variant="ghost" onClick={() => patch.mutate({ step: s.key, action: 'done' })}>
                        <Check className="w-3.5 h-3.5" /> Mark done
                      </Button>
                    )}
                    {s.skippable && s.status === 'todo' && (
                      <Button size="sm" variant="ghost" onClick={() => patch.mutate({ step: s.key, action: 'skip' })}>Skip</Button>
                    )}
                    {s.status === 'skipped' && (
                      <Button size="sm" variant="ghost" onClick={() => patch.mutate({ step: s.key, action: 'reset' })}>Unskip</Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {done === total && (
        <Card className="mt-6 p-5 max-w-3xl bg-success-soft/60">
          <p className="text-sm font-bold text-ink">🎉 Workflow complete — every stage of this lead-gen campaign is live.</p>
          <p className="text-xs text-ink-soft mt-1">Leads flow: ads/content → landing page → form → pipeline → automated follow-ups.</p>
        </Card>
      )}
    </div>
  );
}
