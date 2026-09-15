import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, ImageIcon, Link2, ExternalLink, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { CHANNELS } from '../constants';
import { instagramCaptionProblem } from '../publishing';
import { orgZone, zoneLabel } from '../timezone';
import { Button, Card } from '../../ui';
import { PostStatus } from './parts';
import { cn } from '../../lib/cn';

const INPUT = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink';
const TYPES = [['post', 'Post'], ['reel', 'Reel'], ['carousel', 'Carousel'], ['story', 'Story'], ['video', 'Video']];
const EDITABLE = ['idea', 'draft', 'internal_review', 'client_review', 'approved', 'scheduled', 'failed'];

const blank = (initial) => ({
  title: '', channel: 'instagram', type: 'post', caption: '', mediaUrl: '', mediaKind: '', date: '', time: '', ...initial,
});
const fromPost = (p) => blank({
  title: p.title, channel: p.channel, type: p.type, caption: p.caption || '', mediaUrl: p.mediaUrl || '',
  mediaKind: p.mediaKind || '', date: p.date || '', time: p.time || '',
});

function MediaChooser({ value, kind, onChange }) {
  const { workspace } = useWorkspace();
  const [mode, setMode] = useState('');   // '' | 'library' | 'link'
  const [link, setLink] = useState('');
  const { data: media = [], isLoading } = useQuery({
    queryKey: ['library', workspace?.id],
    queryFn: () => effyApi.listMedia(workspace.id),
    enabled: !!workspace && mode === 'library',
  });

  return (
    <div>
      <span className="block text-xs font-semibold text-ink-soft mb-1">Image or video</span>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-line p-2">
          {kind === 'video'
            ? <video src={value} muted playsInline preload="metadata" className="w-16 h-16 rounded-md object-cover bg-surface2" aria-label="Chosen video" />
            : <img src={value} alt="Chosen media" className="w-16 h-16 rounded-md object-cover bg-surface2" />}
          <span className="flex-1 min-w-0 text-xs text-ink-faint truncate">{kind === 'video' ? 'Video' : 'Image'}</span>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange('', '')}>Remove</Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => setMode(mode === 'library' ? '' : 'library')}>
            <ImageIcon className="w-3.5 h-3.5" /> Media Library
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setMode(mode === 'link' ? '' : 'link')}>
            <Link2 className="w-3.5 h-3.5" /> Use a link
          </Button>
        </div>
      )}
      {!value && mode === 'library' && (
        <div className="mt-2 rounded-lg border border-line p-2 max-h-48 overflow-y-auto">
          {isLoading ? <p className="text-xs text-ink-faint p-2">Loading your media…</p>
            : media.length === 0 ? <p className="text-xs text-ink-faint p-2">Nothing in Media Library yet. Create images and videos in AI Studio, or upload them in Media Library.</p>
              : (
                <ul className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {media.map((m) => (
                    <li key={m.id}>
                      <button type="button" onClick={() => { onChange(m.url, m.kind); setMode(''); }}
                        aria-label={`Use ${m.kind} ${m.prompt || m.name}`}
                        className="block w-full aspect-square rounded-md overflow-hidden bg-surface2 ring-coral hover:ring-2">
                        {m.kind === 'video'
                          ? <video src={m.url} muted preload="metadata" className="w-full h-full object-cover" />
                          : <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
        </div>
      )}
      {!value && mode === 'link' && (
        <div className="mt-2 flex gap-2">
          <input className={INPUT} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/image.jpg" aria-label="Media link" />
          <Button type="button" size="sm" disabled={!link.trim()} onClick={() => {
            const url = link.trim();
            onChange(url, /\.(mp4|mov)(\?|$)/i.test(url) ? 'video' : 'image');
            setLink(''); setMode('');
          }}>Use</Button>
        </div>
      )}
    </div>
  );
}

// New post, a post's details, and "Add to calendar" from AI Studio. What it offers
// follows the post's status: save, send for review, schedule or reschedule,
// unschedule and publish now. Messages from the engine are shown as they come.
export default function PostDialog({ open, onClose, post = null, initial = null, onSaved }) {
  const { workspace, org, canWrite } = useWorkspace();
  const queryClient = useQueryClient();
  const titleRef = useRef(null);
  const [current, setCurrent] = useState(post);
  const [form, setForm] = useState(() => (post ? fromPost(post) : blank(initial)));
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const zone = orgZone(org);

  // Start afresh each time it opens (or opens on another post), not on every parent render.
  const openedFor = open ? String(post?.id ?? 'new') : '';
  useEffect(() => {
    if (!openedFor) return;
    setCurrent(post);
    setForm(post ? fromPost(post) : blank(initial));
    setBusy(''); setError(''); setNotice('');
    setTimeout(() => titleRef.current?.focus(), 0);
  }, [openedFor]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const status = current?.status;
  const readOnly = !canWrite || (current && !EDITABLE.includes(status));
  const scheduled = status === 'scheduled';
  const captionProblem = form.channel === 'instagram' ? instagramCaptionProblem(form.caption) : '';
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const refresh = (saved) => {
    queryClient.invalidateQueries({ queryKey: ['posts', workspace.id] });
    if (saved) { setCurrent(saved); onSaved?.(saved); }
  };

  // The post's content as the engine takes it; a scheduled post's time moves with Reschedule.
  const content = () => {
    const body = { title: form.title.trim(), channel: form.channel, type: form.type, caption: form.caption, mediaUrl: form.mediaUrl };
    return scheduled ? body : { ...body, date: form.date, time: form.time };
  };

  const run = async (action, work) => {
    if (!form.title.trim()) { setError('Give the post a title.'); return; }
    setBusy(action); setError(''); setNotice('');
    try {
      await work();
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.');
    } finally {
      setBusy('');
    }
  };

  // Creates the post with `status`, or saves edits to it (an idea can also move on); returns it as saved.
  const save = async (status, fromIdea = null) => {
    if (!current) {
      const created = await effyApi.createPost({ workspace: workspace.id, ...content(), status });
      refresh(created);
      return created;
    }
    const updated = await effyApi.updatePost(current.id, { ...content(), ...(fromIdea && current.status === 'idea' ? { status: fromIdea } : {}) });
    refresh(updated);
    return updated;
  };

  const saveOnly = () => run('save', async () => { await save('draft'); onClose(); });
  const sendForReview = () => run('review', async () => {
    const saved = await save('internal_review', 'internal_review');
    if (saved.status === 'draft') refresh((await effyApi.approvePost(saved.id)).post);
    onClose();
  });
  const schedule = () => run('schedule', async () => {
    const saved = await save('approved');
    try {
      refresh((await effyApi.schedulePost(saved.id, { date: form.date, time: form.time })).post);
      onClose();
    } catch (e) {
      // The post is kept; say why it isn't scheduled and leave the dialog open to fix it.
      setError(current || saved.status !== 'approved' ? e.message : `Saved as approved, not scheduled: ${e.message}`);
    }
  });
  const unschedule = () => run('unschedule', async () => {
    refresh((await effyApi.unschedulePost(current.id)).post);
    setNotice('Taken off the schedule. It stays approved.');
  });
  const publishNow = () => run('publish', async () => {
    const saved = await save('approved');
    try {
      const r = await effyApi.publishPost(saved.id);
      refresh(r.post);
      setNotice(r.post.status === 'published' ? 'Published to Instagram.' : 'Instagram is processing it. It will show on Published once it’s live.');
    } catch (e) {
      if (e.data?.post) refresh(e.data.post);
      throw e;
    }
  });

  const title = current ? (readOnly ? current.title : 'Edit post') : 'New post';
  const canPublish = form.channel === 'instagram' && !!form.mediaUrl && !captionProblem;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-labelledby="post-dialog-title" className="max-w-xl w-full max-h-[92vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <h3 id="post-dialog-title" className="font-extrabold text-ink truncate">{title}</h3>
            {current && <PostStatus status={current.status} />}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveOnly(); }} className="space-y-3" noValidate>
          <fieldset disabled={readOnly || !!busy} className="space-y-3">
            <label className="block">
              <span className="block text-xs font-semibold text-ink-soft mb-1">Title</span>
              <input ref={titleRef} className={INPUT} value={form.title} onChange={set('title')} maxLength={200} placeholder="e.g. Monsoon roof check offer" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Channel</span>
                <select className={INPUT} value={form.channel} onChange={set('channel')}>
                  {Object.entries(CHANNELS).map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Format</span>
                <select className={INPUT} value={form.type} onChange={set('type')}>
                  {TYPES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="flex items-center justify-between text-xs font-semibold text-ink-soft mb-1">
                Caption
                {form.channel === 'instagram' && <span className="font-normal text-ink-faint tabular-nums">{[...form.caption].length.toLocaleString('en-US')} / 2,200</span>}
              </span>
              <textarea className={cn(INPUT, 'min-h-28 resize-y')} value={form.caption} onChange={set('caption')} maxLength={4000} />
            </label>
            {captionProblem && (
              <p role="alert" className="flex items-start gap-1.5 text-xs text-error"><AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" /> {captionProblem}</p>
            )}
            <MediaChooser value={form.mediaUrl} kind={form.mediaKind} onChange={(mediaUrl, mediaKind) => setForm((f) => ({ ...f, mediaUrl, mediaKind }))} />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Date</span>
                <input type="date" className={INPUT} value={form.date} onChange={set('date')} />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Time</span>
                <input type="time" className={INPUT} value={form.time} onChange={set('time')} />
              </label>
            </div>
            <p className="text-[0.7rem] text-ink-faint">
              Times are {zoneLabel(zone)}. {form.channel === 'instagram'
                ? 'A scheduled post publishes to Instagram by itself at that time.'
                : `EffySocial can't publish to ${CHANNELS[form.channel]?.label || form.channel} yet: plan the date here and post it yourself.`}
            </p>
          </fieldset>

          {current?.error && status === 'failed' && <div role="alert" className="text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">Last attempt: {current.error}</div>}
          {error && <div role="alert" className="text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}
          {notice && <div role="status" className="text-sm rounded-lg bg-success-soft text-success px-3.5 py-2.5">{notice}</div>}
          {current?.permalink && (
            <a href={current.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-coral-ink">
              View on Instagram <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {!readOnly && (
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              {scheduled && <Button type="button" variant="ghost" disabled={!!busy} onClick={unschedule}>{busy === 'unschedule' ? 'Unscheduling…' : 'Unschedule'}</Button>}
              {(!current || ['approved', 'scheduled', 'failed'].includes(status)) && form.channel === 'instagram' && (
                <Button type="button" variant="secondary" disabled={!!busy || !canPublish} onClick={publishNow}>{busy === 'publish' ? 'Publishing…' : 'Publish now'}</Button>
              )}
              {(!current || ['idea', 'draft', 'internal_review', 'client_review', 'approved', 'failed'].includes(status)) && (
                <Button type="submit" variant="secondary" disabled={!!busy}>{busy === 'save' ? 'Saving…' : current ? 'Save changes' : 'Save draft'}</Button>
              )}
              {(!current || ['idea', 'draft'].includes(status)) && (
                <Button type="button" variant="secondary" disabled={!!busy} onClick={sendForReview}>{busy === 'review' ? 'Sending…' : 'Send for review'}</Button>
              )}
              {(!current || ['approved', 'scheduled', 'failed'].includes(status)) && form.channel === 'instagram' && (
                <Button type="button" disabled={!!busy || !form.date || !form.time || !!captionProblem} onClick={schedule}>
                  {busy === 'schedule' ? 'Scheduling…' : scheduled ? 'Reschedule' : 'Schedule'}
                </Button>
              )}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
