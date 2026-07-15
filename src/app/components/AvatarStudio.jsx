import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, UserSquare, Upload, Check, RefreshCw, Sparkles, Mic, FileAudio,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button, Badge } from '../../ui';
import ShareRow from './ShareRow';
import { cn } from '../../lib/cn';

const FESTIVALS = ['Diwali', 'Holi', 'Navratri', 'Eid', 'Christmas', 'New Year'];
// ~35 words ≈ 15 seconds of speech — the Sync Labs free-tier render limit.
const demoScript = (name, festival) =>
  `Hi, I'm ${name || 'Rohan'}! Wishing you and your family a very happy ${festival}. ` +
  `This ${festival}, we have something special waiting for you — visit us and celebrate with our exclusive festive offers. See you soon!`;

const GUIDELINES = [
  'One person, face clearly visible and front-facing',
  'Good, even lighting — avoid strong backlight',
  '10–60 seconds, minimal head movement works best',
  'MP4 or MOV, max 20 MB',
];

export default function AvatarStudio({ onBack }) {
  const { workspace } = useWorkspace();
  const [source, setSource] = useState('demo');  // demo | upload
  const [demoName, setDemoName] = useState('');
  const [festival, setFestival] = useState('Diwali');
  const [videoFile, setVideoFile] = useState(null);
  const [mode, setMode] = useState('script');    // script | audio
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('');
  const [language, setLanguage] = useState('English');
  const [audioFile, setAudioFile] = useState(null);
  const [state, setState] = useState('idle');    // idle|rendering|done|error
  const [msg, setMsg] = useState('');
  const [result, setResult] = useState('');
  const vidRef = useRef(null);
  const audRef = useRef(null);

  const { data: audioOpts } = useQuery({ queryKey: ['studio-voices'], queryFn: () => effyApi.studioVoices() });
  const voices = audioOpts?.voices || [];

  // Demo mode: name/festival compose the script (still editable afterwards).
  React.useEffect(() => {
    if (source === 'demo') setScript(demoScript(demoName, festival));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, demoName, festival]);

  const canGo = (source === 'demo' ? true : !!videoFile) && (mode === 'audio' ? !!audioFile : script.trim().length > 0);

  const generate = async () => {
    setState('rendering'); setMsg('Uploading your clip…'); setResult('');
    try {
      const { job } = await effyApi.avatarSubmit(workspace.id, {
        video: videoFile, template: source === 'demo' ? 'demo' : '',
        audioFile: mode === 'audio' ? audioFile : null,
        script: mode === 'script' ? script.trim() : '',
        voice, language,
      });
      setMsg('Rendering the avatar — lipsync usually takes 1–4 minutes…');
      for (let i = 0; i < 60; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 8000));
        // eslint-disable-next-line no-await-in-loop
        const st = await effyApi.avatarStatus({ workspace: workspace.id, job });
        if (st.status === 'ready') { setResult(st.videoUrl); setState('done'); setMsg(''); return; }
      }
      setState('error'); setMsg('Still rendering — check the Media Library in a few minutes.');
    } catch (e) {
      setState('error'); setMsg(e.message || 'Avatar render failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Formats
        </button>
        <div className="h-5 w-px bg-line" />
        <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <UserSquare className="w-4 h-4 text-coral-ink" /> AI Avatar Video
        </span>
        <Badge tone="new">Lipsync</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-stretch">
        {/* 1 — the person */}
        <div className="bg-surface rounded-2xl shadow-e1 p-6">
          <h3 className="font-bold text-ink text-lg mb-1">1 · The person</h3>
          <div className="flex gap-1.5 my-3">
            <button onClick={() => setSource('demo')}
              className={cn('flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition',
                source === 'demo' ? 'bg-ink text-white' : 'bg-surface2 text-ink-soft')}>
              Demo avatar
            </button>
            <button onClick={() => setSource('upload')}
              className={cn('flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition',
                source === 'upload' ? 'bg-ink text-white' : 'bg-surface2 text-ink-soft')}>
              Upload your own
            </button>
          </div>

          {source === 'demo' ? (
            <>
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video src="/formats/00125.mp4" muted loop playsInline className="w-full"
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})} onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                <span className="absolute top-2 left-2"><Badge tone="success">Ready to use · 10s</Badge></span>
              </div>
              <p className="text-xs text-ink-faint mt-2 mb-3">Change the name or celebration below — the script updates and he says it.</p>
              <div className="flex gap-2">
                <input value={demoName} onChange={(e) => setDemoName(e.target.value)} placeholder="Name (e.g. Rohan)"
                  className="flex-1 min-w-0 rounded-xl bg-surface2 px-3.5 py-2.5 text-sm font-semibold" />
                <select value={festival} onChange={(e) => setFestival(e.target.value)}
                  className="rounded-xl bg-surface2 px-3.5 py-2.5 text-sm font-semibold">
                  {FESTIVALS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <input ref={vidRef} type="file" accept="video/mp4,video/quicktime" hidden
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              <button onClick={() => vidRef.current?.click()}
                className={cn('w-full rounded-xl border-2 border-dashed p-5 text-center transition',
                  videoFile ? 'border-success bg-success-soft/40' : 'border-line hover:border-coral/50 hover:bg-coral-tint/30')}>
                {videoFile ? (
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-ink"><Check className="w-4 h-4 text-success" /> {videoFile.name}</span>
                ) : (
                  <span className="flex flex-col items-center gap-1.5 text-ink-soft">
                    <Upload className="w-5 h-5" /><span className="text-sm font-semibold">Upload clip</span>
                  </span>
                )}
              </button>
              <ul className="mt-3 space-y-1">
                {GUIDELINES.map((g) => (
                  <li key={g} className="flex items-start gap-1.5 text-xs text-ink-faint"><Check className="w-3 h-3 text-success shrink-0 mt-0.5" /> {g}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* 2 — the speech */}
        <div className="bg-surface rounded-2xl shadow-e1 p-6 flex flex-col">
          <h3 className="font-bold text-ink text-lg mb-1">2 · What they say</h3>
          <div className="flex gap-1.5 my-3">
            <button onClick={() => setMode('script')}
              className={cn('flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition',
                mode === 'script' ? 'bg-ink text-white' : 'bg-surface2 text-ink-soft')}>
              <Mic className="w-3.5 h-3.5" /> Script + AI voice
            </button>
            <button onClick={() => setMode('audio')}
              className={cn('flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition',
                mode === 'audio' ? 'bg-ink text-white' : 'bg-surface2 text-ink-soft')}>
              <FileAudio className="w-3.5 h-3.5" /> Upload audio
            </button>
          </div>
          {mode === 'script' ? (
            <>
              <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={9}
                placeholder="Type what they should say… e.g. Namaste! This Diwali, get 20% off on all dental checkups at our clinic."
                className="w-full flex-1 min-h-[220px] rounded-xl bg-surface2 px-4 py-3 text-[0.95rem] leading-relaxed mb-1" />
              <p className={cn('text-[0.7rem] mb-2.5', script.trim().split(/\s+/).filter(Boolean).length > 38 ? 'text-warning' : 'text-ink-faint')}>
                {script.trim().split(/\s+/).filter(Boolean).length} words · lipsync renders ~15s (~38 words max — longer scripts are trimmed)
              </p>
              <div className="flex gap-2">
                <select value={voice} onChange={(e) => setVoice(e.target.value)} className="flex-1 rounded-xl bg-surface2 px-3 py-2.5 text-sm font-semibold">
                  <option value="">Auto voice</option>
                  {voices.map((v) => <option key={v.key} value={v.key}>{v.name} · {v.lang}</option>)}
                </select>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-xl bg-surface2 px-3 py-2.5 text-sm font-semibold">
                  {['English', 'Hindi', 'Hinglish', 'Marathi'].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <input ref={audRef} type="file" accept="audio/*" hidden onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              <button onClick={() => audRef.current?.click()}
                className={cn('w-full rounded-xl border-2 border-dashed p-5 text-center transition',
                  audioFile ? 'border-success bg-success-soft/40' : 'border-line hover:border-coral/50 hover:bg-coral-tint/30')}>
                {audioFile ? (
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-ink"><Check className="w-4 h-4 text-success" /> {audioFile.name}</span>
                ) : (
                  <span className="flex flex-col items-center gap-1.5 text-ink-soft">
                    <FileAudio className="w-5 h-5" /><span className="text-sm font-semibold">Upload MP3/WAV</span>
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <Button variant="spark" size="lg" onClick={generate} disabled={!canGo || state === 'rendering'}>
          {state === 'rendering' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {state === 'rendering' ? 'Rendering…' : 'Create avatar video'}
        </Button>
        {msg && <p className="text-xs text-ink-faint mt-2 text-center">{msg}</p>}
      </div>

      {result && (
        <div className="mt-6 bg-surface rounded-2xl shadow-e1 p-5">
          <h3 className="font-bold text-ink mb-3">Your avatar video</h3>
          <video src={result} controls autoPlay className="w-full max-w-md mx-auto rounded-xl bg-black" />
          <ShareRow videoUrl={result} caption={script} />
        </div>
      )}
    </div>
  );
}
