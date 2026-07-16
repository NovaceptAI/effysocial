import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Users, Upload, Check, RefreshCw, Sparkles, Lock, Unlock, Play,
  Film, Download, AlertTriangle, Plus, Volume2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button, Badge, Card } from '../../ui';
import ShareRow from './ShareRow';
import { cn } from '../../lib/cn';

/* Personalized Avatar Video (raw v1).
   Upload photo → Generate avatar → Lock identity → Dialogue + voice → Render → Export.
   Identity lock: every pose is generated FROM the approved reference image. */

const LANGS = ['English', 'Hindi', 'Hinglish', 'Marathi'];

function ScoreChip({ score }) {
  if (score == null) return <Badge>unscored</Badge>;
  const tone = score >= 85 ? 'success' : score >= 70 ? 'warning' : 'error';
  return <Badge tone={tone}>{score}/100 · AI-est.</Badge>;
}

export default function DealerAvatarStudio({ onBack }) {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const [selId, setSelId] = useState(null);
  const [busy, setBusy] = useState('');       // which action is running
  const [err, setErr] = useState('');
  const [previewAudio, setPreviewAudio] = useState('');
  const [exports, setExports] = useState(null);
  const photoRef = useRef(null);
  const [form, setForm] = useState({ name: '', shop: '', city: '', language: 'English' });
  const [photoFile, setPhotoFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers', workspace?.id],
    queryFn: () => effyApi.listDealers(workspace.id),
    enabled: !!workspace,
  });
  const { data: audioOpts } = useQuery({ queryKey: ['studio-voices'], queryFn: () => effyApi.studioVoices() });
  const voices = audioOpts?.voices || [];
  const dealer = dealers.find((d) => d.id === selId);

  const refresh = () => qc.invalidateQueries({ queryKey: ['dealers', workspace?.id] });
  const run = async (key, fn) => {
    setBusy(key); setErr('');
    try { await fn(); refresh(); } catch (e) { setErr(e.message || 'Failed'); } finally { setBusy(''); }
  };

  const createDealer = () => run('create', async () => {
    const d = await effyApi.createDealer(workspace.id, { photo: photoFile, ...form });
    setSelId(d.id); setCreating(false); setPhotoFile(null);
    setForm({ name: '', shop: '', city: '', language: 'English' });
  });

  const saveField = (field, value) => effyApi.updateDealer(dealer.id, { [field]: value }).then(refresh);

  /* ─────────── dealer list / create ─────────── */
  if (!dealer) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink bg-transparent">
            <ArrowLeft className="w-4 h-4" /> Formats
          </button>
          <div className="h-5 w-px bg-line" />
          <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <Users className="w-4 h-4 text-coral-ink" /> Personalized Avatar Video
          </span>
          <Badge tone="new">Identity Lock</Badge>
          <div className="flex-1" />
          {!creating && <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> New dealer</Button>}
        </div>

        {creating && (
          <Card className="p-6 mb-5">
            <h3 className="font-bold text-ink text-lg mb-4">New dealer</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dealer name *"
                className="rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
              <input value={form.shop} onChange={(e) => setForm({ ...form, shop: e.target.value })} placeholder="Shop / business name"
                className="rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City"
                className="rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="rounded-xl bg-surface2 px-3.5 py-2.5 text-sm font-semibold">
                {LANGS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png" hidden onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            <button onClick={() => photoRef.current?.click()}
              className={cn('w-full rounded-xl border-2 border-dashed p-5 text-center transition mb-2 bg-transparent',
                photoFile ? 'border-success bg-success-soft/40' : 'border-line hover:border-coral/50 hover:bg-coral-tint/30')}>
              {photoFile
                ? <span className="inline-flex items-center gap-2 text-sm font-bold text-ink"><Check className="w-4 h-4 text-success" /> {photoFile.name}</span>
                : <span className="flex flex-col items-center gap-1.5 text-ink-soft"><Upload className="w-5 h-5" /><span className="text-sm font-semibold">Upload portrait photo</span></span>}
            </button>
            <p className="text-xs text-ink-faint mb-4">Front-facing · good light · face clearly visible · no sunglasses or heavy filters · JPG/PNG ≤10 MB</p>
            <div className="flex gap-2">
              <Button onClick={createDealer} disabled={!form.name.trim() || !photoFile || busy === 'create'}>
                {busy === 'create' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add dealer
              </Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
            {err && <p className="text-xs text-error mt-2">{err}</p>}
          </Card>
        )}

        {dealers.length === 0 && !creating ? (
          <div className="py-16 text-center">
            <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-coral-ink mx-auto mb-4"><Users className="w-6 h-6" /></div>
            <p className="text-sm text-ink-faint mb-4">Turn each dealer into a consistent cartoon avatar and personalize the campaign video for them.</p>
            <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Add your first dealer</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dealers.map((d) => (
              <button key={d.id} onClick={() => { setSelId(d.id); setExports(null); setPreviewAudio(''); }}
                className="text-left rounded-2xl bg-surface shadow-e1 hover:shadow-e3 hover:-translate-y-0.5 transition-all p-4">
                <div className="flex items-center gap-3">
                  <span className="w-14 h-14 rounded-xl bg-surface2 overflow-hidden shrink-0">
                    {(d.avatarRefUrl || d.photoUrl) && <img src={d.avatarRefUrl || d.photoUrl} alt="" className="w-full h-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink truncate">{d.name}</span>
                    <span className="block text-xs text-ink-faint truncate">{d.shop}{d.shop && d.city ? ' · ' : ''}{d.city}</span>
                  </span>
                  {d.locked ? <Badge tone="success"><Lock className="w-3 h-3" /> locked</Badge>
                    : d.avatarRefUrl ? <Badge tone="warning">unlocked</Badge> : <Badge>photo only</Badge>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ─────────── dealer workflow ─────────── */
  const poseFor = (key) => (dealer.poses || []).find((p) => p.key === key);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => setSelId(null)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink bg-transparent">
          <ArrowLeft className="w-4 h-4" /> Dealers
        </button>
        <div className="h-5 w-px bg-line" />
        <span className="font-display text-lg font-semibold tracking-tight">{dealer.name}</span>
        <span className="text-xs text-ink-faint">{dealer.shop}{dealer.shop && dealer.city ? ' · ' : ''}{dealer.city}</span>
        {dealer.locked ? <Badge tone="success"><Lock className="w-3 h-3" /> Identity locked</Badge> : <Badge tone="warning"><Unlock className="w-3 h-3" /> Unlocked</Badge>}
      </div>
      {err && <p className="mb-3 text-sm rounded-xl bg-error-soft text-error px-3.5 py-2.5">{err}</p>}

      {/* ① Avatar & Identity Lock */}
      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-ink text-lg">① Avatar & Identity Lock</h3>
          <div className="flex gap-2">
            {!dealer.locked && (
              <Button variant="secondary" size="sm" onClick={() => run('ref', () => effyApi.dealerReference(dealer.id))} disabled={!!busy}>
                {busy === 'ref' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {dealer.avatarRefUrl ? 'Regenerate avatar' : 'Generate avatar'}
              </Button>
            )}
            {dealer.avatarRefUrl && (
              <Button size="sm" variant={dealer.locked ? 'secondary' : 'primary'}
                onClick={() => run('lock', () => effyApi.dealerLock(dealer.id, !dealer.locked))} disabled={!!busy}>
                {dealer.locked ? <><Unlock className="w-3.5 h-3.5" /> Unlock</> : <><Lock className="w-3.5 h-3.5" /> Lock identity</>}
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint mb-1.5">Photo</p>
            <div className="aspect-square rounded-xl bg-surface2 overflow-hidden">
              {dealer.photoUrl && <img src={dealer.photoUrl} alt="" className="w-full h-full object-cover" />}
            </div>
          </div>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint mb-1.5">Reference {dealer.locked && '🔒'}</p>
            <div className={cn('aspect-square rounded-xl bg-surface2 overflow-hidden', dealer.locked && 'ring-2 ring-success')}>
              {dealer.avatarRefUrl
                ? <img src={dealer.avatarRefUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full grid place-items-center text-xs text-ink-faint px-2 text-center">Generate the avatar first</div>}
            </div>
          </div>
          {(dealer.posesAvailable || []).map((spec) => {
            const p = poseFor(spec.key);
            return (
              <div key={spec.key}>
                <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint mb-1.5">{spec.label}</p>
                <div className="aspect-square rounded-xl bg-surface2 overflow-hidden relative">
                  {p?.imgUrl
                    ? <img src={p.imgUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full grid place-items-center text-xs text-ink-faint">—</div>}
                  {busy === `pose-${spec.key}` && (
                    <div className="absolute inset-0 grid place-items-center bg-ink/40 text-white"><RefreshCw className="w-4 h-4 animate-spin" /></div>
                  )}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  {p ? <ScoreChip score={p.score} /> : <span />}
                  <button onClick={() => run(`pose-${spec.key}`, () => effyApi.dealerPose(dealer.id, spec.key))}
                    disabled={!dealer.avatarRefUrl || !!busy}
                    className="text-[0.7rem] font-bold text-coral-ink disabled:opacity-40 bg-transparent">
                    {p ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
                {p && p.score != null && p.score < 70 && (
                  <p className="mt-1 flex items-start gap-1 text-[0.65rem] text-warning leading-snug"><AlertTriangle className="w-3 h-3 shrink-0 mt-px" /> {p.notes || 'Differs from the reference — regenerate.'}</p>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-ink-faint mt-3">Poses are always generated from the approved reference, so the face, outfit and style can't drift. Consistency scores are AI-estimated.</p>
      </Card>

      {/* ② Dialogue & voice */}
      <Card className="p-6 mb-5">
        <h3 className="font-bold text-ink text-lg mb-4">② Dialogue & voice</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Dialogue 1 · festive line</label>
              <textarea defaultValue={dealer.dialogue1} rows={2} onBlur={(e) => saveField('dialogue1', e.target.value)}
                placeholder={`e.g. Is Diwali, apne ghar ko dijiye sabse behtar suraksha!`}
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Dialogue 2 · personal promise</label>
              <textarea defaultValue={dealer.dialogue2} rows={2} onBlur={(e) => saveField('dialogue2', e.target.value)}
                placeholder="e.g. Meri guarantee — quality bhi, bharosa bhi."
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Dealer branding line</label>
              <textarea defaultValue={dealer.brandLine} rows={2} onBlur={(e) => saveField('brandLine', e.target.value)}
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select value={dealer.voice || ''} onChange={(e) => saveField('voice', e.target.value)}
                className="flex-1 rounded-xl bg-surface2 px-3 py-2.5 text-sm font-semibold">
                <option value="">Auto voice</option>
                {voices.map((v) => <option key={v.key} value={v.key}>{v.name} · {v.lang}</option>)}
                <option value="" disabled>Clone dealer's voice (coming soon)</option>
              </select>
              <select value={dealer.language} onChange={(e) => saveField('language', e.target.value)}
                className="rounded-xl bg-surface2 px-3 py-2.5 text-sm font-semibold">
                {LANGS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <Button variant="secondary" size="sm" disabled={!!busy}
              onClick={() => run('voice', async () => {
                const r = await effyApi.dealerVoicePreview(dealer.id, dealer.dialogue1 || dealer.brandLine);
                setPreviewAudio(r.audioUrl);
              })}>
              {busy === 'voice' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />} Preview voice
            </Button>
            {previewAudio && <audio src={previewAudio} controls autoPlay className="w-full" />}
            <p className="text-xs text-ink-faint">Dialogues are spoken over the avatar scenes; the branding line and end card render as text in the video.</p>
          </div>
        </div>
      </Card>

      {/* ③ Render & ④ Export */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-ink text-lg">③ Personalized video</h3>
          <div className="flex gap-2">
            <Button onClick={() => run('render', () => effyApi.dealerRender(dealer.id))} disabled={!dealer.locked || !!busy}>
              {busy === 'render' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
              {dealer.renders?.master ? 'Re-render' : 'Render video'}
            </Button>
            {dealer.renders?.master && (
              <Button variant="secondary" onClick={() => run('exports', async () => setExports(await effyApi.dealerExports(dealer.id)))} disabled={!!busy}>
                {busy === 'exports' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Create exports
              </Button>
            )}
          </div>
        </div>
        {!dealer.locked && <p className="text-sm text-ink-faint">Lock the avatar identity to enable rendering. The master video stays fixed — only the avatar, dialogue and text layers are personalized.</p>}
        {dealer.renders?.master && (
          <>
            <video src={dealer.renders.master} controls className="w-full max-w-2xl rounded-xl bg-black" />
            <ShareRow videoUrl={dealer.renders.master} caption={`Festive greetings from ${dealer.name} — ${dealer.shop}, ${dealer.city}`} />
          </>
        )}
        {(exports?.dealer?.renders || dealer.renders) && (dealer.renders?.whatsapp || dealer.renders?.reel || exports) && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {(exports?.dealer?.renders?.whatsapp || dealer.renders?.whatsapp) && (
              <div className="rounded-xl bg-surface2/60 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-ink">WhatsApp version <span className="text-ink-faint font-medium">· compressed 480p</span></span>
                  <a href={exports?.dealer?.renders?.whatsapp || dealer.renders?.whatsapp} download className="text-xs font-bold text-coral-ink">Download</a>
                </div>
                {exports?.captions?.whatsapp && <p className="text-[0.7rem] text-ink-soft">{exports.captions.whatsapp}</p>}
              </div>
            )}
            {(exports?.dealer?.renders?.reel || dealer.renders?.reel) && (
              <div className="rounded-xl bg-surface2/60 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-ink">Reel / Short <span className="text-ink-faint font-medium">· 9:16</span></span>
                  <a href={exports?.dealer?.renders?.reel || dealer.renders?.reel} download className="text-xs font-bold text-coral-ink">Download</a>
                </div>
                {exports?.captions?.reel && <p className="text-[0.7rem] text-ink-soft">{exports.captions.reel}</p>}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
