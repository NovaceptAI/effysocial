import React, { useState } from 'react';
import { Check, MessageSquare, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { usePosts, useInvalidatingMutation } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, EmptyState } from '../../ui';
import { ChannelIcon, PostStatus } from '../components/parts';
import { cn } from '../../lib/cn';

const STAGES = ['Idea', 'Draft', 'Internal Review', 'Client Review', 'Approved', 'Scheduled', 'Published'];
const STAGE_OF = { internal_review: 2, client_review: 3 };

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
  const { workspace } = useWorkspace();
  const { data: posts = [] } = usePosts(workspace);
  const queue = posts.filter((p) => p.status === 'internal_review' || p.status === 'client_review');
  const [sel, setSel] = useState(null);
  const [comment, setComment] = useState('');
  const active = queue.find((p) => p.id === sel) || queue[0];

  const invalidate = () => ['posts', workspace?.id];
  const approve = useInvalidatingMutation((id) => effyApi.approvePost(id), invalidate);
  const reqChanges = useInvalidatingMutation(({ id, c }) => effyApi.requestChanges(id, c), invalidate);
  const addComment = useInvalidatingMutation(({ id, c }) => effyApi.commentPost(id, c), invalidate);

  if (!queue.length) {
    return (<><PageHeader title="Approvals" subtitle="Review and approve content." /><EmptyState icon="✅" title="Nothing to review" body="When content is sent for internal or client review it shows up here." /></>);
  }

  return (
    <div>
      <PageHeader title="Approvals" subtitle={`${queue.length} items awaiting review`} actions={<Button variant="secondary">Bulk approve</Button>} />
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* queue */}
        <Card className="p-2 h-max">
          <ul className="space-y-0.5">
            {queue.map((p) => (
              <li key={p.id}>
                <button onClick={() => setSel(p.id)} className={cn('w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition', active?.id === p.id ? 'bg-coral-soft' : 'hover:bg-surface2')}>
                  <ChannelIcon channel={p.channel} className="w-4 h-4 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ink truncate">{p.title}</span>
                    <span className="block text-xs text-ink-faint">{p.date} · {p.time}</span>
                  </span>
                  <PostStatus status={p.status} />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* detail */}
        {active && (
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1"><ChannelIcon channel={active.channel} /><span className="text-xs text-ink-faint capitalize">{active.channel} · {active.type}</span></div>
                <h2 className="text-lg font-extrabold text-ink">{active.title}</h2>
                <p className="text-sm text-ink-faint">Scheduled for {active.date} at {active.time} · {active.assignee}</p>
              </div>
              <PostStatus status={active.status} />
            </div>

            <div className="mb-4"><StageBar status={active.status} /></div>

            {/* preview + comments */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-line overflow-hidden">
                <div className="aspect-square bg-aurora" />
                <div className="p-3 text-sm text-ink-soft">A {active.type} for {workspace.name} — caption and visual preview render here.</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink mb-2 flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Comments</h3>
                <div className="space-y-2 mb-3">
                  {active.comments.length ? active.comments.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-surface2 text-sm">
                      <div className="flex items-center justify-between"><span className="font-semibold text-ink text-xs">{c.author}</span><span className="text-[0.7rem] text-ink-faint">{c.when}</span></div>
                      <p className="text-ink-soft mt-0.5">{c.text}</p>
                    </div>
                  )) : <p className="text-sm text-ink-faint">No comments yet.</p>}
                </div>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && comment.trim()) {
                      addComment.mutate({ id: active.id, c: comment.trim() });
                      setComment('');
                    }
                  }}
                  placeholder="Add a comment… (Enter to post)"
                  className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-line">
              <Button onClick={() => approve.mutate(active.id)} disabled={approve.isPending}>
                <Check className="w-4 h-4" /> {approve.isPending ? 'Approving…' : 'Approve'}
              </Button>
              <Button
                variant="secondary"
                disabled={reqChanges.isPending}
                onClick={() => { reqChanges.mutate({ id: active.id, c: comment.trim() }); setComment(''); }}
              >
                Request changes
              </Button>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-ink-faint"><Clock className="w-3.5 h-3.5" /> Due in 2 days</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
