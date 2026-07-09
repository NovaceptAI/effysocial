import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, BarChart3, Brain, FileInput, Flame, MessageSquareWarning, Plug, ShieldCheck,
  TrendingUp, Wand2,
} from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { usePosts } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, MetricCard, PageHeader, Badge, Button } from '../../ui';

const HEAT = { hot: 'text-error', warm: 'text-warning', cold: 'text-ink-faint' };

// Agency overview (spec §7.2) — org-wide rollup across all client workspaces.
function AgencyOverview({ onSwitchView }) {
  const { org, workspaces, setWorkspaceId } = useWorkspace();
  const totals = workspaces.reduce((t, w) => ({
    spend: t.spend + (w.monthlySpend || 0), leads: t.leads + (w.leads || 0),
    approvals: t.approvals + (w.approvals || 0), alerts: t.alerts + (w.alerts || 0),
  }), { spend: 0, leads: 0, approvals: 0, alerts: 0 });

  return (
    <div>
      <PageHeader
        title={`${org.name} — all clients`}
        subtitle={`${workspaces.length} workspaces under management`}
        actions={<Button variant="secondary" onClick={onSwitchView}>Client view</Button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Spend under management" value={inr(totals.spend)} hint="per month" />
        <MetricCard label="Leads (all clients)" value={num(totals.leads)} hint="all time" />
        <MetricCard label="Pending approvals" value={num(totals.approvals)} hint="across clients" />
        <MetricCard label="Active alerts" value={num(totals.alerts)} hint="needs action" />
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-ink">Clients</h3>
          <Link to="/app/clients" className="text-xs font-bold text-coral-ink">Full client list →</Link>
        </div>
        <ul className="divide-y divide-line">
          {workspaces.map((w) => (
            <li key={w.id}>
              <button onClick={() => { setWorkspaceId(w.id); onSwitchView(); }} className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-surface2/60 rounded-lg px-2 -mx-2">
                <span className="grid place-items-center w-8 h-8 rounded-lg text-base" style={{ background: w.accent + '22' }}>{w.logo}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{w.name}</span>
                  <span className="block text-xs text-ink-faint">{w.industry || '—'}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-ink-faint" />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

const UPCOMING_STATUSES = ['draft', 'internal_review', 'client_review', 'approved', 'scheduled'];
const STATUS_TONE = { scheduled: 'info', approved: 'success', internal_review: 'warning', client_review: 'warning', draft: 'default' };

function ActionRow({ to, icon: Icon, title }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-surface2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-coral-tint text-coral-ink">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sm font-bold text-ink">{title}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" />
    </Link>
  );
}

export default function Overview() {
  const { workspace, org } = useWorkspace();
  const isAgency = org?.type === 'agency';
  const [view, setView] = useState(isAgency ? 'agency' : 'client');

  // ALL real data — nothing invented.
  const { data: posts = [] } = usePosts(workspace);
  const { data: leads = [] } = useQuery({
    queryKey: ['leads', workspace?.id], queryFn: () => effyApi.listLeads(workspace.id), enabled: !!workspace,
  });
  const { data: recs = [] } = useQuery({
    queryKey: ['recs', workspace?.id], queryFn: () => effyApi.assistantRecommendations(workspace.id), enabled: !!workspace,
  });
  const { data: brand } = useQuery({
    queryKey: ['brand', workspace?.id], queryFn: () => effyApi.getBrand(workspace.id), enabled: !!workspace,
  });

  const brandReady = (brand?.completeness || 0) > 0;
  const attention = leads.filter((l) => ['new', 'contacted'].includes(l.stage)).slice(0, 4);
  const upcoming = posts.filter((p) => UPCOMING_STATUSES.includes(p.status)).slice(0, 4);
  const alerts = recs.filter((r) => r.severity === 'error' || r.severity === 'warning').slice(0, 3);
  const setupActions = useMemo(() => [
    !brandReady && {
      to: '/app/brand',
      icon: Brain,
      title: 'Add brand basics',
    },
    {
      to: '/app/forms',
      icon: FileInput,
      title: 'Create a lead form',
    },
    {
      to: '/app/integrations',
      icon: Plug,
      title: 'Connect channels',
    },
  ].filter(Boolean), [brandReady]);

  if (isAgency && view === 'agency') return <AgencyOverview onSwitchView={() => setView('client')} />;

  return (
    <div>
      {isAgency && (
        <button onClick={() => setView('agency')} className="mb-3 text-sm font-bold text-coral-ink">← Agency overview</button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 mb-4">
        <Card className="md:col-span-2 xl:col-span-4 overflow-hidden bg-card-sheen border border-line/70">
          <div className="min-h-[160px] p-5 flex flex-col justify-between gap-5">
            <div>
              <h2 className="font-display text-[1.4rem] sm:text-[1.65rem] leading-[1.05] font-semibold tracking-tight text-ink">
                Create your first post
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link to="/app/studio">
                <Button variant="spark" size="lg"><Wand2 className="w-4 h-4" /> Start AI Studio</Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-4 p-5 border border-line/70">
          <div className="mb-3">
            <h3 className="font-bold text-ink">Next best actions</h3>
          </div>
          <div className="space-y-1">
            {setupActions.map((action) => <ActionRow key={action.title} {...action} />)}
          </div>
        </Card>

        <Link to="/app/trends" className="block xl:col-span-2">
          <Card className="p-5 h-full min-h-[160px] bg-coral-tint/60 border border-line/70 transition hover:shadow-e3">
            <div className="h-full flex flex-col justify-between gap-3">
              <h3 className="font-bold text-ink">Trends</h3>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-coral-ink">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
          </Card>
        </Link>

        <Link to="/app/analytics/organic" className="block xl:col-span-2">
          <Card className="p-5 h-full min-h-[160px] border border-line/70 transition hover:shadow-e3">
            <div className="h-full flex flex-col justify-between gap-3">
              <h3 className="font-bold text-ink">Organic</h3>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral-tint text-coral-ink">
                <BarChart3 className="w-5 h-5" />
              </span>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-4">
        <Card className="p-5 border border-line/70 xl:col-span-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-ink">Content pipeline</h3>
            </div>
            <Link to="/app/calendar" className="text-xs font-bold text-coral-ink">Open calendar →</Link>
          </div>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface2 text-base capitalize">{(c.channel || 'i')[0]}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ink truncate">{c.title}</span>
                    <span className="block text-xs text-ink-faint">{c.date || 'unscheduled'}{c.time ? ` · ${c.time}` : ''}</span>
                  </span>
                  <Badge tone={STATUS_TONE[c.status] || 'default'}>{c.status.replace('_', ' ')}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <Link to="/app/studio"><Button size="sm"><Wand2 className="w-3.5 h-3.5" /> Open AI Studio</Button></Link>
            </div>
          )}
        </Card>

        <Card className="p-5 border border-line/70 xl:col-span-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-ink">Leads needing action</h3>
            <Link to="/app/pipeline" className="text-xs font-bold text-coral-ink">View all →</Link>
          </div>
          {attention.length ? (
            <ul className="space-y-2.5">
              {attention.map((l) => (
                <li key={l.id}>
                  <Link to={`/app/pipeline/${l.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface2 transition">
                    <Flame className={`w-4 h-4 shrink-0 ${HEAT[l.quality] || 'text-ink-faint'}`} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-ink truncate">{l.name}</span>
                      <span className="block text-xs text-ink-faint truncate">{l.interest || l.source}</span>
                    </span>
                    <Badge>{l.stage}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-ink-faint">No leads yet.</p>
          )}
        </Card>

        <Card className="p-5 border border-line/70 xl:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">Critical alerts</h3>
            {alerts.length ? <Badge tone="warning">{alerts.length} active</Badge> : <Badge tone="success"><ShieldCheck className="w-3 h-3" /> Watching</Badge>}
          </div>
          {alerts.length ? (
            <ul className="space-y-2.5">
              {alerts.map((a) => (
                <li key={a.id} className={`p-3 rounded-xl ${a.severity === 'error' ? 'bg-error-soft' : 'bg-warning-soft'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-bold ${a.severity === 'error' ? 'text-error' : 'text-warning'}`}>{a.title}</span>
                    <span className="text-[0.65rem] font-bold uppercase text-ink-faint">{a.agent}</span>
                  </div>
                  <p className="text-xs text-ink-soft mt-1 leading-snug">{a.detected}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl bg-surface2 p-3">
              <MessageSquareWarning className="mb-2 h-4 w-4 text-coral-ink" />
              <p className="text-sm font-semibold text-ink">No critical alerts</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
