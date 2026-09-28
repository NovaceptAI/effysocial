import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import PlanView from '../components/PlanView';
import PlanBrief from '../components/PlanBrief';
import { PageHeader, EmptyState, Button, Card } from '../../ui';

// The workspace's newest marketing plan (onboarding.py), written from the workspace's own
// plan brief (6.17, the sidebar) and its Brand Brain; writing it again keeps the old ones.
export default function MarketingPlan() {
  const { workspace, canWrite } = useWorkspace();
  const qc = useQueryClient();
  const key = ['marketing-plan', workspace.id];
  const { data, isLoading, isError, error } = useQuery({ queryKey: key, queryFn: () => effyApi.getPlanPage(workspace.id) });
  const plan = data?.plan || null;
  const brief = data?.brief;
  const needsGoal = !!brief && !brief.goal?.metric;
  const generate = useMutation({
    mutationFn: () => effyApi.createMarketingPlan(workspace.id),
    onSuccess: (p) => qc.setQueryData(key, (d) => ({ ...d, plan: p })),
  });

  const action = canWrite ? (
    <Button onClick={() => generate.mutate()} disabled={generate.isPending || needsGoal}
      title={needsGoal ? 'Add this workspace’s goal to the plan brief first.' : undefined}>
      {generate.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing your plan…</> : <><Sparkles className="w-4 h-4" /> {plan ? 'Write a new plan' : 'Generate plan'}</>}
    </Button>
  ) : null;

  let main;
  if (isLoading) main = <p className="text-sm text-ink-soft">Loading plan…</p>;
  else if (isError) main = <p role="alert" className="text-sm text-error">{error.message}</p>;
  else if (plan) main = <Card className="p-5"><PlanView plan={plan} /></Card>;
  else {
    main = (
      <EmptyState
        icon="🧭"
        title="No plan yet"
        body={!canWrite
          ? 'No plan has been generated for this workspace yet. Someone who can edit content can generate one.'
          : needsGoal
            ? 'Start with the plan brief beside this: this workspace’s goal, what it offers and who it’s for. The plan is written from it and from Brand Brain.'
            : 'Generate a month of strategy — content pillars, channels and cadence, post ideas and what to aim for — from this workspace’s brief and Brand Brain. The more Brand Brain knows, the sharper it gets.'}
        action={(
          <div className="flex flex-wrap justify-center gap-2">
            {action}
            <Link to="/app/brand"><Button variant="secondary">Build Brand Brain <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        )}
      />
    );
  }

  return (
    <div>
      <PageHeader title="Marketing Plan" subtitle={`AI-guided monthly strategy for ${workspace.name}`} actions={plan ? action : null} />
      {generate.isError && <p role="alert" className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{generate.error.message}</p>}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="min-w-0">{main}</div>
        <aside>
          <PlanBrief workspaceId={workspace.id} brief={brief} options={data?.briefOptions} canWrite={canWrite}
            onSaved={(b) => qc.setQueryData(key, (d) => ({ ...d, brief: b }))} />
        </aside>
      </div>
    </div>
  );
}
