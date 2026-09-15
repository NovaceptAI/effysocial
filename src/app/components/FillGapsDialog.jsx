import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Sparkles } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { dayLabel } from '../timezone';
import { Badge, Button, Card } from '../../ui';
import { ChannelIcon } from './parts';

const SOURCE = { plan: 'Marketing plan', ideas: 'Ideas board', ai: 'AI suggestion' };

// Calendar → Fill gaps: the engine finds the empty days in the stretch shown (at the
// marketing plan's cadence) and suggests a post for each; the ones kept are added
// to the calendar as ideas, ready to develop in AI Studio.
export default function FillGapsDialog({ open, onClose, from, to }) {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [keep, setKeep] = useState({});
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let live = true;
    setState({ loading: true, error: '', data: null }); setKeep({}); setAddError('');
    effyApi.fillGaps(workspace.id, from, to).then(
      (data) => { if (live) { setState({ loading: false, error: '', data }); setKeep(Object.fromEntries(data.suggestions.map((_, i) => [i, true]))); } },
      (e) => { if (live) setState({ loading: false, error: e.message || 'Could not look for gaps.', data: null }); },
    );
    return () => { live = false; };
  }, [open, workspace.id, from, to]);

  if (!open) return null;

  const suggestions = state.data?.suggestions || [];
  const chosen = suggestions.filter((_, i) => keep[i]);

  const add = async () => {
    setAdding(true); setAddError('');
    try {
      for (const s of chosen) {
        // eslint-disable-next-line no-await-in-loop
        await effyApi.createPost({ workspace: workspace.id, status: 'idea', title: s.title, channel: s.channel, type: s.type, date: s.date, time: s.time, caption: s.angle });
      }
      queryClient.invalidateQueries({ queryKey: ['posts', workspace.id] });
      onClose();
    } catch (e) {
      setAddError(e.message || 'Could not add them. Try again.');
      queryClient.invalidateQueries({ queryKey: ['posts', workspace.id] });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-labelledby="fill-gaps-title" className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="flex items-center justify-between mb-1">
          <h3 id="fill-gaps-title" className="font-extrabold text-ink flex items-center gap-2"><Sparkles className="w-4 h-4 text-coral-ink" /> Fill gaps</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>

        {state.loading ? (
          <p role="status" className="py-10 flex items-center justify-center gap-2 text-sm text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Finding empty days…</p>
        ) : state.error ? (
          <div role="alert" className="my-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{state.error}</div>
        ) : (
          <>
            <p className="text-sm text-ink-soft mb-4">
              {dayLabel(state.data.from)} to {dayLabel(state.data.to)}, at {state.data.perWeek} post{state.data.perWeek === 1 ? '' : 's'} a week.
              {' '}{suggestions.length ? 'Untick any you don’t want; the rest go on the calendar as ideas.' : ''}
            </p>
            {suggestions.length === 0 && state.data.unfilled === 0 && (
              <p className="text-sm text-ink-faint py-4">No gaps: this stretch already has a post every few days.</p>
            )}
            <ul className="divide-y divide-line/70">
              {suggestions.map((s, i) => (
                <li key={`${s.date}-${s.title}`} className="py-2.5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 accent-coral" checked={!!keep[i]} onChange={(e) => setKeep((k) => ({ ...k, [i]: e.target.checked }))} />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 text-xs text-ink-faint">
                        <span className="font-semibold text-ink-soft">{dayLabel(s.date)} · {s.time}</span>
                        <ChannelIcon channel={s.channel} className="w-4 h-4" /> {s.format}
                      </span>
                      <span className="block text-sm font-semibold text-ink">{s.title}</span>
                      {s.angle && <span className="block text-xs text-ink-faint">{s.angle}</span>}
                    </span>
                    <Badge tone={s.source === 'ai' ? 'new' : 'default'}>{SOURCE[s.source] || s.source}</Badge>
                  </label>
                </li>
              ))}
            </ul>
            {state.data.unfilled > 0 && (
              <p className="mt-3 text-xs text-ink-soft rounded-lg bg-warning-soft/60 px-3 py-2">
                {state.data.unfilled} more empty day{state.data.unfilled === 1 ? '' : 's'} need{state.data.unfilled === 1 ? 's' : ''} an idea, and AI suggestions aren’t available right now.
                {' '}Add ideas on the <Link to="/app/ideas" className="font-bold underline">Ideas board</Link> or create a <Link to="/app/plan" className="font-bold underline">marketing plan</Link>, then try again.
              </p>
            )}
            {addError && <div role="alert" className="mt-3 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{addError}</div>}
            <div className="flex justify-end gap-2 mt-5">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="button" disabled={!chosen.length || adding} onClick={add}>
                {adding ? 'Adding…' : `Add ${chosen.length} to calendar`}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
