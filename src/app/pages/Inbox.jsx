import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus, Tag, ArrowUpRight, Check, Clock, CornerUpLeft } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useConversations, useInvalidatingMutation } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { cn } from '../../lib/cn';

const SENT_DOT = { positive: 'bg-success', neutral: 'bg-ink-faint', negative: 'bg-error' };
const INTENT_TONE = { sales: 'info', complaint: 'error', question: 'default', spam: 'warning' };

const QUEUES = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread', test: (c) => c.unread },
  { id: 'sales', label: 'Sales intent', test: (c) => c.intent === 'sales' },
  { id: 'complaints', label: 'Complaints', test: (c) => c.intent === 'complaint' },
  { id: 'mentions', label: 'Mentions', test: (c) => c.kind === 'mention' },
];

export default function Inbox() {
  const { workspace } = useWorkspace();
  const { data: all = [] } = useConversations(workspace);
  const [queue, setQueue] = useState('all');
  const [draft, setDraft] = useState('');
  const list = useMemo(() => {
    const q = QUEUES.find((x) => x.id === queue);
    return q?.test ? all.filter(q.test) : all;
  }, [all, queue]);
  const [selId, setSelId] = useState(null);
  const active = all.find((c) => c.id === selId) || list[0];

  const navigate = useNavigate();
  const invalidate = () => ['conversations', workspace?.id];
  const reply = useInvalidatingMutation(({ id, text }) => effyApi.replyConversation(id, text), invalidate);
  const close = useInvalidatingMutation((id) => effyApi.closeConversation(id), invalidate);
  const convert = useInvalidatingMutation((id) => effyApi.convertLead(id), () => ['leads', workspace?.id]);

  const convertToLead = async () => {
    if (!active) return;
    await convert.mutateAsync(active.id);
    navigate('/app/pipeline');
  };

  const sendReply = (text) => {
    if (!active || !text.trim()) return;
    reply.mutate({ id: active.id, text: text.trim() });
    setDraft('');
  };

  return (
    <div>
      <PageHeader title="Unified Inbox" subtitle="Every comment, DM, mention and review — in one queue." />
      <div className="grid grid-cols-1 lg:grid-cols-[180px_minmax(280px,340px)_1fr] gap-4">
        {/* queues */}
        <Card className="p-2 h-max">
          <ul className="space-y-0.5">
            {QUEUES.map((q) => {
              const count = q.test ? all.filter(q.test).length : all.length;
              return (
                <li key={q.id}>
                  <button onClick={() => setQueue(q.id)} className={cn('w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition',
                    queue === q.id ? 'bg-coral-soft text-coral-ink' : 'text-ink-soft hover:bg-surface2')}>
                    {q.label}<span className="text-xs text-ink-faint tabular-nums">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* conversation list */}
        <Card className="p-1.5 h-max max-h-[72vh] overflow-y-auto">
          {list.length ? list.map((c) => (
            <button key={c.id} onClick={() => setSelId(c.id)} className={cn('w-full text-left flex gap-2.5 p-3 rounded-lg transition', active?.id === c.id ? 'bg-surface2' : 'hover:bg-surface2/60')}>
              <ChannelIcon channel={c.channel} className="w-7 h-7 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className={cn('w-1.5 h-1.5 rounded-full', SENT_DOT[c.sentiment])} />
                  <span className="text-sm font-semibold text-ink truncate flex-1">{c.person}</span>
                  {c.unread && <span className="w-2 h-2 rounded-full bg-coral shrink-0" />}
                </span>
                <span className="block text-xs text-ink-soft truncate mt-0.5">{c.messages[0].text}</span>
                <span className="block text-[0.68rem] text-ink-faint mt-0.5">{c.messages[0].time}</span>
              </span>
            </button>
          )) : <div className="p-6"><EmptyState icon="📭" title="Queue empty" body="Nothing here right now." /></div>}
        </Card>

        {/* conversation detail */}
        {active ? (
          <Card className="p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-line">
              <div className="flex items-center gap-3">
                <ChannelIcon channel={active.channel} className="w-9 h-9" />
                <div>
                  <div className="font-bold text-ink">{active.person}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge tone={INTENT_TONE[active.intent]}>{active.intent}</Badge>
                    <Badge>{active.sentiment}</Badge>
                  </div>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-ink-faint"><Clock className="w-3.5 h-3.5" /> SLA 2h</span>
            </div>

            <div className="flex-1 py-4 space-y-3 min-h-[160px]">
              {active.messages.map((m, i) => (
                <div key={i} className={cn('max-w-[80%] p-3 rounded-xl text-sm', m.from === 'them' ? 'bg-surface2 text-ink' : 'bg-coral text-white ml-auto')}>
                  {m.text}
                  <div className={cn('text-[0.65rem] mt-1', m.from === 'them' ? 'text-ink-faint' : 'text-white/70')}>{m.time}</div>
                </div>
              ))}
            </div>

            {active.suggestedReply ? (
              <div className="p-3 rounded-lg bg-coral-soft/50 border border-coral-soft mb-3">
                <div className="flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-coral-ink" /><span className="text-xs font-bold text-ink">AI suggested reply</span>{active.intent === 'complaint' && <Badge tone="error">routed to human</Badge>}</div>
                <p className="text-sm text-ink-soft">{active.suggestedReply}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" disabled={reply.isPending} onClick={() => sendReply(active.suggestedReply)}><Check className="w-3.5 h-3.5" /> Use</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDraft(active.suggestedReply)}>Edit</Button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-warning-soft text-warning text-sm mb-3">Detected as spam — no auto-reply suggested.</div>
            )}

            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendReply(draft)}
                placeholder="Write a reply…"
                className="flex-1 rounded-sm border border-line bg-surface px-3 py-2 text-sm"
              />
              <Button disabled={reply.isPending} onClick={() => sendReply(draft)}>
                <CornerUpLeft className="w-4 h-4" /> {reply.isPending ? 'Sending…' : 'Reply'}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-line text-sm">
              <Button size="sm" variant="ghost" disabled={convert.isPending} onClick={convertToLead}>
                <UserPlus className="w-3.5 h-3.5" /> {convert.isPending ? 'Converting…' : 'Convert to lead'}
              </Button>
              <Button size="sm" variant="ghost"><Tag className="w-3.5 h-3.5" /> Tag</Button>
              <Button size="sm" variant="ghost"><ArrowUpRight className="w-3.5 h-3.5" /> Escalate</Button>
              <Button size="sm" variant="ghost" className="ml-auto" disabled={close.isPending} onClick={() => close.mutate(active.id)}>
                <Check className="w-3.5 h-3.5" /> {active.status === 'closed' ? 'Closed' : 'Close'}
              </Button>
            </div>
          </Card>
        ) : <Card className="p-8"><EmptyState icon="💬" title="Select a conversation" /></Card>}
      </div>
    </div>
  );
}
