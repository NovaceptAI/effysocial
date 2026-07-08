import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Sparkles, ArrowRight, Flame, Wand2, Plug, CalendarPlus } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { usePosts } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, MetricCard, PageHeader, Badge, Button } from '../../ui';

const HEAT = { hot: 'text-error', warm: 'text-warning', cold: 'text-ink-faint' };
const HDOT = { good: 'bg-success', attention: 'bg-warning', poor: 'bg-error' };

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

// Last-8-week buckets from real row `created` dates (ISO yyyy-mm-dd).
function weeklySeries(leads) {
  const weeks = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay() - i * 7);
    const end = new Date(start); end.setDate(start.getDate() + 7);
    const label = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const count = leads.filter((l) => {
      const d = new Date(l.created);
      return d >= start && d < end;
    }).length;
    weeks.push({ week: label, leads: count });
  }
  return weeks;
}

const UPCOMING_STATUSES = ['draft', 'internal_review', 'client_review', 'approved', 'scheduled'];
const STATUS_TONE = { scheduled: 'info', approved: 'success', internal_review: 'warning', client_review: 'warning', draft: 'default' };

export default function Overview() {
  const { workspace, org, user } = useWorkspace();
  const isAgency = org?.type === 'agency';
  const [view, setView] = useState(isAgency ? 'agency' : 'client');

  // ALL real data — nothing invented.
  const { data: posts = [] } = usePosts(workspace);
  const { data: leads = [] } = useQuery({
    queryKey: ['leads', workspace?.id], queryFn: () => effyApi.listLeads(workspace.id), enabled: !!workspace,
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', workspace?.id], queryFn: () => effyApi.listCampaigns(workspace.id), enabled: !!workspace,
  });
  const { data: recs = [] } = useQuery({
    queryKey: ['recs', workspace?.id], queryFn: () => effyApi.assistantRecommendations(workspace.id), enabled: !!workspace,
  });

  const m = useMemo(() => {
    const spend = campaigns.reduce((s, c) => s + (c.spent || 0), 0);
    const revenue = campaigns.reduce((s, c) => s + (c.kpis?.revenue || 0), 0);
    const qualified = leads.filter((l) => ['qualified', 'appointment', 'proposal', 'won'].includes(l.stage)).length;
    return {
      revenue, spend, leads: leads.length, qualified,
      roas: spend > 0 ? (revenue / spend).toFixed(1) : null,
      cpl: leads.length > 0 && spend > 0 ? Math.round(spend / leads.length) : null,
    };
  }, [campaigns, leads]);

  const series = useMemo(() => weeklySeries(leads), [leads]);
  const hasActivity = leads.length > 0 || posts.length > 0 || campaigns.length > 0;
  const attention = leads.filter((l) => ['new', 'contacted'].includes(l.stage)).slice(0, 4);
  const upcoming = posts.filter((p) => UPCOMING_STATUSES.includes(p.status)).slice(0, 4);
  const alerts = recs.filter((r) => r.severity === 'error' || r.severity === 'warning').slice(0, 3);
  const firstName = (user?.name || '').split(' ')[0] || 'there';

  if (isAgency && view === 'agency') return <AgencyOverview onSwitchView={() => setView('client')} />;

  return (
    <div>
      {isAgency && (
        <button onClick={() => setView('agency')} className="mb-3 text-sm font-bold text-coral-ink">← Agency overview</button>
      )}
      <PageHeader
        title={`Good morning, ${firstName}`}
        subtitle={`${workspace.name} — organic, paid, leads and revenue, connected.`}
      />

      {/* Truthful summary strip */}
      <Card className="p-4 mb-5 bg-coral-tint/70 flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-aurora text-white shrink-0"><Sparkles className="w-5 h-5" /></span>
        <p className="text-sm text-ink leading-relaxed">
          {hasActivity ? (
            <>You have <strong>{num(leads.length)} lead{leads.length === 1 ? '' : 's'}</strong> ({num(m.qualified)} qualified), {num(posts.length)} content item{posts.length === 1 ? '' : 's'} in the pipeline and {num(campaigns.length)} campaign{campaigns.length === 1 ? '' : 's'}. {alerts.length ? `${alerts.length} alert${alerts.length === 1 ? '' : 's'} need${alerts.length === 1 ? 's' : ''} your attention below.` : 'No alerts — all clear.'}</>
          ) : (
            <><strong>Welcome to EffySocial.</strong> Start by <Link to="/app/integrations" className="text-coral-ink font-bold">connecting a channel</Link>, then create your first post in <Link to="/app/studio" className="text-coral-ink font-bold">AI Studio</Link> or launch a campaign from <Link to="/app/playbooks" className="text-coral-ink font-bold">Playbooks</Link>.</>
          )}
        </p>
      </Card>

      {/* Metric grid — real numbers, no invented deltas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Attributed revenue" value={inr(m.revenue)} hint={m.revenue ? 'from campaigns' : 'no revenue tracked yet'} />
        <MetricCard label="Ad spend" value={inr(m.spend)} hint={m.spend ? 'across campaigns' : 'no spend yet'} />
        <MetricCard label="Leads" value={num(m.leads)} hint={`${num(m.qualified)} qualified`} />
        <MetricCard label="ROAS" value={m.roas ? `${m.roas}×` : '—'} hint={m.cpl ? `CPL ${inr(m.cpl, { compact: false })}` : 'needs spend + revenue'} />
      </div>

      {/* Chart + attention leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink">Leads per week</h3>
            <Badge tone="default">Last 8 weeks</Badge>
          </div>
          {leads.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={series} margin={{ left: -16, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ece2d6" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} />
                <Area type="monotone" dataKey="leads" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] grid place-items-center text-center">
              <div>
                <p className="text-sm text-ink-soft mb-3">No leads yet — they'll chart here as they arrive.</p>
                <Link to="/app/forms"><Button size="sm" variant="secondary">Create a lead form <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
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
            <p className="text-sm text-ink-faint">No leads waiting. New form submissions and converted conversations land here.</p>
          )}
        </Card>
      </div>

      {/* Upcoming content + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-ink">Upcoming content</h3>
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
              <p className="text-sm text-ink-soft mb-3">Nothing in the pipeline — create your first post.</p>
              <Link to="/app/studio"><Button size="sm"><Wand2 className="w-3.5 h-3.5" /> Open AI Studio</Button></Link>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3">Critical alerts</h3>
          {alerts.length ? (
            <ul className="space-y-2.5">
              {alerts.map((a) => (
                <li key={a.id} className={`p-3 rounded-xl ${a.severity === 'error' ? 'bg-error-soft' : 'bg-warning-soft'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${a.severity === 'error' ? 'text-error' : 'text-warning'}`}>{a.title}</span>
                    <span className="text-[0.65rem] font-bold uppercase text-ink-faint">{a.agent}</span>
                  </div>
                  <p className="text-xs text-ink-soft mt-1 leading-snug">{a.detected}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">No alerts — Effy watches budgets, publishing failures and complaints for you.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
