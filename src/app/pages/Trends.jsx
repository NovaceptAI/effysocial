import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, Hash, Clapperboard, AlertTriangle, CalendarDays, Plus } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const HEAT = { hot: 'text-error', warm: 'text-warning' };
const EMPTY = { trending: [], hashtags: [], formats: [], gaps: [], seasonal: [] };

export default function Trends() {
  const { workspace } = useWorkspace();
  const { data: t = EMPTY } = useQuery({
    queryKey: ['trends', workspace?.id],
    queryFn: () => effyApi.strategyTrends(workspace.id),
    enabled: !!workspace,
  });

  return (
    <div>
      <PageHeader title="Trends" subtitle={`What's working in ${workspace.industry.toLowerCase()} right now`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-ink mb-3">Trending now</h3>
          <div className="space-y-2.5">
            {t.trending.map((x) => (
              <div key={x.topic} className="flex items-start gap-3 p-3 rounded-lg border border-line hover:border-coral transition">
                <Flame className={cn('w-4 h-4 shrink-0 mt-0.5', HEAT[x.heat])} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink">{x.topic}</div>
                  <div className="text-xs text-ink-faint">{x.why}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="ghost"><Plus className="w-3.5 h-3.5" /> Idea</Button>
                  <Button size="sm" variant="secondary">Create post</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-ink mb-2 text-sm flex items-center gap-1.5"><Hash className="w-4 h-4" /> Suggested hashtags</h3>
            <div className="flex flex-wrap gap-1.5">{t.hashtags.map((h) => <Badge key={h} tone="new">#{h}</Badge>)}</div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-ink mb-2 text-sm flex items-center gap-1.5"><Clapperboard className="w-4 h-4" /> Hot formats</h3>
            <ul className="space-y-1.5 text-sm text-ink-soft">{t.formats.map((f) => <li key={f}>• {f}</li>)}</ul>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3 text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-warning" /> Content gaps</h3>
          <ul className="space-y-1.5 text-sm text-ink-soft">{t.gaps.map((g) => <li key={g}>• {g}</li>)}</ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3 text-sm flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-coral-ink" /> Seasonal opportunities</h3>
          <div className="flex flex-wrap gap-2">{t.seasonal.map((s, i) => <Badge key={s} tone={i === 0 ? 'coral' : 'default'}>{s}</Badge>)}</div>
        </Card>
      </div>
    </div>
  );
}
