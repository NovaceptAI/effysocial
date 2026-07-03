import React, { useState } from 'react';
import { Plus, TrendingUp, MessageSquare, PenLine, Wand2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { IDEA_STAGES, ideasFor } from '../data/contentData';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const SOURCE = { trend: TrendingUp, mention: MessageSquare, manual: PenLine };

export default function Ideas() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState(() => ideasFor(workspace));
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const move = (id, dir) => setIdeas((prev) => prev.map((i) => {
    if (i.id !== id) return i;
    const idx = IDEA_STAGES.indexOf(i.stage) + dir;
    return { ...i, stage: IDEA_STAGES[Math.max(0, Math.min(IDEA_STAGES.length - 1, idx))] };
  }));

  const add = () => {
    if (!title.trim()) return;
    setIdeas((p) => [{ id: `i${Date.now()}`, title: title.trim(), note: '', stage: 'Captured', source: 'manual', assignee: workspace.manager, due: '—' }, ...p]);
    setTitle(''); setAdding(false);
  };

  return (
    <div>
      <PageHeader
        title="Ideas"
        subtitle="Capture inspiration and move it toward production."
        actions={<Button onClick={() => setAdding((v) => !v)}><Plus className="w-4 h-4" /> Quick idea</Button>}
      />

      {adding && (
        <Card className="p-3 mb-4 flex gap-2">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="What's the idea?" className="flex-1 rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
          <Button onClick={add}>Add</Button>
        </Card>
      )}

      <div className="grid gap-3 overflow-x-auto pb-2" style={{ gridTemplateColumns: `repeat(${IDEA_STAGES.length}, minmax(230px, 1fr))` }}>
        {IDEA_STAGES.map((stage) => {
          const items = ideas.filter((i) => i.stage === stage);
          return (
            <div key={stage} className="min-w-0">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">{stage}</span>
                <span className="text-xs text-ink-faint tabular-nums">{items.length}</span>
              </div>
              <div className="space-y-2.5 min-h-[80px] rounded-xl bg-surface2/50 p-2">
                {items.map((i) => {
                  const Src = SOURCE[i.source] || PenLine;
                  return (
                    <Card key={i.id} className="p-3 shadow-e1">
                      <div className="flex items-start gap-2">
                        <Src className="w-3.5 h-3.5 text-coral-ink shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-ink leading-snug">{i.title}</div>
                          {i.note && <div className="text-xs text-ink-faint mt-0.5 line-clamp-2">{i.note}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {i.campaign && <Badge tone="new">{i.campaign}</Badge>}
                        <span className="text-[0.68rem] text-ink-faint">{i.assignee} · {i.due}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-line">
                        <button onClick={() => move(i.id, -1)} disabled={i.stage === IDEA_STAGES[0]}
                          className="text-ink-faint hover:text-ink disabled:opacity-30 rotate-180"><ChevronRight className="w-4 h-4" /></button>
                        <button onClick={() => move(i.id, 1)} disabled={i.stage === IDEA_STAGES.at(-1)}
                          className="text-ink-faint hover:text-ink disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                        <button onClick={() => navigate('/app/studio')} className="ml-auto flex items-center gap-1 text-[0.7rem] font-bold text-coral-ink">
                          <Wand2 className="w-3 h-3" /> Create
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
