import React, { useState } from 'react';
import { Star, Sparkles, Check, Send } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useReviews, useInvalidatingMutation } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

function Stars({ n }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn('w-4 h-4', i <= n ? 'fill-warning text-warning' : 'text-line')} />
      ))}
    </span>
  );
}

export default function Reviews() {
  const { workspace } = useWorkspace();
  const { data: reviews = [] } = useReviews(workspace);
  const [expanded, setExpanded] = useState(null);
  const respond = useInvalidatingMutation((id) => effyApi.respondReview(id), () => ['reviews', workspace?.id]);

  const total = reviews.length || 1;
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  const pending = reviews.filter((r) => !r.responded).length;

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${pending} awaiting response`} actions={<Button variant="secondary">Request reviews</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        {/* distribution */}
        <Card className="p-5 h-max">
          <div className="text-center mb-4">
            <div className="text-4xl font-extrabold tabular-nums">{avg}</div>
            <Stars n={Math.round(avg)} />
            <div className="text-xs text-ink-faint mt-1">{total} reviews</div>
          </div>
          <div className="space-y-1.5">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-ink-faint tabular-nums">{d.star}</span>
                <Star className="w-3 h-3 fill-warning text-warning" />
                <div className="flex-1 h-2 rounded-full bg-surface2 overflow-hidden"><div className="h-full bg-warning rounded-full" style={{ width: `${(d.count / total) * 100}%` }} /></div>
                <span className="w-4 text-right text-ink-faint tabular-nums">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* feed */}
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><span className="font-bold text-ink">{r.author}</span><Stars n={r.rating} /></div>
                  <div className="text-xs text-ink-faint mt-0.5 capitalize">{r.source} · <span className={r.sentiment === 'negative' ? 'text-error' : r.sentiment === 'positive' ? 'text-success' : ''}>{r.sentiment}</span></div>
                </div>
                {r.responded ? <Badge tone="success">Responded</Badge> : <Badge tone="warning">Needs reply</Badge>}
              </div>
              <p className="text-sm text-ink-soft mt-2">{r.text}</p>

              {!r.responded && (
                <div className="mt-3">
                  {expanded === r.id ? (
                    <div className="p-3 rounded-lg bg-coral-soft/50 border border-coral-soft">
                      <div className="flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-coral-ink" /><span className="text-xs font-bold text-ink">AI suggested reply</span></div>
                      <p className="text-sm text-ink-soft">{r.reply}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" disabled={respond.isPending} onClick={() => { respond.mutate(r.id); setExpanded(null); }}>
                          <Send className="w-3.5 h-3.5" /> {respond.isPending ? 'Posting…' : 'Post reply'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setExpanded(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setExpanded(r.id)}><Sparkles className="w-3.5 h-3.5" /> Suggest reply</Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
