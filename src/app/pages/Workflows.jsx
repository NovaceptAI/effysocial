import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workflow, ArrowRight, Plus, Target, RefreshCw } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, Pacing } from '../../ui';

const OBJECTIVES = ['Lead generation', 'Sales', 'Awareness', 'Engagement'];

export default function Workflows() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [starting, setStarting] = useState(false);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [budget, setBudget] = useState(40000);

  const { data, isLoading } = useQuery({
    queryKey: ['workflows', workspace?.id],
    queryFn: () => effyApi.listWorkflows(workspace.id),
    enabled: !!workspace,
  });
  const workflows = data?.workflows || [];

  const start = useMutation({
    mutationFn: () => effyApi.createWorkflow({
      workspace: workspace.id, template: 'lead_gen_v1',
      name: name.trim(), objective, budget: Number(budget) || 0,
    }),
    onSuccess: (wf) => {
      qc.invalidateQueries({ queryKey: ['workflows', workspace?.id] });
      navigate(`/app/workflows/${wf.id}`);
    },
  });

  return (
    <div>
      <PageHeader
        title="Workflows"
        subtitle="Guided end-to-end journeys — every step tracked against real data."
      />

      {/* Template: Lead Generation Campaign */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-aurora text-white shadow-coral"><Target className="w-5 h-5" /></span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">Lead Generation Campaign</h2>
              <p className="text-sm text-ink-soft mt-0.5">Campaign → Creative → Landing → Form → Tracking → Ads → Pipeline → Follow-up</p>
            </div>
          </div>
          {!starting && (
            <Button variant="spark" onClick={() => setStarting(true)}><Plus className="w-4 h-4" /> Start workflow</Button>
          )}
        </div>

        {starting && (
          <div className="mt-5 pt-5 border-t border-hair grid sm:grid-cols-[1fr_auto_auto_auto] gap-2.5 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Campaign name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali Lead Drive"
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Objective</label>
              <select value={objective} onChange={(e) => setObjective(e.target.value)} className="rounded-xl bg-surface2 px-3 py-2.5 text-sm font-medium">
                {OBJECTIVES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Budget (₹)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-32 rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => start.mutate()} disabled={!name.trim() || start.isPending}>
                {start.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Start
              </Button>
              <Button variant="ghost" onClick={() => setStarting(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Running instances */}
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-3">Your workflows</h3>
      {isLoading ? (
        <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-20 rounded-2xl bg-surface2 animate-pulse" />)}</div>
      ) : workflows.length === 0 ? (
        <p className="text-sm text-ink-faint py-6 text-center">No workflows yet — start one above.</p>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => (
            <button key={wf.id} onClick={() => navigate(`/app/workflows/${wf.id}`)}
              className="w-full text-left bg-surface rounded-2xl shadow-e1 hover:shadow-e3 transition-all p-4 flex items-center gap-4">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-coral-tint text-coral-ink shrink-0"><Workflow className="w-5 h-5" /></span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-ink truncate">{wf.campaign?.name || wf.templateName}</span>
                <span className="block text-xs text-ink-faint">{wf.templateName} · started {wf.created}</span>
              </span>
              <span className="w-40 hidden sm:block">
                <Pacing value={wf.progress?.done || 0} max={wf.progress?.total || 8} tone="coral" />
              </span>
              <Badge tone={wf.progress?.done === wf.progress?.total ? 'success' : 'info'}>
                {wf.progress?.done}/{wf.progress?.total}
              </Badge>
              <ArrowRight className="w-4 h-4 text-ink-faint shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
