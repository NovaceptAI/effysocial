import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plug, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { PageHeader, EmptyState, Button, Card, Badge } from '../../ui';
import { cn } from '../../lib/cn';

// Social Listening, part 1: comments on the connected Instagram account's posts and
// posts that tag it, pulled by the engine (listening.py) every 30 minutes or on Refresh.
// Sentiment and intent aren't worked out yet, so none are shown.
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'comment', label: 'Comments' },
  { id: 'mention', label: 'Tags' },
];
const when = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');

export default function SocialListening() {
  const { workspace, canWrite } = useWorkspace();
  const qc = useQueryClient();
  const key = ['listening', workspace?.id];
  const [filter, setFilter] = useState('all');
  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => effyApi.listening(workspace.id),
    enabled: !!workspace,
  });
  const refresh = useMutation({
    mutationFn: () => effyApi.refreshListening(workspace.id),
    onSuccess: (fresh) => qc.setQueryData(key, fresh),
  });

  const mentions = data?.mentions || [];
  const shown = filter === 'all' ? mentions : mentions.filter((m) => m.kind === filter);
  const count = (kind) => mentions.filter((m) => m.kind === kind).length;
  const notes = [data?.last?.commentsError && `Comments: ${data.last.commentsError}`,
    data?.last?.tagsError && `Tags: ${data.last.tagsError}`].filter(Boolean);

  const header = (
    <PageHeader
      title="Social Listening"
      subtitle={data?.username ? `Comments and tags on @${data.username}'s Instagram` : `What people say about ${workspace.name} on Instagram`}
      actions={data?.connected && canWrite ? (
        <Button variant="secondary" onClick={() => refresh.mutate()} disabled={refresh.isPending}>
          <RefreshCw className={cn('w-4 h-4', refresh.isPending && 'animate-spin')} /> {refresh.isPending ? 'Refreshing…' : 'Refresh'}
        </Button>
      ) : null}
    />
  );

  if (isLoading) return <div>{header}<p className="text-sm text-ink-soft">Loading…</p></div>;
  if (error) return <div>{header}<p role="alert" className="text-sm text-error">{error.message}</p></div>;

  if (!data?.connected) {
    return (
      <div>
        {header}
        <EmptyState
          icon="📡"
          title="Connect Instagram to start listening"
          body={`${data?.reason || "Instagram isn't connected."} Once it is, comments on your posts and posts that tag your account show up here.`}
          action={<Link to="/app/integrations"><Button><Plug className="w-4 h-4" /> Connect Instagram <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
        />
        {mentions.length > 0 && <p className="text-xs text-ink-faint mt-3">{mentions.length} saved from before are kept below.</p>}
        <MentionList mentions={mentions} />
      </div>
    );
  }

  return (
    <div>
      {header}
      {refresh.error && <p role="alert" className="text-sm text-error mb-3">{refresh.error.message}</p>}
      {notes.length > 0 && (
        <Card role="status" className="p-4 mb-4 bg-warning-soft text-sm">
          <div className="font-semibold mb-1">Instagram didn't share everything</div>
          <ul className="list-disc pl-5 space-y-0.5">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
          <Link to="/app/integrations" className="inline-block mt-2 font-semibold underline">Open Integrations</Link>
        </Card>
      )}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-medium border',
              filter === f.id ? 'bg-ink text-white border-ink' : 'bg-surface border-line text-ink-soft hover:text-ink')}
          >
            {f.label} ({f.id === 'all' ? mentions.length : count(f.id)})
          </button>
        ))}
        <span className="text-xs text-ink-faint ml-auto">
          {data.last?.syncedAt ? `Last checked ${when(data.last.syncedAt)} · checks every 30 minutes` : 'Not checked yet'}
        </span>
      </div>
      {shown.length === 0 ? (
        <EmptyState
          icon="💬"
          title={mentions.length ? 'Nothing here with this filter' : 'No comments or tags yet'}
          body={data.last?.syncedAt
            ? 'When someone comments on your recent posts or tags your account, it shows up here.'
            : canWrite ? 'Press Refresh to check Instagram now.' : 'EffySocial checks Instagram every 30 minutes.'}
        />
      ) : <MentionList mentions={shown} />}
    </div>
  );
}

function MentionList({ mentions }) {
  if (!mentions.length) return null;
  return (
    <ul className="space-y-3" aria-label="Mentions">
      {mentions.map((m) => (
        <li key={m.id}>
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{m.person ? `@${m.person}` : 'Someone'}</span>
              <Badge tone={m.kind === 'mention' ? 'info' : 'default'}>{m.kind === 'mention' ? 'Tagged you' : 'Comment'}</Badge>
              <span className="text-xs text-ink-faint">{when(m.at)}</span>
              {m.permalink && (
                <a href={m.permalink} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink">
                  View on Instagram <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="mt-2 text-sm whitespace-pre-line break-words">{m.text || <span className="text-ink-faint">No text</span>}</p>
            {m.post && <p className="mt-1 text-xs text-ink-faint truncate">On your post: {m.post}</p>}
          </Card>
        </li>
      ))}
    </ul>
  );
}
