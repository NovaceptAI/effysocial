import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CHANNELS } from '../constants';
import { usePosts } from '../api/hooks';
import { Card, PageHeader, EmptyState } from '../../ui';
import { ChannelIcon, PostStatus } from '../components/parts';
import { cn } from '../../lib/cn';

export default function Scheduled() {
  const { workspace } = useWorkspace();
  const { data: posts = [] } = usePosts(workspace);
  const all = posts.filter((p) => ['scheduled', 'approved', 'internal_review', 'client_review', 'draft'].includes(p.status));
  const [channel, setChannel] = useState('all');
  const items = all
    .filter((p) => channel === 'all' || p.channel === channel)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const channels = ['all', ...new Set(all.map((p) => p.channel))];

  return (
    <div>
      <PageHeader title="Scheduled" subtitle="Upcoming and in-progress content." />
      <div className="flex gap-1.5 mb-4">
        {channels.map((c) => (
          <button key={c} onClick={() => setChannel(c)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition',
              channel === c ? 'bg-coral text-white' : 'bg-surface2 text-ink-soft hover:text-ink')}>
            {c === 'all' ? 'All' : CHANNELS[c]?.label || c}
          </button>
        ))}
      </div>

      {items.length ? (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">
              {['', 'Post', 'When', 'Assignee', 'Status'].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                  <td className="px-4 py-3 w-8"><ChannelIcon channel={p.channel} /></td>
                  <td className="px-4 py-3"><span className="font-semibold text-ink">{p.title}</span><span className="block text-xs text-ink-faint capitalize">{p.type}</span></td>
                  <td className="px-4 py-3 text-ink-soft tabular-nums whitespace-nowrap">{p.date} · {p.time}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.assignee}</td>
                  <td className="px-4 py-3"><PostStatus status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : <EmptyState icon="🗓️" title="Nothing scheduled" body="Approve content and schedule it to see it here." />}
    </div>
  );
}
