import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, Images, RefreshCw, Film, Check, Trash2 } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Button, Badge, Card } from '../../ui';

// The campaign film every dealer's personalized video is built on. One master is
// active per workspace; with none, renders use the 24-second placeholder.
export const MASTER_LIMIT_MB = 25;
const SLOTS = [
  ['avatar1', 'Avatar scene 1', 'avatar pose + dialogue 1'],
  ['avatar2', 'Avatar scene 2', 'avatar pose + dialogue 2'],
  ['brandLine', 'Brand line', 'on-screen text'],
  ['endCard', 'End card', 'dealer name, shop and city'],
];
const secs = (v) => `${Number(v).toFixed(1)} s`;

export function mastersKey(workspaceId) { return ['avatar-masters', workspaceId]; }

// Mirrors the engine's rules so mistakes show before saving.
export function slotProblem(slots, duration) {
  for (const [key, label] of SLOTS) {
    const t0 = Number(slots?.[key]?.t0);
    const t1 = Number(slots?.[key]?.t1);
    if (!Number.isFinite(t0) || !Number.isFinite(t1) || slots[key].t0 === '' || slots[key].t1 === '') return `${label}: start and end must be numbers of seconds.`;
    if (!(t0 >= 0 && t0 < t1 && t1 <= Math.round(duration * 10) / 10)) return `${label}: must start before it ends, within the video's ${duration.toFixed(1)} seconds.`;
    if (key.startsWith('avatar') && t1 - t0 < 2) return `${label}: give the avatar at least 2 seconds on screen.`;
  }
  return '';
}

function SlotEditor({ master, onSave, busy }) {
  const [draft, setDraft] = useState(master.slots);
  const [err, setErr] = useState('');
  const duration = master.durationS;
  const set = (key, edge) => (e) => { setDraft((d) => ({ ...d, [key]: { ...d[key], [edge]: e.target.value } })); setErr(''); };
  const changed = JSON.stringify(draft) !== JSON.stringify(master.slots);
  const save = () => {
    const problem = slotProblem(draft, duration);
    if (problem) { setErr(problem); return; }
    onSave(Object.fromEntries(SLOTS.map(([k]) => [k, { t0: Number(draft[k].t0), t1: Number(draft[k].t1) }])));
  };
  return (
    <div className="mt-4">
      <div className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">When each layer appears</div>
      <div className="relative h-8 rounded-lg bg-surface2 mb-3 overflow-hidden" aria-hidden="true">
        {SLOTS.map(([key], i) => {
          const t0 = Math.max(0, Number(draft[key]?.t0) || 0);
          const t1 = Math.min(duration, Number(draft[key]?.t1) || 0);
          return t1 > t0 ? (
            <span key={key} className={['absolute h-2 rounded-full bg-coral/80', 'absolute h-2 rounded-full bg-coral/50', 'absolute h-2 rounded-full bg-info/60', 'absolute h-2 rounded-full bg-success/60'][i]}
              style={{ left: `${(t0 / duration) * 100}%`, width: `${((t1 - t0) / duration) * 100}%`, top: 3 + i * 6.5 }} />
          ) : null;
        })}
      </div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
        {SLOTS.map(([key, label, hint]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span className="min-w-0 flex-1"><span className="font-semibold text-ink">{label}</span> <span className="text-xs text-ink-faint">· {hint}</span></span>
            <input type="number" step="0.5" min="0" max={duration} value={draft[key]?.t0 ?? ''} onChange={set(key, 't0')}
              aria-label={`${label} start (seconds)`} className="w-16 rounded-lg bg-surface2 px-2 py-1 text-sm tabular-nums" />
            <span className="text-ink-faint">–</span>
            <input type="number" step="0.5" min="0" max={duration} value={draft[key]?.t1 ?? ''} onChange={set(key, 't1')}
              aria-label={`${label} end (seconds)`} className="w-16 rounded-lg bg-surface2 px-2 py-1 text-sm tabular-nums" />
          </div>
        ))}
      </div>
      {err && <p role="alert" className="text-xs text-error mt-2">{err}</p>}
      <div className="flex items-center gap-2 mt-3">
        <Button size="sm" className="whitespace-nowrap" onClick={save} disabled={!changed || busy}>Save timings</Button>
        {changed && <Button size="sm" variant="ghost" className="bg-transparent" onClick={() => { setDraft(master.slots); setErr(''); }}>Reset</Button>}
        <span className="text-xs text-ink-faint">Times are seconds into the {secs(duration)} master.</span>
      </div>
    </div>
  );
}

