import React, { useState } from 'react';
import { Sparkles, Users, UserSquare, Package, Clapperboard, Mic, ArrowLeft, Lock, ShieldCheck, RotateCcw } from 'lucide-react';
import { useWorkspace } from '../app/context/WorkspaceContext';
import QuickCreate from './QuickCreate';
import CharactersStudio from '../app/components/CharactersStudio';
import DealerAvatarStudio from '../app/components/DealerAvatarStudio';
import ProductShotStudio from '../app/components/ProductShotStudio';
import Storyboard from '../app/components/Storyboard';
import LipSync from '../modules/lipsync/LipSync';
import { YT_STORY_FORMAT, EVENT_PIN } from './eventConfig';

const TILES = [
  { id: 'quick', label: 'Quick Create', blurb: 'A post + image in seconds', icon: Sparkles, from: '#FF7A45', to: '#E5484D', video: '/landing/studio.mp4' },
  { id: 'characters', label: 'EffyCharacters', blurb: 'A presenter says your script', icon: Users, from: '#8C7BFF', to: '#6144D6', video: '/landing/characters.mp4' },
  { id: 'avatar', label: 'Your Avatar', blurb: 'Put yourself in the ad', icon: UserSquare, from: '#22C3E6', to: '#1098AD', video: '/landing/hero.mp4' },
  { id: 'product', label: 'Product Shots', blurb: 'One photo → a beauty video', icon: Package, from: '#51CF66', to: '#2F9E44', video: '/landing/product.mp4' },
  { id: 'story', label: 'YouTube Story', blurb: 'A multi-scene story', icon: Clapperboard, from: '#FFC078', to: '#F08C00', video: '/landing/adfilm.mp4' },
  { id: 'lipsync', label: 'Lip Sync', blurb: 'Make any face talk', icon: Mic, from: '#FF9EC4', to: '#E64980', video: '/landing/films.mp4' },
];

function PinModal({ onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (pin === EVENT_PIN) onSuccess();
    else { setErr(true); setPin(''); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#15161a] p-6 text-white">
        <div className="flex items-center gap-2 mb-3 font-bold"><Lock className="w-4 h-4" /> Volunteer access</div>
        <input autoFocus value={pin} onChange={(e) => { setPin(e.target.value); setErr(false); }} type="password" inputMode="numeric"
          placeholder="Enter PIN" className="w-full rounded-xl bg-white/10 px-4 py-3 text-center text-lg tracking-widest outline-none" />
        {err && <p className="mt-2 text-sm text-red-400 text-center">Wrong PIN</p>}
        <button type="submit" className="mt-4 w-full rounded-xl px-4 py-3 font-bold text-white" style={{ background: 'linear-gradient(135deg,#FF6A5C,#E5484D)' }}>Unlock</button>
      </form>
    </div>
  );
}

function LipSyncFrame({ onBack }) {
  return (
    <div>
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-[#0b0c0e] text-white">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white bg-transparent"><ArrowLeft className="w-4 h-4" /> All tools</button>
        <span className="font-bold">Lip Sync</span>
      </div>
      <LipSync />
    </div>
  );
}

export default function EventKiosk() {
  const { workspace } = useWorkspace();
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState('guest');
  const [pinOpen, setPinOpen] = useState(false);
  const canPublish = mode === 'volunteer';
  const back = () => setActive(null);
  const pad = 'p-4 sm:p-6 max-w-[1200px] mx-auto';

  if (active) {
    return (
      <div className="app-root min-h-dvh bg-canvas text-ink">
        {active === 'quick' && <QuickCreate onBack={back} canPublish={canPublish} />}
        {active === 'characters' && <div className={pad}><CharactersStudio onBack={back} /></div>}
        {active === 'avatar' && <div className={pad}><DealerAvatarStudio onBack={back} /></div>}
        {active === 'product' && <div className={pad}><ProductShotStudio onBack={back} /></div>}
        {active === 'story' && <div className={pad}><Storyboard format={YT_STORY_FORMAT} onBack={back} initialBrief="" /></div>}
        {active === 'lipsync' && <LipSyncFrame onBack={back} />}
      </div>
    );
  }

  return (
    <div className="app-root min-h-dvh bg-canvas text-ink" style={{ background: 'radial-gradient(1200px 600px at 50% -10%, rgba(229,72,77,0.14), transparent), #0b0c0e' }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 sm:px-8 py-4">
        <img src="/brand/effysocial-mark-muted.png" alt="EffySocial" className="w-8 h-8 object-contain" />
        <span className="font-display text-lg font-semibold tracking-tight text-white">EffySocial Studio</span>
        {workspace && <span className="text-xs text-white/40 hidden sm:inline">· {workspace.name}</span>}
        <div className="flex-1" />
        {canPublish ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-bold text-green-300"><ShieldCheck className="w-3.5 h-3.5" /> Volunteer</span>
            <button onClick={() => setMode('guest')} className="text-xs font-bold text-white/50 hover:text-white bg-transparent">Exit</button>
          </>
        ) : (
          <button onClick={() => setPinOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white/80 hover:bg-white/20"><Lock className="w-3.5 h-3.5" /> Volunteer</button>
        )}
      </div>

      {/* Hero */}
      <div className="px-5 sm:px-8 pt-6 pb-4 text-center">
        <h1 className="font-display text-3xl sm:text-[2.6rem] font-semibold tracking-tight text-white">What do you want to make?</h1>
        <p className="mt-2 text-white/50">Tap a tool. Type one idea. Get something to share.</p>
      </div>

      {/* Tile wall — video-backed cards with a dark gradient so text always reads */}
      <div className="px-4 sm:px-8 pb-12 max-w-[1500px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {TILES.map((t) => {
          return (
            <button key={t.id} onClick={() => setActive(t.id)}
              className="group relative overflow-hidden rounded-3xl text-left flex flex-col justify-end min-h-[190px] sm:min-h-[240px] lg:min-h-[290px] transition-transform hover:-translate-y-1"
              style={{ background: '#141518', border: '1px solid #26282E' }}>
              <video className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.05]" autoPlay loop muted playsInline>
                <source src={t.video} type="video/mp4" />
              </video>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,12,14,0.10) 30%, rgba(11,12,14,0.72) 70%, rgba(11,12,14,0.96) 100%)' }} />
              <div className="relative p-7">
                <div className="font-display text-2xl sm:text-3xl font-semibold text-white drop-shadow">{t.label}</div>
                <div className="text-base sm:text-lg text-white/75 mt-1.5">{t.blurb}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer reset */}
      <div className="pt-6 pb-16 text-center">
        <button onClick={() => setActive(null)}
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-95"
          style={{ background: '#EDEEF0', color: '#15161a' }}>
          <RotateCcw className="w-4 h-4" /> Start over
        </button>
      </div>

      {pinOpen && <PinModal onClose={() => setPinOpen(false)} onSuccess={() => { setMode('volunteer'); setPinOpen(false); }} />}
    </div>
  );
}
