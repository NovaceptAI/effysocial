import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wand2, ArrowRight, ArrowLeft, Flame, Plus, Trash2, Lightbulb, Swords,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const COLUMNS = [
  { key: 'captured', label: 'Captured', hint: 'Raw ideas to sort later' },
  { key: 'developing', label: 'Developing', hint: 'Being shaped up' },
  { key: 'ready', label: 'Ready', hint: 'Ready to create' },
];
const STAGE_ORDER = COLUMNS.map((c) => c.key);
const SOURCE_META = {
  trend: { label: 'Trend', icon: Flame, tone: 'warning' },
  competitor: { label: 'Competitor', icon: Swords, tone: 'info' },
  inbox: { label: 'Inbox', icon: Lightbulb, tone: 'default' },
  manual: { label: 'Idea', icon: Lightbulb, tone: 'default' },
};

export default function Ideas() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');

  const key = ['ideas', workspace?.id];
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: key, queryFn: () => effyApi.listIdeas(workspace.id), enabled: !!workspace,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const addIdea = useMutation({
    mutationFn: () => effyApi.createIdea({ workspace: workspace.id, title: title.trim() }),
    onSuccess: () => { setTitle(''); invalidate(); },
  });
  const moveIdea = useMutation({
    mutationFn: ({ id, stage }) => effyApi.updateIdea(id, { workspace: workspace.id, stage }),
    onSuccess: invalidate,
  });
  const removeIdea = useMutation({
    mutationFn: (id) => effyApi.deleteIdea(id),
    onSuccess: invalidate,
  });

  const createInStudio = (idea) => {
    const topic = idea.notes ? `${idea.title} — ${idea.notes}` : idea.title;
    navigate(`/app/studio?topic=${encodeURIComponent(topic)}`);
  };

  const byStage = (stage) => ideas.filter((i) => i.stage === stage);

  return (
    <div>
      <PageHeader
        title="Ideas"
        subtitle="Your content backlog — capture ideas from trends and mentions, shape them, then send the best to AI Studio."
        actions={<Button variant="secondary" onClick={() => navigate('/app/trends')}><Flame className="w-4 h-4" /> Browse trends</Button>}
      />

      {/* quick capture */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (title.trim()) addIdea.mutate(); }}
        className="flex gap-2 mb-6"
      >
        <input
          value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Capture a content idea… e.g. Myth-busting Reel on flossing"
          className="flex-1 rounded-xl bg-surface2 px-4 py-3 text-sm shadow-e1"
        />
        <Button type="submit" disabled={!title.trim() || addIdea.isPending}>
          <Plus className="w-4 h-4" /> Add idea
        </Button>
      </form>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-64 rounded-2xl bg-surface2 animate-pulse" />)}
        </div>
      ) : ideas.length === 0 ? (
        <div className="rounded-2xl bg-surface shadow-e1 p-10 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-coral-ink mx-auto mb-4"><Lightbulb className="w-6 h-6" /></div>
          <h3 className="font-display text-xl font-semibold tracking-tight mb-1.5">Start your idea backlog</h3>
          <p className="text-sm text-ink-soft leading-relaxed max-w-md mx-auto mb-5">
            Add an idea above, or save one straight from Trends. Ideas move Captured → Developing → Ready, then one click sends them to Studio to draft.
          </p>
          <Button variant="secondary" onClick={() => navigate('/app/trends')}><Flame className="w-4 h-4" /> See what's trending</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 items-start">
          {COLUMNS.map((col) => {
            const items = byStage(col.key);
            return (
              <div key={col.key} className="bg-surface2/40 rounded-2xl p-3">
                <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                  <div>
                    <h3 className="font-bold text-ink text-sm">{col.label}</h3>
                    <p className="text-[0.7rem] text-ink-faint">{col.hint}</p>
                  </div>
                  <Badge>{items.length}</Badge>
                </div>
                <div className="space-y-2.5">
                  {items.map((idea) => {
                    const meta = SOURCE_META[idea.source] || SOURCE_META.manual;
                    const idx = STAGE_ORDER.indexOf(idea.stage);
                    return (
                      <div key={idea.id} className="bg-surface rounded-xl shadow-e1 p-3.5">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="flex-1 text-sm font-semibold text-ink leading-snug">{idea.title}</span>
                          <button onClick={() => removeIdea.mutate(idea.id)} title="Delete"
                            className="shrink-0 text-ink-faint hover:text-error transition"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        {idea.notes && <p className="text-xs text-ink-soft leading-relaxed mb-2 line-clamp-3">{idea.notes}</p>}
                        <div className="flex items-center gap-1.5 mb-3">
                          <Badge tone={meta.tone}><meta.icon className="w-3 h-3" /> {meta.label}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => moveIdea.mutate({ id: idea.id, stage: STAGE_ORDER[idx - 1] })}
                            disabled={idx === 0}
                            className="grid place-items-center w-7 h-7 rounded-lg bg-surface2 text-ink-soft hover:text-ink disabled:opacity-30 transition"
                            title="Move back"><ArrowLeft className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={() => moveIdea.mutate({ id: idea.id, stage: STAGE_ORDER[idx + 1] })}
                            disabled={idx === STAGE_ORDER.length - 1}
                            className="grid place-items-center w-7 h-7 rounded-lg bg-surface2 text-ink-soft hover:text-ink disabled:opacity-30 transition"
                            title="Move forward"><ArrowRight className="w-3.5 h-3.5" /></button>
                          <div className="flex-1" />
                          <Button size="sm" variant={col.key === 'ready' ? 'primary' : 'secondary'} onClick={() => createInStudio(idea)}>
                            <Wand2 className="w-3.5 h-3.5" /> Studio
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="text-xs text-ink-faint text-center py-6">Nothing here yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
