import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, UserSquare, Plus, RefreshCw, Sparkles, Check, Trash2, Mic, X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Badge, Button } from '../../ui';
import ShareRow from './ShareRow';
import { cn } from '../../lib/cn';

/* EffyCharacters — Runway-Characters-style gallery of lip-sync speakers.
   Pick a character, write the words, they speak them. Presets ship with the
   product; custom characters come from a photo (Veo-animated) or a clip. */

export default function CharactersStudio({ onBack }) {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);   // {kind:'preset',key} | {kind:'custom',id}
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVoice, setNewVoice] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('');
  const [language, setLanguage] = useState('Hinglish');
  const [state, setState] = useState('idle');       // idle|creating|rendering|done|error
  const [msg, setMsg] = useState('');
  const [result, setResult] = useState('');
  const fileRef = useRef(null);

  const { data, refetch } = useQuery({
    queryKey: ['characters', workspace?.id],
    queryFn: () => effyApi.listCharacters(workspace.id),
    enabled: !!workspace,
  });
  const { data: audioOpts } = useQuery({ queryKey: ['studio-voices'], queryFn: () => effyApi.studioVoices() });
  const voices = audioOpts?.voices || [];
  const presets = data?.presets || [];
  const custom = data?.custom || [];
  const maxWords = data?.maxWords || 38;
  const words = script.trim() ? script.trim().split(/\s+/).length : 0;

  const active = selected?.kind === 'preset'
    ? presets.find((p) => p.key === selected.key)
    : custom.find((x) => x.id === selected?.id);

  const pick = (ch) => {
    if (!ch.ready) return;
    setSelected(ch.kind === 'preset' ? { kind: 'preset', key: ch.key } : { kind: 'custom', id: ch.id });
    setVoice(ch.voice || '');
    setResult('');
    setState('idle');
    setMsg('');
  };

  const createCharacter = async () => {
    if (!newName.trim() || !newFile) return;
    setState('creating'); setMsg('');
    try {
      const isVideo = newFile.type.startsWith('video');
      const ch = await effyApi.createCharacter(workspace.id, {
        name: newName.trim(), voice: newVoice,
        [isVideo ? 'video' : 'photo']: newFile,
      });
      setCreating(false); setNewName(''); setNewFile(null);
      qc.invalidateQueries({ queryKey: ['characters', workspace?.id] });
      if (ch.status === 'animating') {
        setMsg(`${ch.name} is being brought to life (~1–2 min)…`);
        for (let i = 0; i < 40; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 8000));
          // eslint-disable-next-line no-await-in-loop
          const st = await effyApi.characterStatus(ch.id);
          if (st.status === 'ready') { refetch(); setMsg(''); break; }
          if (st.status === 'error') { setMsg(st.message || 'Animation failed.'); break; }
        }
      }
      setState('idle');
    } catch (e) {
      setState('error'); setMsg(e.message || 'Could not create the character.');
    }
  };

  const speak = async () => {
    if (!active?.ready || !script.trim()) return;
    setState('rendering'); setResult(''); setMsg('Putting your words in their mouth — usually 1–4 minutes…');
    try {
      const { job } = await effyApi.characterSpeak({
        workspace: workspace.id,
        preset: selected.kind === 'preset' ? selected.key : undefined,
        characterId: selected.kind === 'custom' ? selected.id : undefined,
        script: script.trim(), voice, language,
      });
      for (let i = 0; i < 60; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 8000));
        // eslint-disable-next-line no-await-in-loop
        const st = await effyApi.avatarStatus({ workspace: workspace.id, job });
        if (st.status === 'ready') { setResult(st.videoUrl); setState('done'); setMsg(''); return; }
      }
      setState('error'); setMsg('Still rendering — check the Media Library in a few minutes.');
    } catch (e) {
      setState('error'); setMsg(e.message || 'Render failed.');
    }
  };

  const closeSpeak = () => { setSelected(null); setResult(''); setState('idle'); setMsg(''); setScript(''); };
  const closeCreate = () => { setCreating(false); setMsg(''); setNewName(''); setNewFile(null); setState('idle'); };

  const CharCard = ({ ch }) => {
    const isActive = active && ((ch.kind === 'preset' && ch.key === active.key) || (ch.kind === 'custom' && ch.id === active.id));
    const vidRef = useRef(null);
    const canPlay = ch.ready && ch.previewUrl;
    const playHover = () => { const v = vidRef.current; if (v) v.play().catch(() => {}); };
    const stopHover = () => { const v = vidRef.current; if (v) { v.pause(); v.currentTime = 0; } };
    return (
      <button type="button" onClick={() => pick(ch)}
        onMouseEnter={canPlay ? playHover : undefined} onMouseLeave={canPlay ? stopHover : undefined}
        className={cn(
          'group relative rounded-2xl overflow-hidden text-left transition-all duration-300 bg-transparent',
          ch.ready ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed',
          isActive ? 'ring-2 ring-coral shadow-coral' : 'ring-1 ring-black/10',
        )}
        style={{ aspectRatio: '3 / 4', background: '#0D0E12' }}>
        {canPlay ? (
          <video ref={vidRef} src={ch.previewUrl} poster={ch.portraitUrl || undefined}
            muted loop playsInline preload="none"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : ch.portraitUrl ? (
          <img src={ch.portraitUrl} alt={ch.name} loading="lazy"
            className={cn('absolute inset-0 w-full h-full object-cover transition-transform duration-500',
              ch.ready && 'group-hover:scale-105', !ch.ready && 'opacity-45 grayscale-[35%]')} />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-white/20"><UserSquare className="w-12 h-12" /></span>
        )}
        <span className="absolute top-2.5 left-2.5 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-black/55 text-white/85 backdrop-blur-sm">
          {ch.kind === 'preset' ? 'PRESET' : 'YOURS'}
        </span>
        {!ch.ready && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/55 text-amber-300 backdrop-blur-sm">
            {ch.status === 'animating' ? 'ANIMATING…' : 'COMING SOON'}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 p-4 pt-10" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
          <span className="block text-white font-bold text-[19px] leading-tight">{ch.name}</span>
          <span className="block text-white/55 text-[13px] mt-1">{ch.role}</span>
        </span>
        {isActive && (
          <span className="absolute bottom-3 right-3 grid place-items-center w-6 h-6 rounded-full bg-coral text-white"><Check className="w-3.5 h-3.5" /></span>
        )}
      </button>
    );
  };

  const hero = presets.find((p) => p.ready && p.previewUrl) || presets.find((p) => p.portraitUrl) || presets[0];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink bg-transparent">
          <ArrowLeft className="w-4 h-4" /> Formats
        </button>
        <div className="h-5 w-px bg-line" />
        <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <UserSquare className="w-4 h-4 text-coral-ink" /> EffyCharacters
        </span>
        <Badge tone="new">Lip-sync speakers</Badge>
      </div>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl mb-8" style={{ background: '#0D0E12', minHeight: 320 }}>
        {hero?.previewUrl ? (
          <video src={hero.previewUrl} muted loop autoPlay playsInline preload="auto" poster={hero.portraitUrl || undefined}
            className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
        ) : hero?.portraitUrl ? (
          <img src={hero.portraitUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 20%' }} />
        ) : null}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(13,14,18,0.30) 0%, rgba(13,14,18,0.72) 62%, rgba(13,14,18,0.96) 100%)' }} />
        <div className="relative px-8 py-16 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-coral mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Introducing EffyCharacters
          </span>
          <h2 className="font-display text-white font-bold tracking-tight text-3xl sm:text-[42px] leading-[1.05] mb-4">
            Bring your brand to life
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-xl text-center">
            Lifelike lip-sync speakers, ready to talk. Pick a character, write the words, and they say it — in your language, in your voice.
          </p>
        </div>
      </div>

      {/* Gallery */}
      <h3 className="font-display text-xl font-semibold tracking-tight text-ink mb-4">Try Featured Characters</h3>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {/* Custom character card */}
        <button type="button" onClick={() => { setSelected(null); setCreating(true); }}
          className="relative rounded-2xl grid place-items-center transition-all duration-300 hover:-translate-y-1 bg-transparent ring-1 ring-black/10"
          style={{ aspectRatio: '3 / 4', background: 'linear-gradient(160deg, #16181D, #1d2026)' }}>
          <span className="grid place-items-center gap-2 text-white/60">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/10"><Plus className="w-6 h-6" /></span>
          </span>
          <span className="absolute inset-x-0 bottom-0 p-4">
            <span className="block text-white font-bold text-[19px]">Custom Character</span>
            <span className="block text-white/50 text-[13px] mt-1">From a photo or a clip</span>
          </span>
        </button>
        {presets.map((p) => <CharCard key={p.key} ch={p} />)}
        {custom.map((c) => <CharCard key={`c${c.id}`} ch={c} />)}
      </div>
      {custom.length > 0 && (
        <p className="text-[11.5px] text-ink-faint mt-4">
          Remove a custom character from its card in Media Library, or{' '}
          {custom.map((c) => (
            <button key={c.id} type="button"
              onClick={() => window.confirm(`Delete ${c.name}?`) && effyApi.deleteCharacter(c.id).then(() => { setSelected(null); refetch(); })}
              className="bg-transparent underline text-ink-faint hover:text-red-500 mr-1.5">
              delete {c.name}
            </button>
          ))}
        </p>
      )}

      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCreate} />
          <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={closeCreate}
              className="absolute top-4 right-4 grid place-items-center w-8 h-8 rounded-full bg-surface2 text-ink-soft hover:text-ink"><X className="w-4 h-4" /></button>
            <h3 className="font-bold text-ink text-lg mb-1">New character</h3>
            <p className="text-xs text-ink-soft mb-4">
              A short clip becomes the character directly. A photo gets brought to life with AI
              (~$0.90, one time) — front-facing, good light, mouth closed.
            </p>
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Sunita"
              className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm mb-3" />
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Default voice</label>
            <select value={newVoice} onChange={(e) => setNewVoice(e.target.value)}
              className="w-full rounded-xl bg-surface2 px-3 py-2.5 text-sm mb-3">
              <option value="">Pick later</option>
              {voices.map((v) => <option key={v.key} value={v.key}>{v.name} — {v.lang} ({v.gender})</option>)}
            </select>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-line bg-transparent px-3 py-5 text-sm font-semibold text-ink-soft hover:text-ink mb-3">
              {newFile ? newFile.name : 'Choose photo (JPG/PNG) or clip (MP4)'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,video/mp4" hidden
              onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
            <div className="flex gap-2">
              <Button onClick={createCharacter} disabled={!newName.trim() || !newFile || state === 'creating'}>
                {state === 'creating' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Create
              </Button>
              <Button variant="ghost" onClick={closeCreate}>Cancel</Button>
            </div>
            {msg && <p className={cn('text-xs mt-3', state === 'error' ? 'text-red-500' : 'text-ink-soft')}>{msg}</p>}
          </div>
        </div>
      )}

      {/* Speak modal */}
      {!creating && active && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSpeak} />
          <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={closeSpeak}
              className="absolute top-4 right-4 grid place-items-center w-8 h-8 rounded-full bg-surface2 text-ink-soft hover:text-ink"><X className="w-4 h-4" /></button>
            <h3 className="font-bold text-ink text-lg mb-1">{active.name} speaks</h3>
            <p className="text-xs text-ink-soft mb-4">Write the words — the character lip-syncs them in the chosen voice.</p>
            {active.previewUrl && !result && (
              <video src={active.previewUrl} muted loop autoPlay playsInline
                className="w-full rounded-xl mb-3 bg-black" style={{ maxHeight: 260, objectFit: 'contain' }} />
            )}
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">
              Script <span className={cn('font-semibold', words > maxWords ? 'text-red-500' : 'text-ink-faint')}>({words}/{maxWords} words)</span>
            </label>
            <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4}
              placeholder={`What should ${active.name} say? ~${maxWords} words ≈ 15 seconds.`}
              className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm mb-3 resize-y" />
            <div className="grid grid-cols-2 gap-2 mb-4">
              <select value={voice} onChange={(e) => setVoice(e.target.value)}
                className="rounded-xl bg-surface2 px-3 py-2.5 text-sm">
                <option value="">{active.voice ? 'Character default' : 'Default voice'}</option>
                {voices.map((v) => <option key={v.key} value={v.key}>{v.name} — {v.lang}</option>)}
              </select>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl bg-surface2 px-3 py-2.5 text-sm">
                {['Hinglish', 'English', 'Hindi', 'Marathi'].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <Button onClick={speak} disabled={!script.trim() || state === 'rendering'} className="w-full">
              {state === 'rendering' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {state === 'rendering' ? 'Rendering…' : 'Make them speak'}
            </Button>
            {msg && <p className={cn('text-xs mt-3', state === 'error' ? 'text-red-500' : 'text-ink-soft')}>{msg}</p>}
            {result && (
              <div className="mt-4">
                <video src={result} controls className="w-full rounded-xl bg-black" />
                <div className="mt-3"><ShareRow videoUrl={result} /></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
