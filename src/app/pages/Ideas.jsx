import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wand2, ArrowRight, ArrowLeft, Flame, Plus, Trash2, Lightbulb, Swords, Sparkles, Loader2, Check, X,
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
  ai: { label: 'AI', icon: Sparkles, tone: 'coral' },
};

export default function Ideas() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState('');

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

  const generate = async () => {
    setGenBusy(true); setGenError('');
    try { setSuggestions(await effyApi.generateIdeas(workspace.id)); }
    catch (e) { setGenError(e.message || 'Could not generate ideas.'); }
    finally { setGenBusy(false); }
  };
  const addSuggestion = useMutation({
    mutationFn: (s) => effyApi.createIdea({
      workspace: workspace.id, title: s.title, source: 'ai',
      notes: [s.angle, s.format && `Format: ${s.format}`].filter(Boolean).join(' · '),
    }),
    onSuccess: (_d, s) => { setSuggestions((prev) => prev.filter((x) => x !== s)); invalidate(); },
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
        subtitle="Capture ideas, shape them, and send the best to Studio."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="spark" onClick={generate} disabled={genBusy}>
              {genBusy ? <><Loader2 className="w-4 h-4 animate-spin" /> Thinking…</> : <><Sparkles className="w-4 h-4" /> Generate with AI</>}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app/trends')}><Flame className="w-4 h-4" /> Browse trends</Button>
          </div>
        }
      />

      {/* AI suggestions — grounded in Brand Brain; save the ones you like */}
      {(suggestions.length > 0 || genError) && (
        <div className="rounded-2xl border border-coral/20 bg-coral-tint/50 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-ink flex items-center gap-2"><Sparkles className="w-4 h-4 text-coral-ink" /> Brand-Brain ideas</h3>
            {suggestions.length > 0 && (
              <button onClick={() => setSuggestions([])} className="text-xs font-bold text-ink-soft bg-transparent hover:text-ink inline-flex items-center gap-1"><X className="w-3.5 h-3.5" /> Dismiss</button>
            )}
          </div>
          {genError && <p className="text-sm text-error mb-2">{genError}</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-surface rounded-xl shadow-e1 p-3.5 flex flex-col">
                <div className="text-sm font-semibold text-ink leading-snug mb-1">{s.title}</div>
                {s.angle && <p className="text-xs text-ink-soft leading-relaxed mb-2 flex-1">{s.angle}</p>}
                <div className="flex items-center justify-between gap-2 mt-auto">
                  {s.format ? <Badge tone="default">{s.format}</Badge> : <span />}
                  <Button size="sm" variant="primary" onClick={() => addSuggestion.mutate(s)} disabled={addSuggestion.isPending}>
                    <Check className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
