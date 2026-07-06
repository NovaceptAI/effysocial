import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Flame, Swords, ArrowRight, Wand2, CalendarCheck, Rocket, Target, Repeat, Lock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

// The connected steps a playbook chains — shown so the workflow is legible.
const STEPS = [
  { icon: Flame, label: 'Trends & Competitors' },
  { icon: Wand2, label: 'AI Studio (grounded)' },
  { icon: CalendarCheck, label: 'Calendar' },
  { icon: Sparkles, label: 'Approval' },
];

const OTHER_PLAYBOOKS = [
  { icon: Target, title: 'Winning post → Ad', body: 'Take a top-performing post and turn it into an ad creative + campaign.' },
  { icon: Repeat, title: 'Competitor Response', body: 'A rival moves → draft an on-brand counter-angle → schedule.' },
];

// Compose angle cards from REAL strategy data (trends × competitor gaps × brand).
function buildAngles(ctx, trends) {
  if (!ctx) return [];
  const cards = [];
  (ctx.trends || []).slice(0, 3).forEach((t) => {
    cards.push({
      trend: t.topic, heat: t.heat,
      angle: `A ${t.heat === 'hot' ? 'timely' : 'fresh'} take on "${t.topic}" in your brand voice.`,
      topic: t.topic,
    });
  });
  (ctx.competitorAngles || []).slice(0, 2).forEach((a) => {
    cards.push({ trend: 'Differentiation', heat: 'warm', angle: a, topic: a });
  });
  (trends?.gaps || []).slice(0, 2).forEach((g) => {
    cards.push({ trend: 'Content gap', heat: 'gap', angle: g, topic: g });
  });
  return cards;
}

export default function Playbooks() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  const { data: ctx, isLoading } = useQuery({
    queryKey: ['studio-context', workspace?.id],
    queryFn: () => effyApi.studioContext(workspace.id),
    enabled: !!workspace,
  });
  const { data: trends } = useQuery({
    queryKey: ['trends', workspace?.id],
    queryFn: () => effyApi.strategyTrends(workspace.id),
    enabled: !!workspace,
  });

  const angles = buildAngles(ctx, trends);

  const createInStudio = (card) => {
    const qs = new URLSearchParams({ trend: card.trend, angle: card.angle, topic: card.topic });
    navigate(`/app/studio?${qs.toString()}`);
  };

  return (
    <div>
      <PageHeader
        title="Playbooks"
        subtitle="Guided workflows that chain your modules — context flows from strategy to published."
        actions={<Button onClick={() => navigate('/app/launch')}><Rocket className="w-4 h-4" /> Launch a campaign</Button>}
      />

      {/* Content Sprint — the active playbook */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-aurora text-white shadow-coral"><Sparkles className="w-5 h-5" /></span>
              <h2 className="font-display text-xl font-semibold tracking-tight">Weekly Content Sprint</h2>
              <Badge tone="success">Active</Badge>
            </div>
            <p className="text-sm text-ink-soft mt-1.5">Turn this week's trends + competitor gaps into on-brand posts — grounded, scored and ready to approve.</p>
          </div>
        </div>

        {/* the chain */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.label}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card-sheen border border-hair shadow-e1 text-xs font-bold text-ink">
                <s.icon className="w-3.5 h-3.5 text-coral-ink" /> {s.label}
              </span>
              {i < STEPS.length - 1 && <ArrowRight className="w-4 h-4 text-coral/50" />}
            </React.Fragment>
          ))}
        </div>

        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-3">Suggested angles for this week</h3>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-xl bg-surface2 animate-pulse" />)}
          </div>
        ) : angles.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {angles.map((card, i) => (
              <div key={i} className="flex flex-col bg-card-sheen border border-hair rounded-xl shadow-e1 p-4 hover:shadow-e2 transition">
                <div className="flex items-center gap-1.5 mb-2">
                  {card.heat === 'gap'
                    ? <Swords className="w-3.5 h-3.5 text-info" />
                    : <Flame className={cn('w-3.5 h-3.5', card.heat === 'hot' ? 'text-error' : 'text-warning')} />}
                  <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">{card.trend}</span>
                </div>
                <p className="text-sm text-ink leading-snug flex-1">{card.angle}</p>
                <Button size="sm" className="mt-3 w-full" onClick={() => createInStudio(card)}>
                  <Wand2 className="w-3.5 h-3.5" /> Create in Studio <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="🎯" title="Strategy warming up" body="Connect channels or publish a few posts and your weekly angles will populate here." />
        )}
      </Card>

      {/* Coming-soon playbooks */}
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-3">More playbooks</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OTHER_PLAYBOOKS.map((p) => (
          <Card key={p.title} className="p-5 opacity-90">
            <div className="flex items-center justify-between mb-3">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-coral-tint text-coral-ink ring-1 ring-inset ring-coral/15"><p.icon className="w-5 h-5" /></span>
              <Badge><Lock className="w-3 h-3" /> Soon</Badge>
            </div>
            <h4 className="font-display text-lg font-semibold tracking-tight mb-1">{p.title}</h4>
            <p className="text-sm text-ink-soft leading-relaxed">{p.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
