import React from 'react';
import { RefreshCw, Repeat2, Target, FileBarChart, AlertTriangle } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { usePosts, useInvalidatingMutation } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, EmptyState } from '../../ui';
import { ChannelIcon, PostStatus } from '../components/parts';

export default function Published() {
  const { workspace } = useWorkspace();
  const { data: posts = [] } = usePosts(workspace);
  const items = posts.filter((p) => p.status === 'published' || p.status === 'failed');
  const retry = useInvalidatingMutation((id) => effyApi.schedulePost(id), () => ['posts', workspace?.id]);

  if (!items.length) return (<><PageHeader title="Published" /><EmptyState icon="📤" title="Nothing published yet" body="Published content and its performance will appear here." /></>);

  return (
    <div>
      <PageHeader title="Published" subtitle="Live content and how it's performing." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-video bg-aurora relative">
              <span className="absolute top-2 left-2 grid place-items-center w-7 h-7 rounded-lg bg-white/90"><ChannelIcon channel={p.channel} /></span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-ink text-sm truncate">{p.title}</h3>
                <PostStatus status={p.status} />
              </div>
              <p className="text-xs text-ink-faint mb-3">{p.date} · {p.time} · {p.type}</p>

              {p.status === 'failed' ? (
                <div className="p-2.5 rounded-lg bg-error-soft text-error text-xs flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Publish failed — token expired. Reconnect to retry.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div><div className="text-sm font-extrabold tabular-nums">{num(p.metrics.reach)}</div><div className="text-[0.65rem] text-ink-faint">Reach</div></div>
                  <div><div className="text-sm font-extrabold tabular-nums">{p.metrics.engagement}%</div><div className="text-[0.65rem] text-ink-faint">Engage</div></div>
                  <div><div className="text-sm font-extrabold tabular-nums">{num(p.metrics.likes)}</div><div className="text-[0.65rem] text-ink-faint">Likes</div></div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {p.status === 'failed' ? (
                  <Button size="sm" variant="secondary" disabled={retry.isPending} onClick={() => retry.mutate(p.id)}>
                    <RefreshCw className="w-3.5 h-3.5" /> {retry.isPending ? 'Retrying…' : 'Retry'}
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="ghost"><Repeat2 className="w-3.5 h-3.5" /> Repurpose</Button>
                    <Button size="sm" variant="ghost"><Target className="w-3.5 h-3.5" /> Create ad</Button>
                    <Button size="sm" variant="ghost"><FileBarChart className="w-3.5 h-3.5" /> Report</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
