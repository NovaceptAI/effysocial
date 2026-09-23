import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

// A small audio player that matches the app instead of the browser's default controls.
// `window` (a scene's length in seconds) draws the point where the scene ends, so a read
// that spills past its beat — which would talk over the next line — is visible, not just
// a number. Colours are passed in so it sits on the dark film room and the light app alike.
const DARK = { bg: '#1D2026', border: '#2A2E36', fill: '#FF6A5C', over: '#FFB020', text: '#EDEEF0', dim: '#9BA1AB' };

const clock = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

export default function AudioLine({ src, window: beat = 0, theme = DARK, label = 'line', autoPlay = false, style }) {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const [length, setLength] = useState(0);

  // A new file replaces whatever was playing, so the row never shows the previous read.
  useEffect(() => {
    setAt(0);
    setLength(0);
    setPlaying(false);
  }, [src]);

  const total = length || 0;
  const done = total ? Math.min(1, at / total) : 0;
  // Where the scene ends along the bar; only meaningful when the read runs past it.
  const beatAt = beat && total > beat ? beat / total : 0;

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  const seekTo = (clientX) => {
    const el = trackRef.current;
    const a = ref.current;
    if (!el || !a || !total) return;
    const box = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    a.currentTime = ratio * total;
    setAt(a.currentTime);
  };

  const nudge = (seconds) => {
    const a = ref.current;
    if (!a || !total) return;
    a.currentTime = Math.min(total, Math.max(0, a.currentTime + seconds));
    setAt(a.currentTime);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 999, padding: '5px 12px 5px 5px', ...style }}>
      <audio ref={ref} src={src} autoPlay={autoPlay} preload="metadata"
        onLoadedMetadata={(e) => setLength(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setAt(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setAt(0); }}
        style={{ display: 'none' }} />
      <button type="button" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`}
        style={{ width: 30, height: 30, borderRadius: '50%', border: 0, cursor: 'pointer', flexShrink: 0,
                 background: theme.fill, color: '#fff', display: 'grid', placeItems: 'center' }}>
        {playing ? <Pause size={14} fill="#fff" /> : <Play size={14} fill="#fff" style={{ marginLeft: 1 }} />}
      </button>
      <div ref={trackRef}
        role="slider" tabIndex={0}
        aria-label={`Seek ${label}`}
        aria-valuemin={0} aria-valuemax={Math.round(total)} aria-valuenow={Math.round(at)}
        aria-valuetext={`${clock(at)} of ${clock(total)}`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); seekTo(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons === 1) seekTo(e.clientX); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
        }}
        style={{ position: 'relative', flex: 1, minWidth: 60, height: 20, display: 'flex', alignItems: 'center', cursor: 'pointer', touchAction: 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 5, borderRadius: 999, background: theme.border }} />
        {/* The part of the read that spills past the scene. */}
        {beatAt > 0 && (
          <div style={{ position: 'absolute', left: `${beatAt * 100}%`, right: 0, height: 5, borderRadius: '0 999px 999px 0', background: theme.over, opacity: 0.35 }} />
        )}
        <div style={{ position: 'absolute', left: 0, width: `${done * 100}%`, height: 5, borderRadius: 999, background: theme.fill }} />
        {beatAt > 0 && (
          <div title={`The scene ends at ${beat}s`} style={{ position: 'absolute', left: `${beatAt * 100}%`, width: 2, height: 13, background: theme.over, borderRadius: 2 }} />
        )}
        <div style={{ position: 'absolute', left: `calc(${done * 100}% - 5px)`, width: 10, height: 10, borderRadius: '50%', background: theme.fill, boxShadow: '0 0 0 2px rgba(0,0,0,.35)' }} />
      </div>
      <span style={{ fontSize: 11.5, color: theme.dim, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {clock(at)} / {clock(total)}
      </span>
    </div>
  );
}
