import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wand2, ArrowRight, ExternalLink, FileBarChart, Trophy } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { formatInZone, orgZone } from '../timezone';
import { PageHeader, EmptyState, Button, Card, Badge } from '../../ui';

// Creative performance compares the workspace's OWN published posts — never sample
// data. A post counts only once its numbers have been read from Instagram (Published →
// Report), so the page says plainly how many of the published posts are measured.
export default function CreativeAnalytics() {
  const { workspace, org } = useWorkspace();
  const zone = orgZone(org);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['creative-analytics', workspace.id],
    queryFn: () => effyApi.creativeAnalytics(workspace.id),
  });
  const organic = data?.organic;

  const header = (
    <PageHeader title="Creative Performance" subtitle={`Which formats and hooks work for ${workspace.name}`} />
  );

  if (isLoading) return <div>{header}<p className="text-sm text-ink-soft">Reading your published posts…</p></div>;
  if (isError) return <div>{header}<p role="alert" className="text-sm text-error">{error.message}</p></div>;

  // Nothing published at all — there is nothing honest to compare.
  if (!organic || !organic.published) {
    return (
      <div>
        {header}
        <EmptyState
          icon="🎬"
          title="No published posts to compare yet"
          body="Once you publish posts, EffySocial compares them by format and by the kind of hook they open with, using the numbers read from Instagram. Publish your first post to begin."
          action={<Link to="/app/studio"><Button><Wand2 className="w-4 h-4" /> Create in AI Studio <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
        />
      </div>
    );
  }

  return (
    <div>
      {header}
      <p className="-mt-5 mb-6 text-sm text-ink-soft">
        {organic.measured
          ? <>Comparing <strong className="font-semibold text-ink">{organic.measured}</strong> of your {organic.published} published {organic.published === 1 ? 'post' : 'posts'} — the ones whose numbers have been read from Instagram.</>
          : <>You have {organic.published} published {organic.published === 1 ? 'post' : 'posts'}, but no numbers for {organic.published === 1 ? 'it' : 'any of them'} yet.</>}
        {' '}
        <Link to="/app/published" className="font-semibold text-coral-ink underline">Open Published</Link>
        {' '}and press Report on a post to fetch its reach, likes and saves.
      </p>

      {organic.measured > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <BestCard title="Best format" winner={organic.bestFormat} note="Highest average engagement of the formats you've published." />
            <BestCard title="Best hook" winner={organic.bestHook} note="The kind of opening line that earns the most engagement." />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mb-6">
            <BreakdownCard title="By format" caption="How each format performs" rows={organic.byFormat} />
            <BreakdownCard title="By hook" caption="How each kind of opening line performs" rows={organic.byHook} />
          </div>
        </>
      )}

      <Card className="overflow-hidden" role="region" aria-label="Published posts">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-display text-base font-semibold tracking-tight">Published posts</h2>
          <p className="text-xs text-ink-soft mt-0.5">Newest first, with the hook each one opens on.</p>
        </div>
        <ul className="divide-y divide-line">
          {organic.posts.map((p) => <PostRow key={p.id} post={p} zone={zone} />)}
        </ul>
      </Card>
    </div>
  );
}

function BestCard({ title, winner, note }) {
  return (
    <Card className="p-5" role="region" aria-label={title}>
      <div className="flex items-center gap-2 mb-2">
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-coral-tint text-coral-ink"><Trophy className="w-4 h-4" /></span>
        <span className="text-[0.7rem] font-bold text-ink-faint uppercase tracking-[0.08em]">{title}</span>
      </div>
      <div className="font-display text-2xl font-semibold tracking-tight">{winner.label}</div>
      <p className="text-sm text-ink-soft mt-1">
        {winner.engagement}% engagement across {winner.posts} {winner.posts === 1 ? 'post' : 'posts'} · {num(winner.reach)} reach
      </p>
      <p className="text-xs text-ink-faint mt-2">{note}</p>
    </Card>
  );
}

function BreakdownCard({ title, caption, rows }) {
  const top = Math.max(...rows.map((r) => r.engagement), 1);
  return (
    <Card className="p-5" role="region" aria-label={title}>
      <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
      <p className="text-xs text-ink-soft mt-0.5 mb-4">{caption}</p>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">{r.label}</span>
              <span className="tabular-nums text-ink-soft">
                {r.engagement}% · {num(r.reach)} reach · {r.posts} {r.posts === 1 ? 'post' : 'posts'}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-surface2 overflow-hidden">
              <div className="h-full rounded-full bg-coral" style={{ width: `${Math.round((r.engagement / top) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PostRow({ post: p, zone }) {
  const isVideo = p.mediaKind === 'video';
  return (
    <li className="flex items-start gap-4 px-5 py-4">
      <div className="w-16 h-16 shrink-0 rounded-xl bg-surface2 overflow-hidden">
        {p.mediaUrl && (isVideo
          ? <video src={p.mediaUrl} muted playsInline preload="metadata" className="w-full h-full object-cover" aria-label={`${p.title} video`} />
          : <img src={p.mediaUrl} alt="" loading="lazy" className="w-full h-full object-cover" />)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-sm text-ink truncate">{p.title}</h3>
          <Badge>{p.hook}</Badge>
        </div>
        {p.opening && <p className="text-xs text-ink-soft mt-1 line-clamp-2">{p.opening}</p>}
        <p className="text-[0.7rem] text-ink-faint mt-1">
          {p.type} · {p.publishedAt ? formatInZone(p.publishedAt, zone) : 'not published'}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {p.metrics ? (
          <>
            <div className="text-sm font-extrabold tabular-nums">{p.metrics.engagement ?? 0}%</div>
            <div className="text-[0.65rem] text-ink-faint">engagement</div>
            <div className="text-xs text-ink-soft tabular-nums mt-1">{num(p.metrics.reach)} reach</div>
          </>
        ) : (
          <Link to="/app/published" className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-coral-ink hover:underline">
            <FileBarChart className="w-3.5 h-3.5" /> No numbers yet
          </Link>
        )}
        {p.permalink && (
          <a href={p.permalink} target="_blank" rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-ink-soft hover:text-ink">
            <ExternalLink className="w-3 h-3" /> View
          </a>
        )}
      </div>
    </li>
  );
}
