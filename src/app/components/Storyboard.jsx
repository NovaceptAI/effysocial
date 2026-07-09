import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clapperboard, Sparkles, RefreshCw, Film, Play, Check, Send,
  Monitor, Smartphone, Wand2, ImageIcon, Download,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const COUNTS = [3, 4, 5, 6];
const SECONDS = 8; // per-scene clip length (Ken-Burns free provider)

export default function Storyboard({ format, onBack, initialBrief = '' }) {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  const [brief, setBrief] = useState(initialBrief);
  const [count, setCount] = useState(4);
  const [aspect, setAspect] = useState(format.aspect || '16 / 9');
  const [scenes, setScenes] = useState([]);      // {title, prompt, caption, imageUrl, videoUrl, name, rendering, error}
  const [planning, setPlanning] = useState(false);
  const [renderingAll, setRenderingAll] = useState(false);
  const [story, setStory] = useState(null);       // stitched {videoUrl}
  const [stitching, setStitching] = useState(false);
  const [sent, setSent] = useState(false);

  const scenesRef = useRef(scenes);
  useEffect(() => { scenesRef.current = scenes; }, [scenes]);

  const patch = (idx, obj) => setScenes((prev) => prev.map((s, i) => (i === idx ? { ...s, ...obj } : s)));

  const plan = async () => {
    if (!brief.trim()) return;
    setPlanning(true); setStory(null); setSent(false);
    try {
      const d = await effyApi.storyPlan({ workspace: workspace.id, topic: brief, scenes: count });
      setScenes((d.scenes || []).map((s) => ({ ...s, imageUrl: '', videoUrl: '', name: '', rendering: false })));
    } finally { setPlanning(false); }
  };

  const renderScene = async (idx) => {
    const sc = scenesRef.current[idx];
    if (!sc) return;
    patch(idx, { rendering: true, error: '' });
    try {
      const d = await effyApi.storyScene({ workspace: workspace.id, prompt: sc.prompt, aspect, seconds: SECONDS });
      patch(idx, { rendering: false, imageUrl: d.imageUrl || '', videoUrl: d.videoUrl || '', name: d.name || '' });
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

  const stitch = async () => {
    const names = scenes.filter((s) => s.name).map((s) => s.name);
    if (names.length < 2) return;
    setStitching(true);
    try {
      const d = await effyApi.storyStitch({ workspace: workspace.id, names });
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
    <div className="-mt-1">
      {/* top bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Formats
        </button>
        <div className="h-5 w-px bg-line" />
        <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <Clapperboard className="w-4 h-4 text-coral-ink" /> YouTube Story
        </span>
        <Badge tone="new">Storyboard</Badge>
        <div className="flex-1" />
        <div className="flex rounded-lg bg-surface2 p-0.5">
          <button onClick={() => setAspect('16 / 9')} title="Landscape" className={cn('p-1.5 rounded-md', !portrait && 'bg-surface shadow-e1 text-coral-ink')}><Monitor className="w-4 h-4" /></button>
          <button onClick={() => setAspect('9 / 16')} title="Portrait" className={cn('p-1.5 rounded-md', portrait && 'bg-surface shadow-e1 text-coral-ink')}><Smartphone className="w-4 h-4" /></button>
        </div>
      </div>

      {/* brief */}
      <div className="bg-surface rounded-2xl shadow-e1 p-5 mb-5">
        <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">What's the story?</label>
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={2}
          placeholder="e.g. a day in the life at our clinic — from welcome to happy patient walking out"
          className="w-full rounded-xl bg-surface2 px-3.5 py-3 text-sm leading-relaxed resize-none mb-3" />
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-ink-soft">Scenes</span>
          <div className="flex rounded-lg bg-surface2 p-0.5">
            {COUNTS.map((c) => (
              <button key={c} onClick={() => setCount(c)}
                className={cn('w-8 h-7 rounded-md text-sm font-bold', count === c ? 'bg-surface shadow-e1 text-coral-ink' : 'text-ink-soft')}>{c}</button>
            ))}
          </div>
          <div className="flex-1" />
          <Button variant="spark" onClick={plan} disabled={planning || !brief.trim()}>
            <Sparkles className="w-4 h-4" /> {planning ? 'Planning…' : scenes.length ? 'Re-plan storyboard' : 'Plan storyboard'}
          </Button>
        </div>
      </div>

      {/* scene strip */}
      {scenes.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-bold text-ink">Frames <span className="text-ink-faint font-medium">· {rendered}/{scenes.length} rendered</span></h3>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={renderAll} disabled={renderingAll}>
                {renderingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {renderingAll ? 'Rendering…' : 'Render all frames'}
              </Button>
              <Button onClick={stitch} disabled={rendered < 2 || stitching}>
                {stitching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                {stitching ? 'Stitching…' : 'Stitch story'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {scenes.map((s, i) => (
              <div key={i} className="bg-surface rounded-2xl shadow-e1 p-3 flex flex-col">
                <div className="relative rounded-xl overflow-hidden bg-surface2" style={{ aspectRatio: aspect }}>
                  {s.videoUrl
                    ? <video src={s.videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                    : s.imageUrl
                      ? <img src={s.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      : <div className="absolute inset-0 grid place-items-center text-ink-faint"><ImageIcon className="w-6 h-6" /></div>}
                  <span className="absolute top-2 left-2 grid place-items-center min-w-[22px] h-[22px] px-1.5 rounded-md bg-ink/55 text-white text-xs font-bold backdrop-blur-sm">{i + 1}</span>
                  {s.videoUrl && <span className="absolute bottom-2 right-2 grid place-items-center w-6 h-6 rounded-full bg-ink/55 text-white backdrop-blur-sm"><Play className="w-3 h-3" /></span>}
                  {s.rendering && (
                    <div className="absolute inset-0 grid place-items-center bg-ink/40 backdrop-blur-sm text-white text-xs font-semibold">
                      <span className="inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rendering…</span>
                    </div>
                  )}
                </div>
                <input value={s.caption} onChange={(e) => patch(i, { caption: e.target.value })}
                  placeholder="On-screen caption"
                  className="mt-2.5 w-full rounded-lg bg-surface2 px-2.5 py-1.5 text-xs font-semibold text-ink" />
                <textarea value={s.prompt} onChange={(e) => patch(i, { prompt: e.target.value })} rows={2}
                  className="mt-1.5 w-full rounded-lg bg-surface2 px-2.5 py-1.5 text-[0.7rem] text-ink-soft leading-snug resize-none" />
                <Button variant="secondary" size="sm" className="mt-2" onClick={() => renderScene(i)} disabled={s.rendering || renderingAll}>
                  {s.videoUrl ? <RefreshCw className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                  {s.videoUrl ? 'Regenerate' : 'Render frame'}
                </Button>
                {s.error && <p className="mt-1.5 text-[0.7rem] text-error">{s.error}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* stitched story */}
      {story?.videoUrl && (
        <div className="bg-surface rounded-2xl shadow-e1 p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-bold text-ink inline-flex items-center gap-2"><Clapperboard className="w-4 h-4 text-coral-ink" /> Full story preview</h3>
            <div className="flex items-center gap-2">
              <a href={story.videoUrl} download>
                <Button variant="secondary" size="sm"><Download className="w-3.5 h-3.5" /> Download</Button>
              </a>
              <Button size="sm" onClick={send} disabled={sent}>
                {sent ? <><Check className="w-3.5 h-3.5" /> Sent</> : <><Send className="w-3.5 h-3.5" /> Send to approval</>}
              </Button>
            </div>
          </div>
          <div className={cn('rounded-xl overflow-hidden bg-black mx-auto', portrait ? 'max-w-[360px]' : 'max-w-[720px]')}>
            <video src={story.videoUrl} controls autoPlay loop className="w-full" style={{ aspectRatio: aspect }} />
          </div>
        </div>
      )}

      {scenes.length === 0 && !planning && (
        <div className="text-center py-16">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-coral-ink mx-auto mb-4"><Clapperboard className="w-6 h-6" /></div>
          <h3 className="font-display text-xl font-semibold tracking-tight mb-1.5">Storyboard a longer video</h3>
          <p className="text-sm text-ink-soft leading-relaxed max-w-sm mx-auto">
            Describe the story and we'll break it into {count} scenes — a frame and a short clip each — then stitch them into one preview your client can watch end-to-end.
          </p>
        </div>
      )}
    </div>
  );
}
