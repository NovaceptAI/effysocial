import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Flame, Hash, Clapperboard, AlertTriangle, CalendarDays, Plus, Check } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';
import SourceNote from '../components/SourceNote';

const HEAT = { hot: 'text-error', warm: 'text-warning' };
const EMPTY = { trending: [], hashtags: [], formats: [], gaps: [], seasonal: [], basis: {} };

export default function Trends() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const [saved, setSaved] = useState({});   // topic → true once saved as idea
  const { data: t = EMPTY, isLoading, isError, refetch } = useQuery({
    queryKey: ['trends', workspace?.id],
    queryFn: () => effyApi.strategyTrends(workspace.id),
    enabled: !!workspace,
  });

  const saveIdea = useMutation({
    mutationFn: (x) => effyApi.createIdea({ workspace: workspace.id, title: x.topic, notes: x.why || '', source: 'trend', heat: x.heat || '' }),
    onSuccess: (_d, x) => setSaved((s) => ({ ...s, [x.topic]: true })),
  });
  const createPost = (x) => navigate(`/app/studio?topic=${encodeURIComponent(x.topic)}&trend=${encodeURIComponent(x.topic)}`);

  return (
    <div>
      <PageHeader title="Trends" subtitle="Themes to post about, gaps in your content and seasonal moments — each says where it comes from." />

      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 rounded-2xl bg-surface2 animate-pulse" />
          <div className="space-y-4">
            <div className="h-28 rounded-2xl bg-surface2 animate-pulse" />
            <div className="h-28 rounded-2xl bg-surface2 animate-pulse" />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <Card className="p-6 text-center">
          <AlertTriangle className="w-5 h-5 text-warning mx-auto mb-2" />
          <p className="text-sm text-ink-soft mb-3">Couldn't load trends for this workspace.</p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
        </Card>
      )}

      {!isLoading && !isError && (<>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="font-bold text-ink">Suggested themes</h3>
            <Badge tone={t.provider === 'brand' ? 'info' : 'default'}>{t.provider === 'brand' ? 'AI suggestions' : 'General guidance'}</Badge>
          </div>
          <div className="space-y-2.5">
            {t.trending.map((x) => (
              <div key={x.topic} className="flex items-start gap-3 p-3 rounded-lg border border-line hover:border-coral transition">
                <Flame className={cn('w-4 h-4 shrink-0 mt-0.5', HEAT[x.heat])} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink">{x.topic}</div>
                  <div className="text-xs text-ink-faint">{x.why}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="ghost" disabled={saved[x.topic] || saveIdea.isPending} onClick={() => saveIdea.mutate(x)}>
                    {saved[x.topic] ? <><Check className="w-3.5 h-3.5" /> Saved</> : <><Plus className="w-3.5 h-3.5" /> Idea</>}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => createPost(x)}>Create post</Button>
                </div>
              </div>
            ))}
          </div>
          <SourceNote basis={t.basis.trending} />
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-ink mb-2 text-sm flex items-center gap-1.5"><Hash className="w-4 h-4" /> Suggested hashtags</h3>
            <div className="flex flex-wrap gap-1.5">{t.hashtags.map((h) => <Badge key={h} tone="new">#{h}</Badge>)}</div>
            <SourceNote basis={t.basis.hashtags} />
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-ink mb-2 text-sm flex items-center gap-1.5"><Clapperboard className="w-4 h-4" /> Formats to try</h3>
            {t.yourBestFormat && (
              <div className="mb-2 rounded-lg bg-success-soft/60 px-3 py-2 text-sm" role="region" aria-label="Your best format">
                <span className="font-semibold text-ink">Your best so far: {t.yourBestFormat.label}</span>
                <span className="text-ink-soft"> · {t.yourBestFormat.engagement}% engagement</span>
                <SourceNote basis={t.yourBestFormat.basis} className="mt-1" />
              </div>
            )}
            <ul className="space-y-1.5 text-sm text-ink-soft">{t.formats.map((f) => <li key={f}>• {f}</li>)}</ul>
            <SourceNote basis={t.basis.formats} />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3 text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-warning" /> Content gaps</h3>
          <ul className="space-y-1.5 text-sm text-ink-soft">{t.gaps.map((g) => <li key={g}>• {g}</li>)}</ul>
          <SourceNote basis={t.basis.gaps} />
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3 text-sm flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-coral-ink" /> Seasonal opportunities</h3>
          <div className="flex flex-wrap gap-2">{t.seasonal.map((s, i) => <Badge key={s} tone={i === 0 ? 'coral' : 'default'}>{s}</Badge>)}</div>
          <SourceNote basis={t.basis.seasonal} />
        </Card>
      </div>
      </>)}
    </div>
  );
}