export default function BrandMasterCard({ workspaceId }) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [picking, setPicking] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: mastersKey(workspaceId),
    queryFn: () => effyApi.avatarMasters(workspaceId),
    enabled: !!workspaceId,
  });
  const { data: library, isLoading: libraryLoading } = useQuery({
    queryKey: ['media', workspaceId, 'video'],
    queryFn: () => effyApi.listMedia(workspaceId, 'video'),
    enabled: !!workspaceId && picking,
  });
  const run = async (key, fn) => {
    setBusy(key); setErr('');
    try {
      qc.setQueryData(mastersKey(workspaceId), await fn());
      return true;
    } catch (e) {
      setErr(e.message || 'Something went wrong — try again.');
      return false;
    } finally { setBusy(''); }
  };
  const upload = (file) => {
    if (!file) return;
    if (file.size > MASTER_LIMIT_MB * 1024 * 1024) {
      setErr(`That video is over ${MASTER_LIMIT_MB} MB. Add it to the Media Library and choose it from there.`);
      return;
    }
    run('upload', () => effyApi.uploadAvatarMaster(workspaceId, file));
  };

  const active = data?.active;
  const others = (data?.masters || []).filter((m) => !m.active);

  return (
    <Card className="p-6 mb-5">
      <section aria-label="Brand master">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Film className="w-4 h-4 text-coral-ink" />
          <h3 className="font-bold text-ink text-lg">Brand master</h3>
          {active ? <Badge tone="success">Brand master</Badge> : <Badge tone="warning">Placeholder</Badge>}
        </div>
        <p className="text-sm text-ink-soft mb-4">
          Every dealer’s video is this campaign film with their avatar, dialogue and name layered on. Upload the brand’s
          master (MP4, MOV or WEBM, 8–180 seconds, up to {MASTER_LIMIT_MB} MB) or choose a video from the Media Library.
        </p>

        {isLoading ? (
          <p className="text-sm text-ink-faint">Loading…</p>
        ) : (
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5 items-start">
            <div>
              {active ? (
                <>
                  <video src={active.url} controls preload="metadata" className="w-full rounded-xl bg-black" style={{ maxHeight: 260 }} />
                  <p className="text-sm font-semibold text-ink mt-2">{active.title}</p>
                  <p className="text-xs text-ink-faint">
                    {secs(active.durationS)} · {active.width}×{active.height} {active.orientation} · {active.source === 'library' ? 'from the Media Library' : 'uploaded'}
                  </p>
                </>
              ) : (
                <div className="rounded-xl bg-surface2 p-4 text-sm text-ink-soft">
                  Renders use EffySocial’s 24-second placeholder, a plain festive card. Add the brand master before sending videos to dealers.
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm,.m4v" hidden
                onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => fileRef.current?.click()} disabled={!!busy}>
                  {busy === 'upload' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {busy === 'upload' ? 'Converting…' : 'Upload video'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setPicking((v) => !v)} disabled={!!busy} aria-expanded={picking}>
                  <Images className="w-4 h-4" /> Choose from Media Library
                </Button>
                {active && (
                  <Button size="sm" variant="ghost" className="bg-transparent" disabled={!!busy}
                    onClick={() => run('placeholder', () => effyApi.useAvatarPlaceholder(workspaceId))}>
                    Use placeholder
                  </Button>
                )}
              </div>
              {err && <p role="alert" className="text-sm text-error">{err}</p>}
              {busy === 'upload' || busy.startsWith('lib:') ? (
                <p className="text-xs text-ink-faint">Converting the video for dealer renders — this can take up to a minute.</p>
              ) : null}

              {others.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Other masters</div>
                  <ul className="space-y-1.5">
                    {others.map((m) => (
                      <li key={m.id} className="flex items-center gap-2 rounded-lg bg-surface2/60 px-3 py-2 text-sm">
                        <span className="min-w-0 flex-1 truncate"><span className="font-semibold text-ink">{m.title}</span> <span className="text-xs text-ink-faint">· {secs(m.durationS)}</span></span>
                        <button type="button" className="bg-transparent text-xs font-bold text-coral-ink" disabled={!!busy}
                          onClick={() => run(`use:${m.id}`, () => effyApi.updateAvatarMaster(m.id, { active: true }))}>Use</button>
                        <button type="button" className="bg-transparent text-ink-faint hover:text-error" disabled={!!busy} aria-label={`Remove ${m.title}`}
                          onClick={() => run(`del:${m.id}`, () => effyApi.deleteAvatarMaster(m.id))}><Trash2 className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {picking && (
          <div className="mt-5 border-t border-line pt-4">
            <div className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">Videos in the Media Library</div>
            {libraryLoading && <p className="text-sm text-ink-faint">Loading…</p>}
            {library && library.length === 0 && <p className="text-sm text-ink-faint">No videos in the Media Library yet.</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(library || []).map((v) => (
                <div key={v.name} className="rounded-xl bg-surface2/60 p-2">
                  <video src={v.url} preload="metadata" muted className="w-full aspect-video rounded-lg bg-black object-cover" />
                  <p className="text-xs text-ink-soft truncate mt-1.5" title={v.prompt}>{v.prompt || v.name}</p>
                  <Button size="sm" variant="secondary" className="w-full mt-1.5" disabled={!!busy}
                    onClick={async () => { if (await run(`lib:${v.name}`, () => effyApi.avatarMasterFromLibrary(workspaceId, v.name))) setPicking(false); }}>
                    {busy === `lib:${v.name}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Use this video
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {active && (
          <SlotEditor key={`${active.id}:${JSON.stringify(active.slots)}`} master={active} busy={!!busy}
            onSave={(slots) => run('slots', () => effyApi.updateAvatarMaster(active.id, { slots }))} />
        )}
      </section>
    </Card>
  );
}
