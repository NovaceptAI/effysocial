import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import PlanView from '../components/PlanView';
import { PageHeader, EmptyState, Button, Card } from '../../ui';

// The workspace's newest generated marketing plan (onboarding.py). Generated from
// the onboarding answers and the Brand Brain; writing it again keeps the old ones.
export default function MarketingPlan() {
  const { workspace, canWrite } = useWorkspace();
  const qc = useQueryClient();
  const key = ['marketing-plan', workspace.id];
  const { data: plan, isLoading, isError, error } = useQuery({ queryKey: key, queryFn: () => effyApi.getMarketingPlan(workspace.id) });
  const generate = useMutation({
    mutationFn: () => effyApi.createMarketingPlan(workspace.id),
    onSuccess: (p) => qc.setQueryData(key, p),
  });

  const action = canWrite ? (
    <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
      {generate.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing your plan…</> : <><Sparkles className="w-4 h-4" /> {plan ? 'Write a new plan' : 'Generate plan'}</>}
    </Button>
  ) : null;

  return (
    <div>
      <PageHeader title="Marketing Plan" subtitle={`AI-guided monthly strategy for ${workspace.name}`} actions={plan ? action : null} />
      {generate.isError && <p role="alert" className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{generate.error.message}</p>}
      {isLoading ? (
        <p className="text-sm text-ink-soft">Loading plan…</p>
      ) : isError ? (
        <p role="alert" className="text-sm text-error">{error.message}</p>
      ) : plan ? (
        <Card className="p-5"><PlanView plan={plan} /></Card>
      ) : (
        <EmptyState
          icon="🧭"
          title="No plan yet"
          body={canWrite
            ? 'Generate a month of strategy — content pillars, channels and cadence, post ideas and what to aim for — from your goals and Brand Brain. The more Brand Brain knows, the sharper it gets.'
            : 'No plan has been generated for this workspace yet. Someone who can edit content can generate one.'}
          action={(
            <div className="flex flex-wrap justify-center gap-2">
              {action}
              <Link to="/app/brand"><Button variant="secondary">Build Brand Brain <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
            </div>
          )}
        />
      )}
    </div>
  );
}
