import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MessageSquare, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { usePosts, useInvalidatingMutation } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { ChannelIcon, PostStatus } from '../components/parts';
import { dayLabel, formatInZone, orgZone, zoneLabel } from '../timezone';
import { cn } from '../../lib/cn';

const STAGES = ['Idea', 'Draft', 'Internal Review', 'Client Review', 'Approved', 'Scheduled', 'Published'];
const STAGE_OF = { internal_review: 2, client_review: 3 };
const CLIENT_APPROVER = 'Client approver';

function StageBar({ status }) {
  const cur = STAGE_OF[status] ?? 1;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STAGES.map((s, i) => (
        <span key={s} className={cn('text-[0.65rem] font-semibold px-2 py-0.5 rounded-full',
          i < cur ? 'bg-success-soft text-success' : i === cur ? 'bg-coral text-white' : 'bg-surface2 text-ink-faint')}>
          {s}
        </span>
      ))}
    </div>
  );
}

export default function Approvals() {
  const { workspace, org, role } = useWorkspace();
  const zone = orgZone(org);
  const queryClient = useQueryClient();
  const { data: posts = [] } = usePosts(workspace);
  // Campaign context: content sent from a campaign/workflow keeps its link.
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', workspace?.id],
    queryFn: () => effyApi.listCampaigns(workspace.id),
    enabled: !!workspace,
  });
  const campaignName = (id) => campaigns.find((c) => c.id === id)?.name;
  // A client approver reviews at the client stage; the team sees both review stages.
  const clientView = role === CLIENT_APPROVER;
  const queue = posts.filter((p) => (clientView ? p.status === 'client_review' : ['internal_review', 'client_review'].includes(p.status)));
  const [sel, setSel] = useState(null);
  const [picked, setPicked] = useState({});
  const [comment, setComment] = useState('');
  const [problem, setProblem] = useState('');
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const active = queue.find((p) => p.id === sel) || queue[0];

  const invalidate = () => ['posts', workspace?.id];
  const onError = (e) => setProblem(e.message || 'That didn’t work. Try again.');
  const approve = useInvalidatingMutation((id) => effyApi.approvePost(id), invalidate);
  const reqChanges = useInvalidatingMutation(({ id, c }) => effyApi.requestChanges(id, c), invalidate);
  const addComment = useInvalidatingMutation(({ id, c }) => effyApi.commentPost(id, c), invalidate);

  const chosen = queue.filter((p) => picked[p.id]);
  const allPicked = queue.length > 0 && chosen.length === queue.length;
  const bulkApprove = async () => {
    setBulkBusy(true); setProblem(''); setBulkResult(null);
    try {
      const r = await effyApi.bulkApprove(workspace.id, chosen.map((p) => p.id));
      setBulkResult(r);
      setPicked({});
    } catch (e) {
      onError(e);
    } finally {
      setBulkBusy(false);
      queryClient.invalidateQueries({ queryKey: invalidate() });
    }
  };

  const header = (
    <PageHeader
      title="Approvals"
      subtitle={queue.length ? `${queue.length} item${queue.length === 1 ? '' : 's'} awaiting ${clientView ? 'your review' : 'review'}` : 'Review and approve content.'}
      actions={queue.length > 0 && (
        <Button variant="secondary" disabled={!chosen.length || bulkBusy} onClick={bulkApprove}>
          <Check className="w-4 h-4" /> {bulkBusy ? 'Approving…' : chosen.length ? `Approve selected (${chosen.length})` : 'Bulk approve'}
        </Button>
      )}
    />
  );
  const summary = bulkResult && (
    <div role="status" className="mb-4 text-sm rounded-xl bg-success-soft text-success px-4 py-2.5">
      Approved {bulkResult.approved.length}.
      {bulkResult.skipped.length > 0 && (
        <span className="text-ink-soft"> Not approved: {bulkResult.skipped.map((s) => `${s.title || `post ${s.id}`} (${s.reason})`).join('; ')}</span>
      )}
    </div>
  );

  if (!queue.length) {
    return (<>{header}{summary}<EmptyState icon="✅" title="Nothing to review" body={clientView ? 'Posts sent to you for review show up here.' : 'When content is sent for internal or client review it shows up here.'} /></>);
  }

  const when = active?.date ? `Planned for ${dayLabel(active.date)}${active.time ? ` at ${active.time}` : ''} (${zoneLabel(zone)})` : 'No date planned yet';

  return (
    <div>
      {header}
      {summary}
      {problem && <div role="alert" className="mb-4 text-sm rounded-xl bg-error-soft text-error px-4 py-2.5">{problem}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* queue */}
        <Card className="p-2 h-max">
          <label className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-soft">
            <input type="checkbox" className="accent-coral" checked={allPicked}
              onChange={(e) => setPicked(e.target.checked ? Object.fromEntries(queue.map((p) => [p.id, true])) : {})} />
            Select all
          </label>
          <ul className="space-y-0.5">
            {queue.map((p) => (
              <li key={p.id} className={cn('flex items-center gap-1 rounded-lg transition', active?.id === p.id ? 'bg-coral-soft' : 'hover:bg-surface2')}>
                <input type="checkbox" className="ml-3 accent-coral" aria-label={`Select ${p.title}`} checked={!!picked[p.id]}
                  onChange={(e) => setPicked((s) => ({ ...s, [p.id]: e.target.checked }))} />
                <button onClick={() => setSel(p.id)} className="flex-1 min-w-0 text-left flex items-center gap-2.5 px-2 py-2.5">
                  <ChannelIcon channel={p.channel} className="w-4 h-4 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ink truncate">{p.title}</span>
                    <span className="block text-xs text-ink-faint truncate">
                      {campaignName(p.campaignId) ? `📣 ${campaignName(p.campaignId)} · ` : ''}{p.date ? `${p.date} · ${p.time}` : 'No date'}
                    </span>
                  </span>
                  <PostStatus status={p.status} />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* detail */}
        {active && (
          <Card className="p-5" aria-label={`Review ${active.title}`} role="region">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <ChannelIcon channel={active.channel} /><span className="text-xs text-ink-faint capitalize">{active.channel} · {active.type}</span>
                  {campaignName(active.campaignId) && (
                    <Link to={`/app/campaigns/${active.campaignId}`}><Badge tone="coral">📣 {campaignName(active.campaignId)}</Badge></Link>
                  )}
                </div>
                <h2 className="text-lg font-extrabold text-ink">{active.title}</h2>
                <p className="text-sm text-ink-faint">{when}{active.assignee ? ` · ${active.assignee}` : ''}</p>
              </div>
              <PostStatus status={active.status} />
            </div>

            <div className="mb-4"><StageBar status={active.status} /></div>

            {/* preview + comments */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-line overflow-hidden">
                <div className="aspect-square bg-aurora relative">
                  {active.mediaUrl && (active.mediaKind === 'video'
                    ? <video src={active.mediaUrl} controls muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" aria-label={`${active.title} video`} />
                    : <img src={active.mediaUrl} alt={`${active.title} visual`} className="absolute inset-0 w-full h-full object-cover" />)}
                </div>
                <div className="p-3 text-sm text-ink-soft whitespace-pre-wrap">
                  {active.caption || <span className="text-ink-faint">No caption yet.</span>}
                  {!active.mediaUrl && <span className="block text-xs text-ink-faint mt-2">No image or video attached.</span>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink mb-2 flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Comments</h3>
                <div className="space-y-2 mb-3">
                  {active.comments.length ? active.comments.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-surface2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-ink text-xs">{c.author}{c.role ? <span className="font-normal text-ink-faint"> · {c.role}</span> : null}</span>
                        <span className="text-[0.7rem] text-ink-faint">{c.when && c.when !== 'now' ? formatInZone(c.when, zone) : ''}</span>
                      </div>
                      <p className="text-ink-soft mt-0.5">{c.text}</p>
                    </div>
                  )) : <p className="text-sm text-ink-faint">No comments yet.</p>}
                </div>
                <input
                  value={comment}
                  aria-label="Add a comment"
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && comment.trim()) {
                      addComment.mutate({ id: active.id, c: comment.trim() }, { onError });
                      setComment('');
                    }
                  }}
                  placeholder="Add a comment… (Enter to post)"
                  className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-line flex-wrap">
              <Button onClick={() => { setProblem(''); approve.mutate(active.id, { onError }); }} disabled={approve.isPending}>
                <Check className="w-4 h-4" /> {approve.isPending ? 'Approving…' : 'Approve'}
              </Button>
              <Button
                variant="secondary"
                disabled={reqChanges.isPending}
                onClick={() => { setProblem(''); reqChanges.mutate({ id: active.id, c: comment.trim() }, { onError }); setComment(''); }}
              >
                Request changes
              </Button>
              {active.date && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-ink-faint"><Clock className="w-3.5 h-3.5" /> {dayLabel(active.date)}</span>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
