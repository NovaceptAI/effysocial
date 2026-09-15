import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Repeat2, Target, FileBarChart, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { usePosts } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { PUBLISH_CHECK_MS } from '../publishing';
import { formatInZone, orgZone } from '../timezone';
import ReportDialog from '../components/ReportDialog';
import { Card, PageHeader, Button, EmptyState } from '../../ui';
import { ChannelIcon, PostStatus } from '../components/parts';

const ORDER = { publishing: 0, failed: 1, published: 2 };

// Newest first within each group; what needs attention comes before what's live.
function byAttention(a, b) {
  return ORDER[a.status] - ORDER[b.status]
    || (b.publishedAt || '').localeCompare(a.publishedAt || '')
    || b.id - a.id;
}

function when(post, zone) {
  if (!post.publishedAt) return [post.date, post.time].filter(Boolean).join(' · ');
  return formatInZone(post.publishedAt, zone);
}

// The brief AI Studio starts from when a post is repurposed: its caption, or its title.
const repurposeBrief = (post) => (post.caption || post.title).slice(0, 600);

export default function Published() {
  const { workspace, org, canWrite } = useWorkspace();
  const queryClient = useQueryClient();
  const { data: posts = [] } = usePosts(workspace);
  const [reportId, setReportId] = useState(null);
  const items = posts.filter((p) => ORDER[p.status] !== undefined).sort(byAttention);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['posts', workspace?.id] });

  if (!items.length) return (<><PageHeader title="Published" /><EmptyState icon="📤" title="Nothing published yet" body="Published content and its performance will appear here." /></>);

  return (
    <div>
      <PageHeader title="Published" subtitle="Live content and how it's performing." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((p) => <PublishedCard key={p.id} post={p} zone={orgZone(org)} canWrite={canWrite} onChange={refresh} onReport={() => setReportId(p.id)} />)}
      </div>
      <ReportDialog post={posts.find((p) => p.id === reportId) || null} onClose={() => setReportId(null)} onChange={refresh} />
    </div>
  );
}

function PublishedCard({ post: p, zone, canWrite, onChange, onReport }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');   // '' | 'retry' | 'check'
  const [note, setNote] = useState('');

  // Retry publishes again; Check asks Instagram how a processing upload is doing.
  const run = async (action) => {
    setBusy(action); setNote('');
    try {
      await (action === 'retry' ? effyApi.publishPost(p.id) : effyApi.checkPublish(p.id));
    } catch (e) {
      if (!e.data?.post) setNote(e.message || 'Something went wrong. Try again.');  // a failed publish shows on the card itself
    } finally {
      setBusy('');
      onChange();
    }
  };

  // While Instagram processes an upload, keep asking (for five minutes) so the card turns live by itself.
  useEffect(() => {
    if (p.status !== 'publishing' || !canWrite) return undefined;
    let checks = 0;
    let asking = false;
    const timer = setInterval(async () => {
      if (asking) return;
      checks += 1;
      if (checks > 60) { clearInterval(timer); return; }
      asking = true;
      try {
        const r = await effyApi.checkPublish(p.id);
        if (r.post?.status !== 'publishing') onChange();
      } catch { /* Check now reports problems */ } finally { asking = false; }
    }, PUBLISH_CHECK_MS);
    return () => clearInterval(timer);
  }, [p.id, p.status, canWrite]); // eslint-disable-line react-hooks/exhaustive-deps

  const isVideo = p.mediaKind === 'video';
  return (
    <Card className="overflow-hidden" role="article" aria-label={p.title}>
      <div className="aspect-video bg-aurora relative">
        {p.mediaUrl && (isVideo
          ? <video src={p.mediaUrl} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" aria-label={`${p.title} video`} />
          : <img src={p.mediaUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />)}
        <span className="absolute top-2 left-2 grid place-items-center w-7 h-7 rounded-lg bg-white/90"><ChannelIcon channel={p.channel} /></span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-ink text-sm truncate">{p.title}</h3>
          <PostStatus status={p.status} />
        </div>
        <p className="text-xs text-ink-faint mb-3">{p.status === 'published' ? 'Published ' : ''}{when(p, zone)} · {p.type}</p>

        {p.status === 'failed' && (
          <div role="alert" className="p-2.5 rounded-lg bg-error-soft text-error text-xs flex items-start gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {p.error || 'Publishing failed.'}
              {/Integrations/.test(p.error || '') && <> <Link to="/app/integrations" className="font-bold underline">Open Integrations</Link></>}
            </span>
          </div>
        )}
        {p.status === 'publishing' && (
          <div role="status" className="p-2.5 rounded-lg bg-info-soft text-info text-xs flex items-center gap-2 mb-3">
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> Instagram is processing this {isVideo ? 'video' : 'image'}.
          </div>
        )}
        {p.status === 'published' && p.error && <p className="text-xs text-warning mb-3">{p.error}</p>}
        {p.status === 'published' && (p.metrics ? (
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div><div className="text-sm font-extrabold tabular-nums">{num(p.metrics.reach)}</div><div className="text-[0.65rem] text-ink-faint">Reach</div></div>
            <div><div className="text-sm font-extrabold tabular-nums">{p.metrics.engagement ?? 0}%</div><div className="text-[0.65rem] text-ink-faint">Engage</div></div>
            <div><div className="text-sm font-extrabold tabular-nums">{num(p.metrics.likes)}</div><div className="text-[0.65rem] text-ink-faint">Likes</div></div>
          </div>
        ) : (
          <p className="text-xs text-ink-soft mb-3">{p.externalId && p.channel === 'instagram' ? 'Open Report for reach, likes and saves from Instagram.' : 'No numbers for this post yet.'}</p>
        ))}
        {note && <p role="alert" className="text-xs text-error mb-2">{note}</p>}

        <div className="flex flex-wrap gap-1.5">
          {p.status === 'failed' && (
            <Button size="sm" variant="secondary" disabled={!canWrite || !!busy} onClick={() => run('retry')}>
              <RefreshCw className={busy === 'retry' ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} /> {busy === 'retry' ? 'Retrying…' : 'Retry'}
            </Button>
          )}
          {p.status === 'publishing' && (
            <Button size="sm" variant="secondary" disabled={!canWrite || !!busy} onClick={() => run('check')}>
              <RefreshCw className={busy === 'check' ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} /> {busy === 'check' ? 'Checking…' : 'Check now'}
            </Button>
          )}
          {p.status === 'published' && (
            <>
              {p.permalink && (
                <a href={p.permalink} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-[12px] text-coral-ink hover:bg-surface2">
                  <ExternalLink className="w-3.5 h-3.5" /> View on Instagram
                </a>
              )}
              <Button size="sm" variant="ghost" disabled={!canWrite}
                onClick={() => navigate(`/app/studio?${new URLSearchParams({ repurpose: String(p.id), topic: repurposeBrief(p) })}`)}>
                <Repeat2 className="w-3.5 h-3.5" /> Repurpose
              </Button>
              <Button size="sm" variant="ghost" disabled={!canWrite} onClick={() => navigate(`/app/launch?post=${p.id}`)}>
                <Target className="w-3.5 h-3.5" /> Create ad
              </Button>
              {p.channel === 'instagram' && p.externalId && (
                <Button size="sm" variant="ghost" onClick={onReport}><FileBarChart className="w-3.5 h-3.5" /> Report</Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
