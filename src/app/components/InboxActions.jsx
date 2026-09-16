import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Plus, ArrowUpRight, Loader2 } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Button, Card } from '../../ui';

// Tag and Escalate for one conversation (launch plan 5.8, G31).
export const SUGGESTED_TAGS = ['follow up', 'pricing', 'VIP', 'site visit', 'refund'];
export const TAG_LENGTH = 24;
export const MAX_TAGS = 8;

export function TagEditor({ conversation, knownTags, onSave, onClose }) {
  const [tags, setTags] = useState(conversation.tags || []);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const has = (t) => tags.some((x) => x.toLowerCase() === t.toLowerCase());
  const suggestions = useMemo(
    () => [...new Set([...knownTags, ...SUGGESTED_TAGS])].filter((t) => !has(t)).slice(0, 8),
    [knownTags, tags], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const add = (raw) => {
    const t = raw.replace(/\s+/g, ' ').trim();
    setError('');
    if (!t || has(t)) { setText(''); return; }
    if (t.length > TAG_LENGTH) { setError(`Keep each tag to ${TAG_LENGTH} characters.`); return; }
    if (tags.length >= MAX_TAGS) { setError(`A conversation can have up to ${MAX_TAGS} tags.`); return; }
    setTags([...tags, t]);
    setText('');
  };

  const save = async () => {
    setBusy(true); setError('');
    try {
      await onSave(tags);
      onClose();
    } catch (e) {
      setError(e.message || 'Could not save the tags.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-3 mt-3 border border-line" role="dialog" aria-label={`Tags for ${conversation.person}`}>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[1.75rem]">
        {tags.length ? tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-info-soft text-info px-2.5 py-1 text-xs font-semibold">
            {t}
            <button type="button" aria-label={`Remove tag ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
          </span>
        )) : <span className="text-xs text-ink-faint">No tags yet.</span>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} aria-label="New tag" placeholder="Add a tag"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(text); } }}
          className="flex-1 rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm" />
        <Button size="sm" variant="secondary" onClick={() => add(text)}><Plus className="w-3.5 h-3.5" /> Add</Button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.map((t) => (
            <button key={t} type="button" onClick={() => add(t)}
              className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-soft hover:text-ink hover:border-line-strong">+ {t}</button>
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-xs text-error mt-2">{error}</p>}
      <div className="flex justify-end gap-2 mt-3">
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save tags'}</Button>
      </div>
    </Card>
  );
}

export function EscalateDialog({ conversation, me, onEscalate, onClose }) {
  const { data: members, isLoading } = useQuery({ queryKey: ['team-members'], queryFn: () => effyApi.listTeam() });
  const people = (members || []).filter((m) => m.status === 'active');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!to) { setError('Choose who should deal with it.'); return; }
    if (!note.trim()) { setError('Say why it needs them — add a note.'); return; }
    setBusy(true);
    try {
      await onEscalate(Number(to), note.trim());
      onClose();
    } catch (e) {
      setError(e.message || 'Could not escalate this conversation.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-3 mt-3 border border-line" role="dialog" aria-label={`Escalate ${conversation.person}`}>
      <h4 className="text-sm font-bold text-ink mb-2 flex items-center gap-1.5"><ArrowUpRight className="w-4 h-4 text-error" /> Escalate to a teammate</h4>
      {isLoading ? (
        <p className="text-xs text-ink-faint flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your team…</p>
      ) : (
        <>
          <label className="block text-xs font-semibold text-ink-faint mb-1" htmlFor="escalate-to">Who should deal with it</label>
          <select id="escalate-to" value={to} onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm mb-2">
            <option value="">Choose a teammate…</option>
            {people.map((m) => (
              <option key={m.userId} value={m.userId}>{m.name || m.email}{m.userId === me ? ' (you)' : ''} — {m.role}</option>
            ))}
          </select>
          <label className="block text-xs font-semibold text-ink-faint mb-1" htmlFor="escalate-note">Why it needs them</label>
          <textarea id="escalate-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500}
            placeholder="e.g. Third leak on this job — needs a site visit today"
            className="w-full rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm resize-none" />
          <p className="text-[0.7rem] text-ink-faint mt-1">It becomes urgent, is assigned to them, and stays in the notification bell until someone resolves it.</p>
        </>
      )}
      {error && <p role="alert" className="text-xs text-error mt-2">{error}</p>}
      <div className="flex justify-end gap-2 mt-3">
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={submit} disabled={busy || isLoading}>{busy ? 'Escalating…' : 'Escalate'}</Button>
      </div>
    </Card>
  );
}
