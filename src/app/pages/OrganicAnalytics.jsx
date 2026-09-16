import React from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Trophy, Clock, LayoutGrid, MessageSquareQuote, Loader2, Download, ExternalLink } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { useOrganicAnalytics } from '../api/hooks';
import { formatInZone, orgZone } from '../timezone';
import { Card, PageHeader, MetricCard, Button, Badge } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { organicCsv, downloadCsv } from '../organicExport';

// Organic analytics from real sources only (launch plan 5.9, G41): the connected
// Instagram account's own insights and posts published through EffySocial. Anything
// Instagram doesn't provide says why — nothing here is a sample.
const shortDate = (ymd) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const orDash = (v, fmt = num) => (v == null ? '—' : fmt(v));

function Unavailable({ title, reason }) {
  return (
    <Card className="p-5" role="region" aria-label={title}>
      <h3 className="font-bold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-soft">{reason}</p>
    </Card>
  );
}

function AccountCard({ account, sources }) {
  const ig = sources.instagram;
  if (!ig.connected || ig.error) {
    return (
      <Card className="p-4 mb-5 flex flex-wrap items-center gap-3" role="region" aria-label="Instagram account">
        <ChannelIcon channel="instagram" />
        <p className="text-sm text-ink-soft flex-1 min-w-[12rem]">
          {ig.error ? `Instagram didn't return this account's numbers: ${ig.error}` : (ig.reason || 'Instagram isn’t connected.')}
          {' '}Account numbers, daily reach and audience appear here once it is.
        </p>
        <Link to="/app/integrations"><Button size="sm" variant="secondary">Open Integrations</Button></Link>
      </Card>
    );
  }
  return (
    <Card className="p-4 mb-5 flex flex-wrap items-center gap-3" role="region" aria-label="Instagram account">
      {account.avatar
        ? <img src={account.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
        : <span className="grid place-items-center w-10 h-10 rounded-full bg-surface2"><ChannelIcon channel="instagram" /></span>}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-ink">@{account.username}</span>
          <Badge tone="success">● Live · Instagram</Badge>
        </div>
        <div className="text-xs text-ink-faint">{num(account.followers ?? 0)} followers · {num(account.following ?? 0)} following · {num(account.posts ?? 0)} posts</div>
      </div>
      <a href={`https://instagram.com/${account.username}`} target="_blank" rel="noreferrer" className="ml-auto shrink-0 text-xs font-bold text-coral-ink">View profile →</a>
    </Card>
  );
}

function heat(v, max) {
  if (v == null) return 'transparent';
  return `rgba(232, 74, 51, ${Math.max(0.12, Math.min(1, v / Math.max(max, 1)))})`;
}

export default function OrganicAnalytics() {
  const { workspace, org } = useWorkspace();
  const zone = orgZone(org);
  const { data: a, isLoading, isError, error } = useOrganicAnalytics(workspace);

  const header = (actions) => (
    <PageHeader title="Organic Analytics" subtitle="Reach, engagement and what's working — from your connected account and the posts you publish." actions={actions} />
  );
  if (isLoading) return <div>{header()}<Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading analytics…</Card></div>;
  if (isError) return <div>{header()}<p role="alert" className="text-sm text-error">{error.message}</p></div>;

  const { kpis, working, bestTimes, sources } = a;
  const live = !!a.account;
  const hasAnything = live || a.topPosts.length > 0;
  const exportCsv = () => downloadCsv(`${workspace.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-organic-analytics.csv`, organicCsv(a, zone));

  if (!hasAnything) {
    return (
      <div>
        {header()}
        <AccountCard account={a.account} sources={sources} />
        <div className="text-center py-14 px-6 bg-surface rounded-2xl shadow-e1 flex flex-col items-center gap-2.5">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-2xl mb-1">📊</div>
          <h4 className="font-display text-lg font-semibold tracking-tight text-ink">Nothing to measure yet</h4>
          <p className="text-sm text-ink-soft max-w-sm leading-relaxed">
            {sources.posts.published
              ? `You've published ${sources.posts.published} post${sources.posts.published === 1 ? '' : 's'}, but none has numbers yet — open Published and press Report on a post.`
              : 'Publish a post through EffySocial, or connect Instagram, and its real numbers appear here.'}
          </p>
          <div className="mt-3 flex gap-2">
            <Link to={sources.posts.published ? '/app/published' : '/app/studio'}><Button>{sources.posts.published ? 'Open Published' : 'Create a post'}</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    { icon: Trophy, label: 'Best post', value: working.bestPost ? `${working.bestPost.title} · ${num(working.bestPost.reach)} reach` : null, why: 'Needs a published post with numbers.' },
    { icon: LayoutGrid, label: 'Best format', value: working.bestFormat ? `${working.bestFormat.label} · ${working.bestFormat.engagement}%` : null, why: 'Needs a published post with numbers.' },
    { icon: MessageSquareQuote, label: 'Best opening', value: working.bestHook ? `${working.bestHook.label} · ${working.bestHook.engagement}%` : null, why: 'Needs a published post with numbers.' },
    { icon: Clock, label: 'Best time', value: working.bestTime ? `${working.bestTime.day} ${working.bestTime.part.toLowerCase()} · ${working.bestTime.engagement}%` : null, why: bestTimes.reason },
  ];
  const maxCell = Math.max(0, ...bestTimes.rows.flatMap((r) => r.cells.map((c) => c.engagement ?? 0)));

  return (
    <div>
      {header(<Button variant="secondary" onClick={exportCsv}><Download className="w-4 h-4" /> Export CSV</Button>)}
      <AccountCard account={a.account} sources={sources} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Followers" value={orDash(kpis.followers)} hint={live ? 'Instagram, now' : 'connect Instagram'} />
        <MetricCard label="Reach" value={orDash(kpis.reach28)} hint={live ? `${orDash(kpis.views28)} views · last 28 days` : 'connect Instagram'} />
        <MetricCard label="Profile views" value={orDash(kpis.profileViews28)} hint={live ? `${orDash(kpis.linkTaps28)} link taps · 28 days` : 'connect Instagram'} />
        <MetricCard label="Post engagement" value={orDash(kpis.postEngagement, (v) => `${v}%`)}
          hint={sources.posts.measured ? `average of ${sources.posts.measured} published post${sources.posts.measured === 1 ? '' : 's'}` : 'no measured posts yet'} />
      </div>

      <Card className="p-4 mb-5" role="region" aria-label="What's working">
        <h3 className="font-bold text-ink mb-3 text-sm">What's working</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((it) => (
            <div key={it.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface2/60">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-coral-soft text-coral-ink shrink-0"><it.icon className="w-[18px] h-[18px]" /></span>
              <span className="min-w-0">
                <span className="block text-[0.7rem] text-ink-faint">{it.label}</span>
                {it.value
                  ? <span className="block text-sm font-bold text-ink truncate">{it.value}</span>
                  : <span className="block text-xs text-ink-soft">{it.why}</span>}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {a.reachSeries.length ? (
          <Card className="p-5" role="region" aria-label="Daily reach">
            <h3 className="font-bold text-ink mb-1">Daily reach</h3>
            <p className="text-xs text-ink-faint mb-3">Accounts reached each day, last 28 days (Instagram days run on Pacific time).</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={a.reachSeries} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="#ece2d6" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: '#a89d93' }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#a89d93' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip labelFormatter={shortDate} contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} formatter={(v) => [num(v), 'reach']} />
                <Line type="monotone" dataKey="reach" stroke="#e84a33" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ) : <Unavailable title="Daily reach" reason={live ? 'Instagram returned no daily reach for this account.' : 'Connect Instagram to see daily reach.'} />}

        {a.audience?.available ? (
          <Card className="p-5" role="region" aria-label="Audience">
            <h3 className="font-bold text-ink mb-3">Audience</h3>
            {[['Age', a.audience.age], ['Gender', a.audience.gender], ['Top cities', a.audience.cities]].filter(([, rows]) => rows.length).map(([title, rows]) => (
              <div key={title} className="mb-3 last:mb-0">
                <div className="text-xs font-semibold text-ink-faint mb-1.5">{title}</div>
                <div className="space-y-1.5">
                  {rows.map((d) => (
                    <div key={d.label} className="flex items-center gap-2 text-sm">
                      <span className="w-24 truncate text-ink-soft">{d.label}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-surface2 overflow-hidden"><div className="h-full bg-coral rounded-full" style={{ width: `${d.value}%` }} /></div>
                      <span className="w-9 text-right tabular-nums text-ink-faint">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        ) : <Unavailable title="Audience" reason={a.audience?.reason || 'Connect Instagram to see who follows the account.'} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5" role="region" aria-label="Top posts">
          <h3 className="font-bold text-ink mb-1">Top posts</h3>
          <p className="text-xs text-ink-faint mb-3">Posts published through EffySocial, by reach. {sources.posts.published > sources.posts.measured && `${sources.posts.published - sources.posts.measured} more have no numbers yet.`}</p>
          {a.topPosts.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-ink-faint border-b border-line">{['', 'Post', 'Published', 'Reach', 'Engagement', 'Likes'].map((h) => <th key={h} className="font-semibold py-2 pr-3 whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>
                  {a.topPosts.map((p) => (
                    <tr key={p.id} className="border-b border-line/70 last:border-0">
                      <td className="py-2.5 pr-3 w-7"><ChannelIcon channel={p.channel} /></td>
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold text-ink">{p.title}</span>
                        <span className="flex items-center gap-2 text-xs text-ink-faint capitalize">{p.type}
                          {p.permalink && <a href={p.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 normal-case hover:text-ink"><ExternalLink className="w-3 h-3" /> View</a>}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-ink-soft">{p.publishedAt ? formatInZone(p.publishedAt, zone, { day: 'numeric', month: 'short' }) : '—'}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{num(p.metrics.reach ?? 0)}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{p.metrics.engagement ?? 0}%</td>
                      <td className="py-2.5 pr-3 tabular-nums">{num(p.metrics.likes ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-ink-soft">None of your published posts has numbers yet — press Report on a post in Published.</p>}
        </Card>

        {a.followerGrowth?.available ? (
          <Card className="p-5" role="region" aria-label="New followers">
            <h3 className="font-bold text-ink mb-3">New followers</h3>
            <p className="text-3xl font-extrabold tabular-nums">{num(a.followerGrowth.series.reduce((s, d) => s + d.gained, 0))}</p>
            <p className="text-xs text-ink-faint">gained in the last 28 days</p>
          </Card>
        ) : <Unavailable title="New followers" reason={a.followerGrowth?.reason || 'Connect Instagram to see follower growth.'} />}
      </div>

      <Card className="p-5 mt-4" role="region" aria-label="Best posting times">
        <h3 className="font-bold text-ink mb-1">Best posting times</h3>
        {bestTimes.available ? (
          <>
            <p className="text-xs text-ink-faint mb-3">Average engagement of your published posts by when they went out ({zone.replace('_', ' ')}). Empty cells have no posts yet.</p>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[48px_repeat(4,minmax(64px,1fr))] gap-1.5 max-w-2xl">
                <div />
                {bestTimes.parts.map((p) => <div key={p} className="text-center text-xs font-semibold text-ink-faint">{p}</div>)}
                {bestTimes.rows.map((row) => (
                  <React.Fragment key={row.day}>
                    <div className="text-xs font-semibold text-ink-faint flex items-center">{row.day}</div>
                    {row.cells.map((c) => (
                      <div key={c.part} title={c.posts ? `${c.posts} post${c.posts === 1 ? '' : 's'}` : 'No posts'}
                        className="aspect-[2/1] rounded-md grid place-items-center text-[0.65rem] font-bold border border-line/60"
                        style={{ background: heat(c.engagement, maxCell), color: c.engagement != null && c.engagement > maxCell * 0.6 ? '#fff' : '#a89d93' }}>
                        {c.engagement != null ? `${c.engagement}%` : ''}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        ) : <p className="text-sm text-ink-soft">{bestTimes.reason}</p>}
      </Card>
    </div>
  );
}
