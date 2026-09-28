import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ArrowRight, Loader2, Check } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import PlanView from '../components/PlanView';
import PlanBrief from '../components/PlanBrief';
import { PageHeader, EmptyState, Button, Card } from '../../ui';

// The workspace's newest marketing plan (sostac.py, 6.18), written from the workspace's own
// plan brief (6.17, the sidebar), its Brand Brain and its counted numbers; writing it again
// keeps the old ones. Accepting it creates its campaigns as drafts, and the sidebar shows
// this week's plan against what really happened.
const fmt = (n) => Number(n).toLocaleString('en-IN');
const day = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function ThisWeek({ plan, progress }) {
  const week = progress.find((w) => w.status === 'current');
  const o = plan.plan.objective || {};
  return (
    <section aria-label="This week: planned vs actual" className="bg-surface rounded-2xl shadow-e2 p-4 mb-4">
      <h2 className="text-sm font-bold text-ink">This week: planned vs actual</h2>
      {week ? (
        <>
          <p className="text-xs text-ink-faint mt-0.5">Week {week.week} of {progress.length} · {day(week.start)}–{day(week.end)}</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-ink-faint">Posts published</dt>
              <dd className="font-semibold text-ink tabular-nums">{fmt(week.actualPosts)} of {fmt(week.plannedPosts)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">{o.label}</dt>
              <dd className="font-semibold text-ink tabular-nums">
                {week.actualGoal == null ? 'Not measured' : fmt(week.actualGoal)}
                {week.plannedGoal != null && week.actualGoal != null && <> of {fmt(week.plannedGoal)}</>}
              </dd>
            </div>
          </dl>
          {week.actualGoal == null && o.measured === false && <p className="text-xs text-ink-faint mt-2">{o.baselineSource}</p>}
        </>
      ) : (
        <p className="text-sm text-ink-soft mt-2">This plan’s four weeks ended on {day(plan.plan.endsOn)}. Write a new plan for the next four.</p>
      )}
    </section>
  );
}

function AcceptBar({ plan, canWrite, onAccepted }) {
  const accept = useMutation({ mutationFn: () => effyApi.acceptPlan(plan.id), onSuccess: onAccepted });
  const accepted = plan.plan.accepted;
  const campaigns = plan.plan.tactics?.campaigns || [];
  const n = (k) => `${k} draft campaign${k === 1 ? '' : 's'}`;
  if (accepted) {
    return (
      <p role="status" className="mb-4 flex flex-wrap items-center gap-2 text-sm rounded-lg bg-success-soft text-success px-3.5 py-2.5">
        <Check className="w-4 h-4" /> Plan accepted: {n(accepted.campaignIds.length)} in Campaigns.
        {accepted.campaignIds.length > 0 && <Link to="/app/campaigns" className="font-semibold underline">Open Campaigns</Link>}
      </p>
    );
  }
  if (!canWrite) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5">
      <p className="text-sm text-ink-soft">
        {campaigns.length
          ? `Accepting the plan creates its ${n(campaigns.length)} in Campaigns. Nothing is published or spent.`
          : 'Accept the plan to mark it as the one you’re following.'}
      </p>
      <Button size="sm" onClick={() => accept.mutate()} disabled={accept.isPending}>
        {accept.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Accepting…</> : 'Accept plan'}
      </Button>
      {accept.isError && <p role="alert" className="w-full text-sm text-error">{accept.error.message}</p>}
    </div>
  );
}

export default function MarketingPlan() {
  const { workspace, canWrite } = useWorkspace();
  const qc = useQueryClient();
  const key = ['marketing-plan', workspace.id];
  const { data, isLoading, isError, error } = useQuery({ queryKey: key, queryFn: () => effyApi.getPlanPage(workspace.id) });
  const plan = data?.plan || null;
  const progress = data?.progress || null;
  const sostac = plan?.plan?.format === 'sostac';
  const brief = data?.brief;
  const needsGoal = !!brief && !brief.goal?.metric;
  const generate = useMutation({
    mutationFn: () => effyApi.writePlan(workspace.id),
    onSuccess: (r) => qc.setQueryData(key, (d) => ({ ...d, plan: r.plan, progress: r.progress ?? null })),
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
  else if (plan) {
    main = (
      <>
        {sostac && <AcceptBar key={plan.id} plan={plan} canWrite={canWrite} onAccepted={(r) => qc.setQueryData(key, (d) => ({ ...d, plan: r.plan }))} />}
        <Card className="p-5"><PlanView plan={plan} progress={progress} /></Card>
      </>
    );
  } else {
    main = (
      <EmptyState
        icon="🧭"
        title="No plan yet"
        body={!canWrite
          ? 'No plan has been generated for this workspace yet. Someone who can edit content can generate one.'
          : needsGoal
            ? 'Start with the plan brief beside this: this workspace’s goal, what it offers and who it’s for. The plan is written from it and from Brand Brain.'
            : 'Generate a four-week plan on SOSTAC — where things stand from your own numbers, one measurable objective, strategy, tactics and budget, weekly actions, and a weekly check of plan against actual — from this workspace’s brief and Brand Brain.'}
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
      <PageHeader title="Marketing Plan" subtitle={`A four-week plan on SOSTAC for ${workspace.name}`} actions={plan ? action : null} />
      {generate.isError && <p role="alert" className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{generate.error.message}</p>}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="min-w-0">{main}</div>
        <aside>
          {sostac && progress && <ThisWeek plan={plan} progress={progress} />}
          <PlanBrief workspaceId={workspace.id} brief={brief} options={data?.briefOptions} canWrite={canWrite}
            onSaved={(b) => qc.setQueryData(key, (d) => ({ ...d, brief: b }))} />
        </aside>
      </div>
    </div>
  );
}
