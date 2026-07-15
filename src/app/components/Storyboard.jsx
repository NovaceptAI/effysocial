import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Clapperboard, Sparkles, RefreshCw, Film, Play, Check, Send,
  Monitor, Smartphone, Wand2, ImageIcon, Download, Plus, X, User, Mic,
  Lightbulb, Package, Rocket, Clock,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button, Badge } from '../../ui';
import ShareRow from './ShareRow';
import { cn } from '../../lib/cn';

const MIN_SCENES = 2;
const MAX_SCENES = 15;
const CLIPS = [6, 8, 10];
// One-tap length presets (scenes × clip seconds).
const DURATION_PRESETS = [
  { label: '2:00 · 15×8s', scenes: 15, clip: 8 },
  { label: '2:00 · 12×10s', scenes: 12, clip: 10 },
];
// Story categories — each drives a different planning arc on the backend.
const CATEGORIES = [
  { key: '', label: 'Free-form', icon: Sparkles },
  { key: 'explainer', label: 'Explainer', icon: Lightbulb },
  { key: 'product_shoot', label: 'Product Shoot', icon: Package },
  { key: 'product_launch', label: 'Product Launch', icon: Rocket },
];
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const MOTIONS = [
  { key: 'push_in', label: 'Push in' },
  { key: 'pull_out', label: 'Pull out' },
  { key: 'pan_right', label: 'Pan right' },
  { key: 'pan_left', label: 'Pan left' },
];
const EXAMPLES = [
  { title: 'Day in the life', body: 'A warm day at our clinic — from a friendly welcome to a happy patient leaving with a bright smile.' },
  { title: 'Product launch', body: 'Unbox the new product, hero beauty shots, then a delighted customer reaction.' },
  { title: 'Before → after', body: 'A transformation story building to a confident, joyful reveal.' },
  { title: 'Founder story', body: 'The problem we saw, the spark of an idea, the solution, and the mission today.' },
];

