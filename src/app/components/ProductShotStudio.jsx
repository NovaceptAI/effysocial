import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Package, Plus, RefreshCw, Sparkles, Check, Trash2, Upload, Music, Play, Film,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Badge, Button } from '../../ui';
import ShareRow from './ShareRow';
import GrowNudge from './GrowNudge';
import { cn } from '../../lib/cn';

/* Product Shot Video Builder — one product, shown beautifully in one or a few
   close-up "looks". Reference-locked stills → Veo motion → music. Distinct from
   Ad Films: no narrative, no voiceover; the product is the hero. */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ASPECTS = [['9:16', 'Reel 9:16'], ['1:1', 'Square 1:1'], ['16:9', 'Wide 16:9']];

export default function ProductShotStudio({ onBack }) {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const [selId, setSelId] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);            // {kind:'error'|'warn', text}
  const [creating, setCreating] = useState(false);
  const [nTitle, setNTitle] = useState('');
  const [nProduct, setNProduct] = useState('');
  const [nAspect, setNAspect] = useState('9:16');
  const fileRef = useRef(null);
  const musicRef = useRef(null);

  const { data: shots = [], refetch: refetchList } = useQuery({
    queryKey: ['product-shots', workspace?.id],
    queryFn: () => effyApi.listProductShots(workspace.id),
    enabled: !!workspace,
  });
  const { data: shot, refetch } = useQuery({
    queryKey: ['product-shot', selId],
    queryFn: () => effyApi.getProductShot(selId),
    enabled: !!selId,
  });

  const run = async (label, fn) => {
    setBusy(label); setMsg(null);
    try { await fn(); } catch (e) { setMsg({ kind: 'error', text: e.message || 'Something went wrong.' }); }
    finally { setBusy(''); }
  };
  const back = () => { setSelId(null); refetchList(); };

  const createShot = () => run('create', async () => {
    const s = await effyApi.createProductShot({ workspace: workspace.id, title: nTitle.trim(), product: nProduct.trim(), aspect: nAspect });
    setCreating(false); setNTitle(''); setNProduct('');
    refetchList(); setSelId(s.id);
  });

  const uploadSource = (file) => run('source', async () => { await effyApi.productShotSource(shot.id, file); await refetch(); });
  const patchShot = (payload) => run('patch', async () => { await effyApi.updateProductShot(shot.id, payload); await refetch(); });
  const genStill = (fr) => run(`still${fr.id}`, async () => {
    const r = await effyApi.productShotStill(shot.id, fr.id);
    if (r.budgetWarning) setMsg({ kind: 'warn', text: r.budgetWarning });
    await refetch();
  });
  const approve = (fr, val) => run(`appr${fr.id}`, async () => { await effyApi.productShotApprove(shot.id, fr.id, val); await refetch(); });
  const animate = (fr) => run(`anim${fr.id}`, async () => {
    const r = await effyApi.productShotAnimate(shot.id, fr.id);
    if (r.budgetWarning) setMsg({ kind: 'warn', text: r.budgetWarning });
    if (r.frame?.clipStatus === 'clip_ready') { await refetch(); return; }
    for (let i = 0; i < 60; i += 1) {
      await sleep(8000);
      const st = await effyApi.productShotAnimateStatus(shot.id, fr.id);
      if (st.status === 'ready') { await refetch(); return; }
      if (st.status === 'error') throw new Error(st.message || 'Animation failed.');
    }
    await refetch(); setMsg({ kind: 'warn', text: 'Still rendering — check back in a few minutes.' });
  });
  const addFrame = () => run('addframe', async () => { await effyApi.productShotFrameAdd(shot.id, { look: 'detail close-up of the product', motion: 'orbit' }); await refetch(); });
  const delFrame = (fr) => run(`del${fr.id}`, async () => { await effyApi.productShotFrameDelete(shot.id, fr.id); await refetch(); });
  const uploadMusic = (file) => run('music', async () => { await effyApi.productShotMusicUpload(shot.id, file); await refetch(); });
  const build = () => run('build', async () => { await effyApi.productShotBuild(shot.id); await refetch(); });

  const Header = (
    <div className="flex items-center gap-3 mb-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/65 hover:text-white bg-transparent">
        <ArrowLeft className="w-4 h-4" /> Formats
      </button>
      <div className="h-5 w-px bg-white/12" />
      <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
        <Package className="w-4 h-4 text-coral-ink" /> Product Shots
      </span>
      <Badge tone="new">Beauty product video</Badge>
    </div>
  );

  // ── Gallery ──────────────────────────────────────────────────────────────
  if (!selId) {
    return (
      <div className="max-w-6xl mx-auto rounded-2xl p-5 sm:p-6 [&_input]:text-white [&_select]:text-white [&_textarea]:text-white [&_input]:placeholder-white/40 [&_textarea]:placeholder-white/40" style={{ background: '#0B0C0F', color: '#EDEEF0' }}>
        {Header}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <button type="button" onClick={() => setCreating(true)}
            className="relative rounded-2xl grid place-items-center transition hover:-translate-y-1 bg-transparent ring-1 ring-white/10"
            style={{ aspectRatio: '3 / 4', background: 'linear-gradient(160deg,#16181D,#1d2026)' }}>
            <span className="grid place-items-center gap-2 text-white/60">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/10"><Plus className="w-6 h-6" /></span>
            </span>
            <span className="absolute inset-x-0 bottom-0 p-4 text-center">
              <span className="block text-white font-bold text-[18px]">New product shot</span>
              <span className="block text-white/50 text-[12.5px] mt-1">Photo → beauty video</span>
            </span>
          </button>
          {shots.map((s) => (
            <button key={s.id} type="button" onClick={() => setSelId(s.id)}
              className="relative rounded-2xl overflow-hidden text-left transition hover:-translate-y-1 bg-transparent ring-1 ring-white/10"
              style={{ aspectRatio: '3 / 4', background: '#0D0E12' }}>
              {s.sourceUrl && <img src={s.sourceUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />}
              <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/55 text-white/85 backdrop-blur-sm">
                {s.status === 'delivered' ? 'READY' : s.status === 'production' ? 'IN PROGRESS' : 'DRAFT'}
              </span>
              <span className="absolute inset-x-0 bottom-0 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                <span className="block text-white font-bold text-[17px] leading-tight truncate">{s.title || s.product || 'Untitled'}</span>
                <span className="block text-white/55 text-[12px] mt-0.5 truncate">{s.product}</span>
              </span>
            </button>
          ))}
        </div>

        {creating && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreating(false)} />
            <div className="relative w-full max-w-md bg-[#16181D] rounded-2xl shadow-xl p-6">
              <h3 className="font-bold text-white text-lg mb-4">New product shot</h3>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/45 mb-1.5">Title</label>
              <input value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="e.g. Serum hero reel"
                className="w-full rounded-xl bg-[#0D0E12] px-3.5 py-2.5 text-sm mb-3" />
              <label className="block text-xs font-bold uppercase tracking-wide text-white/45 mb-1.5">Product</label>
              <input value={nProduct} onChange={(e) => setNProduct(e.target.value)} placeholder="e.g. Vitamin C serum"
                className="w-full rounded-xl bg-[#0D0E12] px-3.5 py-2.5 text-sm mb-3" />
              <label className="block text-xs font-bold uppercase tracking-wide text-white/45 mb-1.5">Aspect</label>
              <select value={nAspect} onChange={(e) => setNAspect(e.target.value)} className="w-full rounded-xl bg-[#0D0E12] px-3 py-2.5 text-sm mb-4">
                {ASPECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <div className="flex gap-2">
                <Button onClick={createShot} disabled={busy === 'create'}>
                  {busy === 'create' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Create
                </Button>
                <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!shot) return <div className="max-w-6xl mx-auto">{Header}<p className="text-sm text-white/65">Loading…</p></div>;

  const styles = shot.stylePresets || [];
  const motions = shot.motionPresets || [];
  const master = shot.renders?.master;

  // ── Builder ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto rounded-2xl p-5 sm:p-6 [&_input]:text-white [&_select]:text-white [&_textarea]:text-white [&_input]:placeholder-white/40 [&_textarea]:placeholder-white/40" style={{ background: '#0B0C0F', color: '#EDEEF0' }}>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/65 hover:text-white bg-transparent">
          <ArrowLeft className="w-4 h-4" /> All product shots
        </button>
        <div className="h-5 w-px bg-white/12" />
        <span className="font-display text-lg font-semibold tracking-tight">{shot.title || shot.product || 'Product shot'}</span>
        <Badge tone="new">{shot.aspect}</Badge>
        <span className="ml-auto text-xs text-white/45">Spend ~${(shot.spendUsd || 0).toFixed(2)} / ${shot.budgetUsd?.toFixed(0)}</span>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Setup panel */}
        <div className="bg-[#16181D] rounded-2xl shadow-e1 p-5 space-y-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-white/45 mb-2">Product photo</div>
            {shot.sourceUrl ? (
              <img src={shot.sourceUrl} alt="" className="w-full rounded-xl bg-[#0D0E12] mb-2" style={{ maxHeight: 180, objectFit: 'contain' }} />
            ) : (
              <p className="text-xs text-white/65 mb-2">Upload a clean product photo — plain background works best.</p>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-white/12 bg-transparent px-3 py-3 text-sm font-semibold text-white/65 hover:text-white inline-flex items-center justify-center gap-2">
              {busy === 'source' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {shot.sourceUrl ? 'Replace photo' : 'Upload photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden
              onChange={(e) => e.target.files?.[0] && uploadSource(e.target.files[0])} />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-white/45 mb-2">Look</div>
            <select value={shot.style} onChange={(e) => patchShot({ style: e.target.value })}
              className="w-full rounded-xl bg-[#0D0E12] px-3 py-2.5 text-sm mb-2">
              {styles.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <select value={shot.aspect} onChange={(e) => patchShot({ aspect: e.target.value })}
              className="w-full rounded-xl bg-[#0D0E12] px-3 py-2.5 text-sm">
              {ASPECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-white/45 mb-2">Music</div>
            <select value={['calm', 'upbeat'].includes(shot.music) ? shot.music : ''} onChange={(e) => patchShot({ music: e.target.value })}
              className="w-full rounded-xl bg-[#0D0E12] px-3 py-2.5 text-sm mb-2">
              <option value="">{shot.music && !['calm', 'upbeat'].includes(shot.music) ? 'Uploaded track' : 'No music'}</option>
              {(shot.musicLibrary || []).map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
            <button type="button" onClick={() => musicRef.current?.click()}
              className="w-full rounded-xl bg-transparent px-3 py-2 text-xs font-semibold text-white/65 hover:text-white inline-flex items-center justify-center gap-2 ring-1 ring-white/15">
              {busy === 'music' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Music className="w-3.5 h-3.5" />} Upload track
            </button>
            <input ref={musicRef} type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/aac,.mp3,.m4a,.wav" hidden
              onChange={(e) => e.target.files?.[0] && uploadMusic(e.target.files[0])} />
          </div>

          {master && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-white/45 mb-2">Your video</div>
              <video src={master} controls className="w-full rounded-xl bg-black mb-2" />
              <ShareRow videoUrl={master} />
              <div className="mt-3"><GrowNudge text="Video's ready. Publish it and turn it into a campaign in Performance Marketing." /></div>
            </div>
          )}
        </div>

        {/* Shots (frames) */}
        <div className="space-y-4">
          {!shot.sourceUrl && (
            <div className="bg-[#16181D] rounded-2xl shadow-e1 p-5 text-sm text-white/65">
              Upload a product photo to start. Every shot is generated from it, so the product stays faithful.
            </div>
          )}

          {(shot.frames || []).map((fr) => (
            <div key={fr.id} className="bg-[#16181D] rounded-2xl shadow-e1 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-[#0D0E12] text-xs font-bold text-coral-ink">{fr.idx + 1}</span>
                <span className="text-sm font-bold text-white">Shot {fr.idx + 1}</span>
                <select value={fr.motion} onChange={(e) => run(`m${fr.id}`, async () => { await effyApi.productShotFrameUpdate(shot.id, fr.id, { motion: e.target.value }); await refetch(); })}
                  className="rounded-lg bg-[#0D0E12] px-2 py-1 text-xs">
                  {motions.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
                <select value={fr.seconds} onChange={(e) => run(`s${fr.id}`, async () => { await effyApi.productShotFrameUpdate(shot.id, fr.id, { seconds: Number(e.target.value) }); await refetch(); })}
                  className="rounded-lg bg-[#0D0E12] px-2 py-1 text-xs">
                  {[4, 6, 8].map((v) => <option key={v} value={v}>{v}s</option>)}
                </select>
                {(shot.frames.length > 1) && (
                  <button type="button" onClick={() => delFrame(fr)} title="Remove shot"
                    className="ml-auto text-white/45 hover:text-red-500 bg-transparent"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>

              <input defaultValue={fr.look} key={`look-${fr.id}-${fr.look}`}
                onBlur={(e) => e.target.value !== fr.look && run(`look${fr.id}`, async () => { await effyApi.productShotFrameUpdate(shot.id, fr.id, { look: e.target.value }); await refetch(); })}
                placeholder="Describe this look — e.g. macro of the pump, water droplets"
                className="w-full rounded-xl bg-[#0D0E12] px-3.5 py-2.5 text-sm mb-3" />

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Still */}
                <div className="rounded-xl bg-[#0D0E12] overflow-hidden">
                  <div className="relative" style={{ aspectRatio: shot.aspect.replace(':', '/') }}>
                    {fr.stillUrl
                      ? <img src={fr.stillUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      : <span className="absolute inset-0 grid place-items-center text-white/45 text-xs">No still yet</span>}
                    {fr.stillStatus === 'approved' && (
                      <span className="absolute top-2 right-2 grid place-items-center w-6 h-6 rounded-full bg-green-500 text-white"><Check className="w-3.5 h-3.5" /></span>
                    )}
                  </div>
                  <div className="flex gap-2 p-2">
                    <Button size="sm" variant="ghost" disabled={!shot.sourceUrl || busy === `still${fr.id}`} onClick={() => genStill(fr)}>
                      {busy === `still${fr.id}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {fr.still ? 'Regenerate' : 'Generate still'}
                    </Button>
                    {fr.still && (
                      <Button size="sm" variant={fr.stillStatus === 'approved' ? 'ghost' : 'spark'} disabled={busy === `appr${fr.id}`}
                        onClick={() => approve(fr, fr.stillStatus !== 'approved')}>
                        {fr.stillStatus === 'approved' ? 'Unapprove' : 'Approve'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Clip */}
                <div className="rounded-xl bg-[#0D0E12] overflow-hidden">
                  <div className="relative" style={{ aspectRatio: shot.aspect.replace(':', '/') }}>
                    {fr.clipUrl
                      ? <video src={fr.clipUrl} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                      : <span className="absolute inset-0 grid place-items-center text-white/45 text-xs">
                          {busy === `anim${fr.id}` ? 'Animating…' : 'Not animated'}
                        </span>}
                  </div>
                  <div className="p-2">
                    <Button size="sm" disabled={fr.stillStatus !== 'approved' || busy === `anim${fr.id}`} onClick={() => animate(fr)}>
                      {busy === `anim${fr.id}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                      {fr.clip ? 'Re-animate' : 'Animate'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {shot.sourceUrl && (
            <div className="flex items-center gap-3">
              {(shot.frames?.length || 0) < 6 && (
                <Button variant="ghost" disabled={busy === 'addframe'} onClick={addFrame}>
                  <Plus className="w-4 h-4" /> Add another shot
                </Button>
              )}
              <Button className="ml-auto" disabled={busy === 'build' || !(shot.frames || []).some((f) => f.clipStatus === 'clip_ready')}
                onClick={build}>
                {busy === 'build' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Build video
              </Button>
            </div>
          )}

          {msg && <p className={cn('text-sm', msg.kind === 'error' ? 'text-red-500' : 'text-amber-600')}>{msg.text}</p>}
        </div>
      </div>
    </div>
  );
}
