import React, { useState } from 'react';
import { Sparkles, Loader2, Check, ArrowRight, Megaphone, CalendarPlus } from 'lucide-react';
import { useWorkspace, inr } from '../context/WorkspaceContext';
import { marketingPlan } from '../data/strategyData';
import { Card, PageHeader, Button, Badge, Pacing } from '../../ui';

export default function MarketingPlan() {
  const { workspace } = useWorkspace();
  const [generated, setGenerated] = useState(true); // demo: show a plan by default
  const [busy, setBusy] = useState(false);
  const plan = marketingPlan(workspace);

  const regen = () => { setBusy(true); setTimeout(() => { setBusy(false); setGenerated(true); }, 1200); };

  return (
    <div>
      <PageHeader
        title="Marketing Plan"
        subtitle={`AI-guided monthly strategy for ${workspace.name}`}
        actions={<Button variant="spark" onClick={regen} disabled={busy}>{busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Regenerate plan</>}</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* pillars */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-ink mb-4">Content pillars — planned vs actual</h3>
          <div className="space-y-3">
            {plan.pillars.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-ink">{p.name}</span>
                  <span className="text-ink-soft tabular-nums">{p.pct}% planned · {p.actual}% actual</span>
                </div>
                <div className="relative h-3 rounded-full bg-surface2 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full opacity-40" style={{ width: `${p.pct}%`, background: p.color }} />
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${p.actual}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* split + budget */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-ink mb-3">Organic vs paid</h3>
            <div className="flex h-4 rounded-full overflow-hidden mb-2">
              <div className="bg-dv-3" style={{ width: `${plan.split.organic}%` }} />
              <div className="bg-coral" style={{ width: `${plan.split.paid}%` }} />
            </div>
            <div className="flex justify-between text-xs text-ink-soft"><span>Organic {plan.split.organic}%</span><span>Paid {plan.split.paid}%</span></div>
            <div className="mt-4 pt-4 border-t border-line">
              <div className="text-xs text-ink-faint">Recommended monthly budget</div>
              <div className="text-2xl font-extrabold tabular-nums">{inr(plan.budget)}</div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-ink mb-2 text-sm">Posting frequency</h3>
            <p className="text-sm text-ink-soft">{plan.frequency}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{plan.platforms.map((p) => <Badge key={p} tone="new">{p}</Badge>)}</div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3">Campaign themes</h3>
          <ul className="space-y-2">
            {plan.themes.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm">
                <Megaphone className="w-4 h-4 text-coral-ink shrink-0" /><span className="flex-1">{t}</span>
                <Button size="sm" variant="ghost"><CalendarPlus className="w-3.5 h-3.5" /></Button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3">Suggested KPIs</h3>
          <ul className="space-y-2">{plan.kpis.map((k) => <li key={k} className="flex items-start gap-2 text-sm text-ink-soft"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> {k}</li>)}</ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3">Risks &amp; assumptions</h3>
          <ul className="space-y-2">{plan.risks.map((r) => <li key={r} className="text-sm text-ink-soft">• {r}</li>)}</ul>
        </Card>
      </div>

      <Card className="p-4 mt-4 flex items-center justify-between bg-coral-soft/40 border-coral-soft">
        <span className="text-sm text-ink font-semibold">Turn this plan into campaigns and a filled calendar.</span>
        <Button>Create campaigns <ArrowRight className="w-4 h-4" /></Button>
      </Card>
    </div>
  );
}
