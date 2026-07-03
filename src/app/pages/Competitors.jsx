import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { competitors } from '../data/strategyData';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { ChannelDot } from '../components/parts';
import { cn } from '../../lib/cn';

export default function Competitors() {
  const { workspace } = useWorkspace();
  const rows = competitors(workspace);

  return (
    <div>
      <PageHeader title="Competitors" subtitle="Benchmark posting, engagement and share of voice" actions={<Button variant="secondary">+ Track competitor</Button>} />

      {/* share of voice */}
      <Card className="p-5 mb-4">
        <h3 className="font-bold text-ink mb-3">Estimated share of voice</h3>
        <div className="flex h-5 rounded-full overflow-hidden">
          {rows.map((r, i) => (
            <div key={r.name} className={cn('grid place-items-center text-[0.65rem] font-bold text-white', r.you ? 'bg-coral' : '')}
              style={{ width: `${r.sov}%`, background: r.you ? undefined : ['#475569', '#94a3b8'][i] }}>
              {r.sov}%
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-ink-soft">
          {rows.map((r) => <span key={r.name} className="flex items-center gap-1.5"><span className={cn('w-2.5 h-2.5 rounded-sm', r.you ? 'bg-coral' : 'bg-ink-faint')} /> {r.name}</span>)}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-faint border-b border-line">{['Competitor', 'Frequency', 'Platforms', 'Engagement', 'Top post', 'Current offer'].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={cn('border-b border-line/70 last:border-0', r.you && 'bg-coral-soft/30')}>
                <td className="px-4 py-3 font-semibold text-ink">{r.name}{r.you && <Badge tone="coral" className="ml-2">You</Badge>}</td>
                <td className="px-4 py-3 text-ink-soft">{r.freq}</td>
                <td className="px-4 py-3"><span className="flex gap-1">{r.platforms.map((p) => <ChannelDot key={p} channel={p} className="w-2.5 h-2.5" />)}</span></td>
                <td className="px-4 py-3 tabular-nums font-semibold">{r.engagement}%</td>
                <td className="px-4 py-3 text-ink-soft">{r.topPost}</td>
                <td className="px-4 py-3 text-ink-soft">{r.offers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-ink-faint mt-3">Based on public activity only — no private competitor data is implied.</p>
    </div>
  );
}
