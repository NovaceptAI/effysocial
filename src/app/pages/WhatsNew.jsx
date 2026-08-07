import React from 'react';
import { Sparkles } from 'lucide-react';
import { PageHeader, Card, Badge } from '../../ui';

// Lightweight in-app changelog. Newest first — update as we ship.
const ENTRIES = [
  { date: 'Jul 2026', tag: 'New', items: [
    'Website Builder — generate a multi-page site from your Brand Brain, themed with your logo colours.',
    'Brand Brain — full editor for all 12 sections, “Draft with AI” per section, and logo upload that learns your colours.',
  ]},
  { date: 'Jul 2026', tag: 'Improved', items: [
    'Ideas & Campaigns now get brand-grounded AI suggestions.',
    'Trends, Playbooks and Studio are shaped by your Brand Brain.',
  ]},
];

export default function WhatsNew() {
  return (
    <div>
      <PageHeader title="What's New" subtitle="The latest features and improvements in EffySocial." />
      <div className="space-y-4 max-w-2xl">
        {ENTRIES.map((e, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Badge tone={e.tag === 'New' ? 'coral' : 'success'}><Sparkles className="w-3 h-3" /> {e.tag}</Badge>
              <span className="text-xs text-ink-faint">{e.date}</span>
            </div>
            <ul className="space-y-2 text-sm text-ink-soft list-disc pl-4">
              {e.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