export default function Storyboard({ format, onBack, initialBrief = '' }) {
  const { workspace } = useWorkspace();

  const [brief, setBrief] = useState(initialBrief);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState(4);
  const [clip, setClip] = useState(8);
  const [aspect, setAspect] = useState(format.aspect || '16 / 9');
  const [scenes, setScenes] = useState([]);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voice, setVoice] = useState('');
  const [music, setMusic] = useState('');
  const [planning, setPlanning] = useState(false);
  const [renderingAll, setRenderingAll] = useState(false);
  const [story, setStory] = useState(null);
  const [stitching, setStitching] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: audioOpts } = useQuery({ queryKey: ['studio-voices'], queryFn: () => effyApi.studioVoices() });
  const voices = audioOpts?.voices || [];
  const musicOpts = audioOpts?.music || [{ key: '', name: 'None' }];
  const videoProvider = audioOpts?.videoProvider || 'free';
  const veoMax = audioOpts?.veoMaxSeconds || 8;

  // Category idea prompts — 4 brand-grounded briefs to pick from.
  const [ideas, setIdeas] = useState(null);
  const [ideasBusy, setIdeasBusy] = useState(false);
  const pickCategory = async (key) => {
    setCategory(key);
    setIdeas(null);
    if (!key || !workspace) return;
    setIdeasBusy(true);
    try {
      setIdeas(await effyApi.storyIdeas({ workspace: workspace.id, category: key }));
    } finally { setIdeasBusy(false); }
  };

  // Honest total: Veo renders at most `veoMax` seconds per scene.
  const nScenes = scenes.length || count;
  const effClip = videoProvider === 'veo' ? Math.min(clip, veoMax) : clip;
  const totalSecs = nScenes * effClip;

  const scenesRef = useRef(scenes);
  useEffect(() => { scenesRef.current = scenes; }, [scenes]);

  const patch = (idx, obj) => setScenes((prev) => prev.map((s, i) => (i === idx ? { ...s, ...obj } : s)));
  const scenePrompt = (p) => (subject.trim() ? `${subject.trim()}. ${p}` : p);

  const plan = async () => {
    if (!brief.trim()) return;
    setPlanning(true); setStory(null); setSent(false);
    try {
      const topic = subject.trim() ? `${brief} (recurring main subject: ${subject.trim()})` : brief;
      const d = await effyApi.storyPlan({ workspace: workspace.id, topic, scenes: count, category, clipSeconds: clip, voiceover: voiceOn });
      setScenes((d.scenes || []).map((s) => ({ ...s, narration: s.narration || '', imageUrl: '', videoUrl: '', name: '', rendering: false, motion: 'push_in' })));
    } finally { setPlanning(false); }
  };

  const renderScene = async (idx) => {
    const sc = scenesRef.current[idx];
    if (!sc) return;
    patch(idx, { rendering: true, error: '' });
    try {
      const d = await effyApi.storyScene({
        workspace: workspace.id, prompt: scenePrompt(sc.prompt), aspect, seconds: clip, motion: sc.motion || 'push_in',
        voiceover: voiceOn, voice, caption: sc.caption || sc.title, narration: sc.narration || '',
      });
      if (d.op) {
        // Real Veo (image-to-video) — show the seed frame, poll until the clip lands.
        patch(idx, { imageUrl: d.imageUrl || '' });
        for (let i = 0; i < 40; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 8000));
          // eslint-disable-next-line no-await-in-loop
          const st = await effyApi.storySceneStatus({
            workspace: workspace.id, op: d.op,
            voiceover: voiceOn, voice, caption: sc.caption || sc.title, narration: sc.narration || '',
          });
          if (st.status === 'ready') {
            patch(idx, { rendering: false, videoUrl: st.videoUrl, name: st.name, hasAudio: true });
            return;
          }
        }
        patch(idx, { rendering: false, error: 'Still rendering — try again shortly.' });
        return;
      }
      patch(idx, { rendering: false, imageUrl: d.imageUrl || '', videoUrl: d.videoUrl || '', name: d.name || '', hasAudio: voiceOn });
    } catch (e) {
      patch(idx, { rendering: false, error: e.message || 'Failed' });
    }
  };

  const renderAll = async () => {
    setRenderingAll(true); setStory(null);
    for (let i = 0; i < scenesRef.current.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await renderScene(i);
    }
    setRenderingAll(false);
  };

  const addScene = () => setScenes((prev) => [
    ...prev,
    { title: `Scene ${prev.length + 1}`, prompt: '', caption: '', narration: '', imageUrl: '', videoUrl: '', name: '', rendering: false, motion: 'push_in' },
  ]);
  const removeScene = (idx) => setScenes((prev) => prev.filter((_, i) => i !== idx));

  const stitch = async () => {
    const names = scenes.filter((s) => s.name).map((s) => s.name);
    if (names.length < 2) return;
    setStitching(true);
    try {
      const withAudio = voiceOn || scenes.some((s) => s.hasAudio);
      const d = await effyApi.storyStitch({ workspace: workspace.id, names, audio: withAudio, music });
      setStory({ videoUrl: d.videoUrl });
    } finally { setStitching(false); }
  };

  const send = async () => {
    const caption = scenes.map((s, i) => `${i + 1}. ${s.caption || s.title}`).filter(Boolean).join('\n');
    await effyApi.sendToApproval({ workspace: workspace.id, hook: `Storyboard — ${brief.slice(0, 60)}`, caption, channel: 'youtube', type: 'video' });
    setSent(true);
  };

  const rendered = scenes.filter((s) => s.videoUrl).length;
  const portrait = aspect.startsWith('9');

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100dvh-9rem)] min-h-[36rem]">
      {/* ───────── LEFT: story + settings ───────── */}
      <aside className="lg:w-[360px] shrink-0 bg-surface rounded-3xl shadow-e2 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 h-14 border-b border-hair shrink-0">
          <button onClick={onBack} className="grid place-items-center w-8 h-8 rounded-lg text-ink-soft hover:bg-surface2 transition"><ArrowLeft className="w-4 h-4" /></button>
          <span className="inline-flex items-center gap-2 font-display text-[1.05rem] font-semibold tracking-tight">
            <Clapperboard className="w-4 h-4 text-coral-ink" /> Multi-Shot Story
          </span>
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-5 overflow-y-auto">
          {/* Category — shapes the planning arc (coral fill = selected) */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => pickCategory(c.key)}
                className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition',
                  category === c.key
                    ? 'bg-coral text-white shadow-coral'
                    : 'bg-surface2 text-ink-soft hover:bg-coral-tint hover:text-coral-ink')}>
                <c.icon className="w-3.5 h-3.5" /> {c.label}
              </button>
            ))}
          </div>
          <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">Describe your story</label>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)}
            placeholder="e.g. a day in the life at our clinic — from welcome to a happy patient walking out"
            className="w-full flex-1 min-h-[140px] rounded-2xl bg-surface2 px-4 py-3.5 text-sm leading-relaxed resize-none mb-4" />

          {/* recurring subject — keeps the character consistent */}
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">
            <User className="w-3.5 h-3.5" /> Main subject <span className="font-medium normal-case tracking-normal text-ink-faint/70">· optional</span>
          </label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Rohan, a cheerful man in his late 20s"
            className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm mb-4" />

          {/* settings */}
          <div className="space-y-2.5">
            <Setting label="Scenes">
              <div className="flex items-center rounded-lg bg-surface2 p-0.5">
                <button onClick={() => setCount((c) => Math.max(MIN_SCENES, c - 1))}
                  className="w-7 h-7 rounded-md text-sm font-bold text-ink-soft hover:bg-surface hover:text-ink">−</button>
                <span className="w-9 text-center text-sm font-extrabold tabular-nums text-ink">{count}</span>
                <button onClick={() => setCount((c) => Math.min(MAX_SCENES, c + 1))}
                  className="w-7 h-7 rounded-md text-sm font-bold text-ink-soft hover:bg-surface hover:text-ink">+</button>
              </div>
            </Setting>
            <Setting label="Format">
              <div className="flex rounded-lg bg-surface2 p-0.5">
                <button onClick={() => setAspect('16 / 9')} className={cn('px-2.5 h-7 rounded-md grid place-items-center', !portrait && 'bg-surface shadow-e1 text-coral-ink')}><Monitor className="w-4 h-4" /></button>
                <button onClick={() => setAspect('9 / 16')} className={cn('px-2.5 h-7 rounded-md grid place-items-center', portrait && 'bg-surface shadow-e1 text-coral-ink')}><Smartphone className="w-4 h-4" /></button>
              </div>
            </Setting>
            <Setting label="Clip length">
              <Segmented options={CLIPS} value={clip} onChange={setClip} suffix="s" />
            </Setting>
            <Setting label="Quick length">
              <div className="flex gap-1.5">
                {DURATION_PRESETS.map((p) => (
                  <button key={p.label} onClick={() => { setCount(p.scenes); setClip(p.clip); }}
                    className={cn('px-3 h-7 rounded-lg text-xs font-bold transition',
                      count === p.scenes && clip === p.clip ? 'bg-coral text-white' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                    {p.label}
                  </button>
                ))}
              </div>
            </Setting>
          </div>

          {/* Honest total-length readout */}
          <div className="mt-3 rounded-xl bg-surface2/60 px-3.5 py-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink"><Clock className="w-3.5 h-3.5 text-coral-ink" /> Total video</span>
              <span className="font-extrabold tabular-nums text-ink">≈ {fmtDur(totalSecs)}</span>
            </div>
            <p className="text-[0.7rem] text-ink-faint mt-0.5">{nScenes} scenes × {effClip}s</p>
            {videoProvider === 'veo' && clip > veoMax && (
              <p className="text-[0.7rem] text-warning mt-1">Veo renders max {veoMax}s per scene — {clip}s clips apply on the free engine. For ≈{fmtDur(nScenes * clip)}, switch the video engine to Free (Admin) or add scenes.</p>
            )}
          </div>

          {/* Audio: voiceover commentary + music bed */}
          <div className="mt-4 pt-4 border-t border-hair space-y-2.5">
            <Setting label={<span className="inline-flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Voiceover</span>}>
              <button onClick={() => setVoiceOn((v) => !v)}
                className={cn('relative h-6 w-11 rounded-full transition', voiceOn ? 'bg-coral' : 'bg-surface2')}>
                <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', voiceOn ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </Setting>
            {voiceOn && (
              <>
                <Setting label="Voice">
                  <select value={voice} onChange={(e) => setVoice(e.target.value)}
                    className="rounded-lg bg-surface2 px-2 py-1 text-xs font-semibold text-ink max-w-[9rem]">
                    <option value="">Auto</option>
                    {voices.map((v) => <option key={v.key} value={v.key}>{v.name} · {v.lang}</option>)}
                  </select>
                </Setting>
                <Setting label="Music">
                  <select value={music} onChange={(e) => setMusic(e.target.value)}
                    className="rounded-lg bg-surface2 px-2 py-1 text-xs font-semibold text-ink max-w-[9rem]">
                    {musicOpts.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}
                  </select>
                </Setting>
                <p className="text-[0.7rem] text-ink-faint leading-snug">Narration is written to fill each scene's length — a 2:00 story gets ~2:00 of speech. Edit it per scene before rendering.</p>
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-hair shrink-0">
          <Button variant="spark" className="w-full" onClick={plan} disabled={planning || !brief.trim()}>
            <Sparkles className="w-4 h-4" /> {planning ? 'Planning…' : scenes.length ? 'Re-plan storyboard' : `Plan ${count} scenes`}
          </Button>
        </div>
      </aside>

      {/* ───────── RIGHT: immersive stage ───────── */}
      <section className="flex-1 min-w-0 bg-[radial-gradient(1200px_500px_at_50%_-10%,var(--tw-gradient-stops))] from-coral-tint/50 to-surface2/40 rounded-3xl shadow-inner flex flex-col overflow-hidden">
        {scenes.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 h-14 border-b border-hair/60 backdrop-blur-sm shrink-0 flex-wrap">
            <h3 className="font-bold text-ink text-sm">Shots <span className="text-ink-faint font-medium">· {rendered}/{scenes.length} rendered</span></h3>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={renderAll} disabled={renderingAll}>
                {renderingAll ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                {renderingAll ? 'Rendering…' : 'Render all'}
              </Button>
              <Button size="sm" onClick={stitch} disabled={rendered < 2 || stitching}>
                {stitching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                {stitching ? 'Stitching…' : 'Stitch story'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
          {/* stitched preview — hero */}
          {story?.videoUrl && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-bold text-ink inline-flex items-center gap-2"><Play className="w-4 h-4 text-coral-ink" /> Full story preview</h3>
                <div className="flex items-center gap-2">
                  <a href={story.videoUrl} download><Button variant="secondary" size="sm"><Download className="w-3.5 h-3.5" /> Download</Button></a>
                  <Button size="sm" onClick={send} disabled={sent}>
                    {sent ? <><Check className="w-3.5 h-3.5" /> Sent</> : <><Send className="w-3.5 h-3.5" /> Send to approval</>}
                  </Button>
                </div>
              </div>
              <div className={cn('rounded-2xl overflow-hidden bg-black mx-auto shadow-e3', portrait ? 'max-w-[320px]' : 'max-w-[680px]')}>
                <video src={story.videoUrl} controls autoPlay loop className="w-full" style={{ aspectRatio: aspect }} />
              </div>
            </div>
          )}

          {/* shots */}
          {scenes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {scenes.map((s, i) => (
                <div key={i} className="group bg-surface rounded-2xl shadow-e2 overflow-hidden flex flex-col">
                  <div className="relative bg-ink/90" style={{ aspectRatio: aspect }}>
                    {s.videoUrl
                      ? <video src={s.videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                      : s.imageUrl
                        ? <img src={s.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        : <div className="absolute inset-0 grid place-items-center text-white/25"><ImageIcon className="w-7 h-7" /></div>}
                    <span className="absolute top-2 left-2 grid place-items-center min-w-[24px] h-6 px-1.5 rounded-md bg-ink/60 text-white text-xs font-bold backdrop-blur-sm">{i + 1}</span>
                    <button onClick={() => removeScene(i)} title="Remove shot"
                      className="absolute top-2 right-2 grid place-items-center w-6 h-6 rounded-md bg-ink/60 text-white hover:bg-error backdrop-blur-sm transition opacity-0 group-hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
                    {/* caption overlay */}
                    {s.caption && <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/75 to-transparent"><p className="text-white text-xs font-semibold leading-snug line-clamp-2">{s.caption}</p></div>}
                    {s.rendering && (
                      <div className="absolute inset-0 grid place-items-center bg-ink/50 backdrop-blur-sm text-white text-xs font-semibold">
                        <span className="inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rendering…</span>
                      </div>
                    )}
                    {/* hover render control */}
                    <button onClick={() => renderScene(i)} disabled={s.rendering || renderingAll}
                      className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform bg-ink/80 text-white text-xs font-bold py-2 inline-flex items-center justify-center gap-1.5 disabled:opacity-60">
                      {s.videoUrl ? <><RefreshCw className="w-3.5 h-3.5" /> Regenerate shot</> : <><Film className="w-3.5 h-3.5" /> Render shot</>}
                    </button>
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    <input value={s.caption} onChange={(e) => patch(i, { caption: e.target.value })} placeholder="On-screen caption"
                      className="w-full rounded-lg bg-surface2 px-2.5 py-1.5 text-xs font-semibold text-ink" />
                    {voiceOn && (
                      <textarea value={s.narration || ''} onChange={(e) => patch(i, { narration: e.target.value })} rows={2}
                        placeholder="Narration (spoken) — written to fill the scene length"
                        className="w-full rounded-lg bg-coral-tint/40 px-2.5 py-1.5 text-[0.7rem] text-ink leading-snug resize-none" />
                    )}
                    <textarea value={s.prompt} onChange={(e) => patch(i, { prompt: e.target.value })} rows={2}
                      placeholder="Describe the visual for this shot…"
                      className="w-full rounded-lg bg-surface2 px-2.5 py-1.5 text-[0.7rem] text-ink-soft leading-snug resize-none" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wide text-ink-faint">Motion</span>
                      <select value={s.motion || 'push_in'} onChange={(e) => patch(i, { motion: e.target.value })}
                        className="flex-1 rounded-lg bg-surface2 px-2 py-1 text-[0.7rem] font-semibold text-ink">
                        {MOTIONS.map((mo) => <option key={mo.key} value={mo.key}>{mo.label}</option>)}
                      </select>
                    </div>
                    {s.error && <p className="text-[0.7rem] text-error">{s.error}</p>}
                  </div>
                </div>
              ))}
              {/* add shot */}
              <button onClick={addScene}
                className="min-h-[200px] rounded-2xl border-2 border-dashed border-line grid place-items-center text-ink-soft hover:text-coral-ink hover:border-coral/40 hover:bg-coral-tint/40 transition">
                <span className="flex flex-col items-center gap-1.5 text-sm font-semibold">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-surface shadow-e1"><Plus className="w-5 h-5" /></span>
                  Add shot
                </span>
              </button>
            </div>
          ) : !planning && (
            /* immersive empty state — Runway-style examples */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-10">
              <span className="grid place-items-center w-16 h-16 rounded-2xl bg-aurora text-white shadow-coral mb-5"><Clapperboard className="w-8 h-8" /></span>
              <h2 className="font-display text-[1.9rem] leading-tight font-semibold tracking-tight mb-2">Multi-Shot Story</h2>
              <p className="text-ink-soft mb-8">Write a simple brief. Get a multi-scene story — a frame and a short clip each — stitched into one preview your client can watch end-to-end.</p>
              <div className="w-full">
                <div className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-3 text-left">
                  {category ? `${CATEGORIES.find((c) => c.key === category)?.label} ideas for your brand — pick one` : 'Try one of these'}
                </div>
                {ideasBusy ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-surface2 animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(category && ideas ? ideas.map((i) => ({ title: i.title, body: i.brief })) : EXAMPLES).map((ex) => (
                      <button key={ex.title} onClick={() => setBrief(ex.body)}
                        className={cn('text-left rounded-2xl bg-surface shadow-e1 hover:shadow-e3 hover:-translate-y-0.5 transition-all p-4',
                          brief === ex.body && 'ring-2 ring-coral/40')}>
                        <div className="font-bold text-sm text-ink mb-1">{ex.title}</div>
                        <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">{ex.body}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {planning && (
            <div className="h-full grid place-items-center">
              <div className="flex items-center gap-2 text-ink-soft text-sm"><RefreshCw className="w-4 h-4 animate-spin" /> Planning your shots…</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Setting({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      {children}
    </div>
  );
}

function Segmented({ options, value, onChange, suffix = '' }) {
  return (
    <div className="flex rounded-lg bg-surface2 p-0.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={cn('px-3 h-7 rounded-md text-sm font-bold', value === o ? 'bg-surface shadow-e1 text-coral-ink' : 'text-ink-soft')}>
          {o}{suffix}
        </button>
      ))}
    </div>
  );
}
