import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Search, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { TEMPLATES, TEMPLATE_GOALS, templatesFor } from '../templates';
import { PageHeader, Card, Badge, Button, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

// A template is a proven SHAPE for a post, not words. Picking one opens AI Studio in
// that format with the brief already written, so the copy comes from this workspace's
// Brand Brain — the same template reads differently for a dentist and a roofer (G39).
const FORMAT_LABELS = {
  ig_post: 'Instagram Post', ig_reel: 'Instagram Reel', ig_carousel: 'Carousel',
  wa_promo: 'WhatsApp', li_post: 'LinkedIn Post',
};

export default function Templates() {
  const { workspace, canWrite } = useWorkspace();
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [q, setQ] = useState('');
  const shown = useMemo(() => templatesFor(goal, q), [goal, q]);

  const use = (t) => navigate(`/app/studio?${new URLSearchParams({ format: t.format, topic: t.brief, template: t.id })}`);

  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle={`Proven shapes for a post. Effy writes each one in ${workspace.name}'s own voice.`}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search templates"
            placeholder="Search templates" className="w-full rounded-2xl bg-surface2 pl-11 pr-4 py-2.5 text-sm shadow-e1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...TEMPLATE_GOALS].map((g) => {
            const on = g === 'All' ? !goal : goal === g;
            return (
              <button key={g} onClick={() => setGoal(g === 'All' ? '' : g)} aria-pressed={on}
                className={cn('px-4 py-1.5 rounded-full text-sm font-semibold transition',
                  on ? 'bg-rail-active text-rail-active-ink' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon="🔍" title="No templates match" body="Try another word, or clear the filter to see all templates."
          action={<Button variant="secondary" onClick={() => { setQ(''); setGoal(''); }}>Show all {TEMPLATES.length}</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col" role="article" aria-label={t.name}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge tone="new">{t.goal}</Badge>
                <span className="text-[0.7rem] text-ink-faint font-semibold">{FORMAT_LABELS[t.format] || t.format}</span>
              </div>
              <h3 className="font-display text-lg font-semibold tracking-tight">{t.name}</h3>
              <ol className="mt-3 mb-4 space-y-1.5 text-xs text-ink-soft flex-1">
                {t.structure.map((step, i) => (
                  <li key={step} className="flex gap-2">
                    <span className="grid place-items-center w-4 h-4 mt-0.5 shrink-0 rounded-full bg-surface2 text-[0.6rem] font-bold text-ink-faint">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <Button size="sm" disabled={!canWrite} onClick={() => use(t)}>
                <Wand2 className="w-3.5 h-3.5" /> Use this template <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-ink-faint">
        Templates set the structure only. Every line is written from your Brand Brain when Studio drafts it, so nothing here claims anything about your business.
      </p>
    </div>
  );
}
