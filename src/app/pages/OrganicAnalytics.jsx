import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { Trophy, Clock, LayoutGrid, Sparkles, Loader2 } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { useOrganicAnalytics } from '../api/hooks';
import { Card, PageHeader, MetricCard, Button, Badge } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { cn } from '../../lib/cn';

function heatColor(v) {
  const a = Math.max(0.08, Math.min(1, v / 100));
  return `rgba(232, 74, 51, ${a})`;
}

export default function OrganicAnalytics() {
  const { workspace } = useWorkspace();
  const { data: a, isLoading } = useOrganicAnalytics(workspace);

  if (isLoading || !a) {
    return (<><PageHeader title="Organic Analytics" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading analytics…</Card></>);
  }

  const insights = [
    { icon: Trophy, label: 'Best post', value: a.insights.bestPost },
    { icon: LayoutGrid, label: 'Best format', value: a.insights.bestFormat },
    { icon: Clock, label: 'Best time', value: a.insights.bestTime },
    { icon: Sparkles, label: 'Best pillar', value: a.insights.bestPillar },
  ];

  return (
    <div>
      <PageHeader
        title="Organic Analytics"
        subtitle="Reach, engagement and growth — and what's actually working."
        actions={<>{a.provider === 'derived' && <Badge tone="warning">Sample series — connect channels for live metrics</Badge>}<Button variant="secondary">Export</Button></>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Followers" value={num(a.kpis.followers)} delta={`${a.kpis.growth}%`} deltaDir="up" hint="vs last 30d" />
        <MetricCard label="Reach" value={num(a.kpis.reach)} delta="14%" deltaDir="up" hint="vs last 30d" />
        <MetricCard label="Engagement rate" value={`${a.kpis.engagementRate}%`} delta="0.6" deltaDir="up" hint="vs last 30d" />
        <MetricCard label="Profile visits" value={num(a.kpis.profileVisits)} delta="9%" deltaDir="up" hint={`${num(a.kpis.linkClicks)} link clicks`} />
      </div>

      {/* what's working */}
      <Card className="p-4 mb-5">
        <h3 className="font-bold text-ink mb-3 text-sm">What's working</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((it) => (
            <div key={it.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface2/60">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-coral-soft text-coral-ink"><it.icon className="w-[18px] h-[18px]" /></span>
              <span className="min-w-0"><span className="block text-[0.7rem] text-ink-faint">{it.label}</span><span className="block text-sm font-bold text-ink truncate">{it.value}</span></span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-4">Follower growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={a.followerSeries} margin={{ left: -10, right: 8 }}>
              <CartesianGrid stroke="#ece2d6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} formatter={(v) => num(v)} />
              <Line type="monotone" dataKey="followers" stroke="#e84a33" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-4">Reach &amp; engagement</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={a.reachSeries} margin={{ left: -10, right: 8 }}>
              <CartesianGrid stroke="#ece2d6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} formatter={(v) => num(v)} />
              <Bar dataKey="reach" fill="#ff6b5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* top posts */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-ink mb-3">Top posts</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">{['', 'Post', 'Reach', 'Engage', 'Likes'].map((h) => <th key={h} className="font-semibold py-2 pr-3">{h}</th>)}</tr></thead>
            <tbody>
              {a.topPosts.map((p) => (
                <tr key={p.id} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5 pr-3 w-7"><ChannelIcon channel={p.channel} /></td>
                  <td className="py-2.5 pr-3"><span className="font-semibold text-ink">{p.title}</span><span className="block text-xs text-ink-faint capitalize">{p.type}</span></td>
                  <td className="py-2.5 pr-3 tabular-nums">{num(p.metrics.reach)}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{p.metrics.engagement}%</td>
                  <td className="py-2.5 pr-3 tabular-nums">{num(p.metrics.likes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* demographics */}
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3">Audience age</h3>
          <div className="space-y-2">
            {a.demographics.map((d) => (
              <div key={d.label} className="flex items-center gap-2 text-sm">
                <span className="w-12 text-ink-soft">{d.label}</span>
                <div className="flex-1 h-3 rounded-full bg-surface2 overflow-hidden"><div className="h-full bg-coral rounded-full" style={{ width: `${d.value * 2}%` }} /></div>
                <span className="w-8 text-right tabular-nums text-ink-faint">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* best times heatmap */}
      <Card className="p-5 mt-4">
        <h3 className="font-bold text-ink mb-4">Best posting times</h3>
        <div className="grid grid-cols-[48px_repeat(4,1fr)] gap-1.5 max-w-2xl">
          <div />
          {a.parts.map((p) => <div key={p} className="text-center text-xs font-semibold text-ink-faint">{p}</div>)}
          {a.bestTimes.map((row) => (
            <React.Fragment key={row.day}>
              <div className="text-xs font-semibold text-ink-faint flex items-center">{row.day}</div>
              {row.cells.map((v, i) => (
                <div key={i} className="aspect-[2/1] rounded-md grid place-items-center text-[0.65rem] font-bold"
                  style={{ background: heatColor(v), color: v > 60 ? '#fff' : '#a89d93' }}>{v}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}
