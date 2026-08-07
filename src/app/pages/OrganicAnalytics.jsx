import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { Trophy, Clock, LayoutGrid, Sparkles, Loader2, Heart, MessageCircle } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { useOrganicAnalytics } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, MetricCard, Button, Badge } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { cn } from '../../lib/cn';

function IgStat({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-surface2 px-3.5 py-2.5">
      <div className="text-[0.62rem] font-bold uppercase tracking-wide text-ink-faint">{label}</div>
      <div className="text-xl font-bold text-ink mt-0.5 leading-none">{value}</div>
      {hint && <div className="text-[0.62rem] text-ink-faint mt-1">{hint}</div>}
    </div>
  );
}

// Live Instagram snapshot — real data from the workspace's connected IG account.
// Renders nothing when Instagram isn't connected (page falls back to its series).
function InstagramLiveCard({ workspace }) {
  const { data } = useQuery({
    queryKey: ['ig-insights', workspace?.id],
    queryFn: () => effyApi.instagramInsights(workspace.id),
    enabled: !!workspace,
    staleTime: 5 * 60 * 1000,
  });
  if (!data || !data.connected || data.error) return null;
  const p = data;
  return (
    <Card className="p-5 mb-5">
      <div className="flex items-center gap-3 mb-4">
        {p.avatar
          ? <img src={p.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
          : <span className="grid place-items-center w-11 h-11 rounded-full bg-surface2"><ChannelIcon channel="instagram" /></span>}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-ink">@{p.username}</span>
            <Badge tone="success">● Live · Instagram</Badge>
          </div>
          {p.bio && <div className="text-xs text-ink-faint truncate max-w-md">{p.bio}</div>}
        </div>
        <a href={`https://instagram.com/${p.username}`} target="_blank" rel="noreferrer" className="ml-auto shrink-0 text-xs font-bold text-coral-ink">View profile →</a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
        <IgStat label="Followers" value={num(p.followers ?? 0)} />
        <IgStat label="Reach" value={num(p.reach28 ?? 0)} hint="last 28 days" />
        <IgStat label="Profile views" value={num(p.profileViews ?? 0)} />
        <IgStat label="Engagement" value={p.engagementRate != null ? `${p.engagementRate}%` : '—'} hint="per post" />
        <IgStat label="Posts" value={num(p.posts ?? 0)} />
      </div>

      {p.recentPosts?.length > 0 && (
        <>
          <div className="text-xs font-bold text-ink-soft mb-2">Recent posts</div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {p.recentPosts.map((post) => (
              <a key={post.id} href={post.permalink} target="_blank" rel="noreferrer"
                className="relative shrink-0 w-24 rounded-lg overflow-hidden bg-surface2" title={post.caption}>
                <div className="aspect-square bg-surface2 grid place-items-center">
                  {post.thumb ? <img src={post.thumb} alt="" loading="lazy" className="w-full h-full object-cover" /> : <span className="text-ink-faint text-xs">{post.type}</span>}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-1.5 py-1 text-[0.62rem] font-bold text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)' }}>
                  <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {post.likes}</span>
                  <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {post.comments}</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

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

  // No EffySocial-published posts yet → show the live channel card (if any) + an
  // honest note; never sample charts.
  if (!a.topPosts?.length) {
    return (
      <div>
        <PageHeader title="Organic Analytics" subtitle="Reach, engagement and growth — and what's actually working." />
        <InstagramLiveCard workspace={workspace} />
        <div className="text-center py-14 px-6 bg-surface rounded-2xl shadow-e1 flex flex-col items-center gap-2.5">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-2xl mb-1">📊</div>
          <h4 className="font-display text-lg font-semibold tracking-tight text-ink">More analytics as you publish</h4>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">Top posts, best-time heatmaps and cross-channel trends build from posts you publish in EffySocial. Create your first post — or connect more channels to sync history.</p>
          <div className="mt-3 flex gap-2">
            <a href="/app/studio"><Button>Create a post</Button></a>
            <a href="/app/integrations"><Button variant="secondary">Connect channels</Button></a>
          </div>
        </div>
      </div>
    );
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

      <InstagramLiveCard workspace={workspace} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Followers" value={num(a.kpis.followers)} hint="from connected channels" />
        <MetricCard label="Reach" value={num(a.kpis.reach)} hint="last 30 days" />
        <MetricCard label="Engagement rate" value={`${a.kpis.engagementRate}%`} hint="from post metrics" />
        <MetricCard label="Profile visits" value={num(a.kpis.profileVisits)} hint={`${num(a.kpis.linkClicks)} link clicks`} />
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
