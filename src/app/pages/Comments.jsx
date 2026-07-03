import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerUpLeft, Sparkles } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useConversations } from '../api/hooks';
import { Card, PageHeader, Badge, Button, EmptyState } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { cn } from '../../lib/cn';

const SENT = { positive: 'bg-success', neutral: 'bg-ink-faint', negative: 'bg-error' };

export default function Comments() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const { data: convos = [] } = useConversations(workspace);
  const comments = convos.filter((c) => c.kind === 'comment' || c.kind === 'mention');

  return (
    <div>
      <PageHeader title="Comments" subtitle="Post comments and mentions across channels"
        actions={<Button variant="secondary" onClick={() => navigate('/app/inbox')}>Open Unified Inbox</Button>} />

      {comments.length ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start gap-3">
                <ChannelIcon channel={c.channel} className="w-8 h-8 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-1.5 h-1.5 rounded-full', SENT[c.sentiment])} />
                    <span className="font-semibold text-ink text-sm">{c.person}</span>
                    <Badge>{c.kind}</Badge>
                    <span className="text-xs text-ink-faint ml-auto">{c.messages[0].time}</span>
                  </div>
                  <p className="text-sm text-ink-soft mt-1">{c.messages[0].text}</p>
                  {c.suggestedReply && (
                    <div className="mt-2 p-2.5 rounded-lg bg-coral-soft/40 text-sm text-ink-soft flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-coral-ink shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{c.suggestedReply}</span>
                    </div>
                  )}
                  <div className="mt-2"><Button size="sm" variant="ghost" onClick={() => navigate('/app/inbox')}><CornerUpLeft className="w-3.5 h-3.5" /> Reply in inbox</Button></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState icon="💬" title="No comments right now" />}
    </div>
  );
}
