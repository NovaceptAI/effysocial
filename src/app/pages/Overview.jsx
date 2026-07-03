import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { overviewMetrics, trendSeries, UPCOMING_CONTENT, ATTENTION_LEADS, ALERTS } from '../data/sampleData';
import { Card, MetricCard, PageHeader, Badge, Button } from '../../ui';

const HEAT = { hot: 'text-error', warm: 'text-warning', cold: 'text-ink-faint' };
const HDOT = { good: 'bg-success', attention: 'bg-warning', poor: 'bg-error' };

// Agency overview (spec §7.2) — org-wide rollup across all client workspaces.
function AgencyOverview({ onSwitchView }) {
  const { org, workspaces, setWorkspaceId } = useWorkspace();
  const navigate = useNavigate();
  const totals = workspaces.reduce((t, w) => ({
    spend: t.spend + (w.monthlySpend || 0), leads: t.leads + (w.leads || 0),
    approvals: t.approvals + (w.approvals || 0), alerts: t.alerts + (w.alerts || 0),
  }), { spend: 0, leads: 0, approvals: 0, alerts: 0 });
  const attention = workspaces.filter((w) => w.alerts > 0 || w.organicHealth !== 'good' || w.paidHealth !== 'good');

  return (
    <div>
      <PageHeader
        title={`${org.name} — all clients`}
        subtitle={`${workspaces.length} workspaces under management`}
        actions={<Button variant="secondary" onClick={onSwitchView}>Client view</Button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Spend under management" value={inr(totals.spend)} hint="per month" />
        <MetricCard label="Leads (all clients)" value={num(totals.leads)} delta="19%" deltaDir="up" hint="vs last 30d" />
        <MetricCard label="Pending approvals" value={num(totals.approvals)} hint="across clients" />
        <MetricCard label="Active alerts" value={num(totals.alerts)} deltaDir={totals.alerts ? 'down' : 'flat'} hint="needs action" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
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
                    <span className="block text-xs text-ink-faint">{w.industry}</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-3 text-xs text-ink-soft">
                    <span className="tabular-nums">{inr(w.monthlySpend)}/mo</span>
                    <span className="tabular-nums">{num(w.leads)} leads</span>
                  </span>
                  <span className={cnDot(w.organicHealth)} title={`organic ${w.organicHealth}`} />
                  <span className={cnDot(w.paidHealth)} title={`paid ${w.paidHealth}`} />
                  {w.approvals > 0 && <Badge tone="warning">{w.approvals}</Badge>}
                  {w.alerts > 0 && <Badge tone="error">{w.alerts}</Badge>}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 h-max">
          <h3 className="font-bold text-ink mb-3">Needing attention</h3>
          {attention.length ? (
            <ul className="space-y-2.5">
              {attention.map((w) => (
                <li key={w.id} className="p-3 rounded-lg bg-warning-soft border border-warning/20">
                  <div className="text-sm font-bold text-ink">{w.name}</div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {w.alerts > 0 && `${w.alerts} alert(s). `}
                    {w.organicHealth !== 'good' && 'Organic health needs review. '}
                    {w.paidHealth !== 'good' && 'Paid health needs review.'}
                  </p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-faint">All clients healthy 🎉</p>}
        </Card>
      </div>
    </div>
  );
}
function cnDot(level) { return `inline-block w-2 h-2 rounded-full ${HDOT[level] || 'bg-line'}`; }

export default function Overview() {
  const { workspace, org } = useWorkspace();
  const isAgency = org?.type === 'agency';
  const [view, setView] = useState(isAgency ? 'agency' : 'client');
  const m = overviewMetrics(workspace);
  const series = trendSeries(workspace);

  if (isAgency && view === 'agency') return <AgencyOverview onSwitchView={() => setView('client')} />;

  return (
    <div>
      {isAgency && (
        <button onClick={() => setView('agency')} className="mb-3 text-sm font-bold text-coral-ink">← Agency overview</button>
      )}
      <PageHeader
        title={`Good morning, here's ${workspace.name}`}
        subtitle="Your social growth at a glance — organic, paid, leads and revenue, connected."
        actions={<Button variant="spark"><Sparkles className="w-4 h-4" /> AI morning summary</Button>}
      />

      {/* AI summary strip */}
      <Card className="p-4 mb-5 bg-coral-soft/60 border-coral-soft flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-aurora text-white shrink-0"><Sparkles className="w-5 h-5" /></span>
        <p className="text-sm text-ink leading-relaxed">
          <strong>Leads are up 18% week-on-week</strong>, driven by the braces consult campaign. ROAS held at {m.roas}×.
          One alert needs you: CPL on the braces campaign is above target. {' '}
          <Link to="/app/analytics/organic" className="text-coral-ink font-bold">See why →</Link>
        </p>
      </Card>

      {/* Metric grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Attributed revenue" value={inr(m.revenue)} delta="18%" deltaDir="up" hint="vs last 30d" />
        <MetricCard label="Ad spend" value={inr(m.spend)} delta="4%" deltaDir="up" hint="vs last 30d" />
        <MetricCard label="Leads" value={num(m.leads)} delta="22%" deltaDir="up" hint={`${num(m.qualified)} qualified`} />
        <MetricCard label="ROAS" value={`${m.roas}×`} delta="0.3" deltaDir="up" hint={`CPL ${inr(m.cpl, { compact: false })}`} />
      </div>

      {/* Chart + side column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink">Leads, spend &amp; revenue</h3>
            <Badge tone="default">Last 8 weeks</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ left: -16, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6b5e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ff6b5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ece2d6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }}
                formatter={(v, name) => [name === 'leads' ? num(v) : inr(v), name]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ff6b5e" strokeWidth={2.5} fill="url(#gRev)" />
              <Area type="monotone" dataKey="leads" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Leads needing action */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-ink">Leads needing action</h3>
            <Link to="/app/pipeline" className="text-xs font-bold text-coral-ink">View all →</Link>
          </div>
          <ul className="space-y-2.5">
            {ATTENTION_LEADS.map((l) => (
              <li key={l.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface2 transition">
                <Flame className={`w-4 h-4 shrink-0 ${HEAT[l.heat]}`} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{l.name}</span>
                  <span className="block text-xs text-ink-faint truncate">{l.interest} · {l.source}</span>
                </span>
                <span className="text-xs text-ink-faint shrink-0">{l.age}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Bottom row: upcoming + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-ink">Upcoming content</h3>
            <Link to="/app/calendar" className="text-xs font-bold text-coral-ink">Open calendar →</Link>
          </div>
          <ul className="divide-y divide-line">
            {UPCOMING_CONTENT.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface2 text-base capitalize">{c.channel[0]}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{c.title}</span>
                  <span className="block text-xs text-ink-faint">{c.when}</span>
                </span>
                <Badge tone={c.status === 'scheduled' ? 'info' : c.status === 'approval' ? 'warning' : 'default'}>
                  {c.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3">Critical alerts</h3>
          <ul className="space-y-2.5">
            {ALERTS.map((a) => (
              <li key={a.id} className={`p-3 rounded-lg border ${a.severity === 'error' ? 'bg-error-soft border-error/20' : 'bg-warning-soft border-warning/20'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${a.severity === 'error' ? 'text-error' : 'text-warning'}`}>{a.title}</span>
                  <span className="text-[0.65rem] font-bold uppercase text-ink-faint">{a.module}</span>
                </div>
                <p className="text-xs text-ink-soft mt-1 leading-snug">{a.detail}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
