import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Play, Image as ImageIcon, Sparkles, Menu, X,
  Wand2, Clapperboard, Package, UserSquare, BarChart3,
  Megaphone, Globe, GitBranch, Repeat2, Inbox,
} from 'lucide-react';

/* EffySocial landing — dark, cinematic, media-driven (Runway-style). Each
   section is anchored by one hero visual. Media slots are placeholders now
   (labelled VIDEO/IMAGE) so real clips/stills drop in with a one-line swap. */

const INK = '#ECEDEF';
const MUTED = 'rgba(236,237,239,0.62)';
const FAINT = 'rgba(236,237,239,0.42)';
const BG = '#0B0C0E';
const CORAL = '#FF6A5C';

// AI Studio creatives row — one line of four outputs.
const STUDIO_TILES = [
  { label: 'EffyCharacters', video: '/landing/characters.mp4', poster: '/formats/ig_reel.jpg',
    desc: 'Lifelike lip-sync presenters that speak your script — in any language, in your own voice.' },
  { label: 'Every format', video: '/landing/studio.mp4', poster: '/formats/ig_post.jpg',
    desc: 'On-brand posts, carousels and reels for every channel — generated in seconds, scored before you post.' },
  { label: 'YouTube Story', video: '/landing/hero.mp4', poster: '/formats/yt_short.jpg',
    desc: 'Vertical stories and shorts, sized and styled to stop the scroll and earn the click.' },
];

// Performance Marketing — the supporting parts (Brand Brain is the hub, below).
const PM_PARTS = [
  { key: 'pm-strategy', title: 'Strategy → Campaigns', desc: 'AI marketing plans that turn straight into live, launch-ready campaigns.' },
  { key: 'pm-ads', title: 'Ads & Convert', desc: 'Meta & Google ads, landing pages, forms and a lead pipeline that closes.' },
  { key: 'pm-analytics', title: 'Analytics & Revenue', desc: 'Every like tied back to leads and revenue — white-label, AI-written.' },
];

const CLIENTS = ['🦷 Dental', '🏦 Banking', '🐾 Pet care', '🏠 Real estate', '🍛 Restaurants', '✨ D2C brands'];

// Reusable media placeholder — a dark, aspect-correct frame that names the
// intended asset. Swap `poster`→real still / wrap a <video> here to go live.
function MediaFrame({ kind = 'video', poster, video, label, portrait = false, className = '' }) {
  const Icon = kind === 'video' ? Play : ImageIcon;
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ aspectRatio: portrait ? '9 / 16' : '16 / 10', background: '#0D0E12', border: '1px solid #23262D', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.9)' }}>
      {video ? (
        <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline poster={poster}>
          <source src={video} type="video/mp4" />
        </video>
      ) : (
        <>
          {poster && <img src={poster} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.32 }} />}
          <div className="absolute inset-0" style={{ background: `radial-gradient(120% 110% at 50% 0%, rgba(255,106,92,0.12), transparent 58%)` }} />
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid place-items-center gap-3 px-6 text-center">
              <span className="grid place-items-center w-16 h-16 rounded-full backdrop-blur"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <Icon className="w-6 h-6" style={{ color: INK, marginLeft: kind === 'video' ? 3 : 0 }} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: FAINT }}>
                {kind} · {label}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnPrimary = { background: INK, color: '#0B0C0E' };
  const btnGhost = { border: '1px solid rgba(255,255,255,0.2)', color: INK };

  return (
    <div className="min-h-dvh font-sans overflow-x-hidden" style={{ background: BG, color: INK }}>
      <style>{`
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
        @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .rise { animation: rise .9s cubic-bezier(.2,.7,.2,1) both; }
        .rise-2 { animation-delay: .08s; } .rise-3 { animation-delay: .16s; } .rise-4 { animation-delay: .24s; }
        @keyframes bloom { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: .8; transform: scale(1.08); } }
        .bloom { animation: bloom 9s ease-in-out infinite; }
        .gshader { position: absolute; inset: -22%; filter: blur(36px);
          background:
            radial-gradient(38% 42% at 22% 30%, rgba(34,197,94,0.70), transparent 62%),
            radial-gradient(36% 40% at 80% 68%, rgba(16,185,129,0.58), transparent 62%),
            radial-gradient(46% 48% at 55% 100%, rgba(5,150,105,0.55), transparent 62%),
            radial-gradient(40% 40% at 100% 8%, rgba(132,204,22,0.38), transparent 60%),
            #05170d;
          animation: gflow 14s ease-in-out infinite alternate; }
        @keyframes gflow { 0% { transform: scale(1.05) translate(0,0); } 50% { transform: scale(1.28) translate(-5%,4%); } 100% { transform: scale(1.12) translate(4%,-3%); } }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'rgba(11,12,14,0.72)', borderBottom: '3px solid rgba(255,255,255,0.6)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/brand/effysocial-logo-trim.png" alt="EffySocial" className="w-auto" style={{ height: 30 }} />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: MUTED }}>
            <a href="#studio" className="hover:text-white transition-colors">Product</a>
            <a href="#who" className="hover:text-white transition-colors">Who it's for</a>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/10 transition" style={{ color: INK }}>Log in</Link>
            <Link to="/login" className="px-4 py-2 rounded-[11px] text-sm font-bold transition-all hover:-translate-y-0.5" style={btnPrimary}>Get started</Link>
            <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden grid place-items-center w-9 h-9 rounded-lg hover:bg-white/10 transition" style={{ color: INK }} aria-label="Menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="md:hidden px-6 py-3 flex flex-col gap-1 text-sm font-semibold" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: MUTED }}>
            <a href="#studio" onClick={() => setMenuOpen(false)} className="py-2 hover:text-white">Product</a>
            <a href="#who" onClick={() => setMenuOpen(false)} className="py-2 hover:text-white">Who it's for</a>
            <Link to="/pricing" onClick={() => setMenuOpen(false)} className="py-2" style={{ color: CORAL }}>Pricing</Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 hover:text-white">Log in</Link>
          </nav>
        )}
      </header>

      {/* ── 1. Hero — full-bleed background video ────────────────────────── */}
      <section className="relative overflow-hidden flex items-center" style={{ minHeight: '88vh' }}>
        {/* Background video (poster shows until landing/hero.mp4 is generated) */}
        <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline preload="auto"
          style={{ background: '#0B0C0E' }}>
          <source src="/landing/films.mp4" type="video/mp4" />
        </video>
        {/* Legibility + brand glow overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,12,14,0.55) 0%, rgba(11,12,14,0.30) 38%, rgba(11,12,14,0.94) 100%)' }} />
        <div className="pointer-events-none absolute inset-0">
          <div className="bloom absolute -top-40 -left-24 w-[42rem] h-[42rem] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, rgba(255,106,92,0.22), transparent 62%)` }} />
          <div className="bloom absolute -top-24 right-0 w-[38rem] h-[38rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.16), transparent 60%)', animationDelay: '2s' }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center w-full">
          <span className="rise inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] px-3.5 py-1.5 rounded-full backdrop-blur"
            style={{ color: INK, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <Sparkles className="w-3.5 h-3.5" /> The AI growth studio
          </span>
          <h1 className="rise rise-2 mt-6 font-display font-semibold tracking-tightest text-[2.8rem] sm:text-6xl md:text-[4.6rem] leading-[1.03] max-w-4xl mx-auto">
            Create. Publish. Grow.
            <br className="hidden sm:block" /> <span className="italic" style={{ color: CORAL }}>One studio.</span>
          </h1>
          <p className="rise rise-3 mt-6 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(236,237,239,0.78)' }}>
            The AI content and growth platform for Indian business — from a single post to a full ad film to real revenue, all in one place.
          </p>
          <div className="rise rise-3 mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[13px] font-bold transition-all hover:-translate-y-0.5" style={btnPrimary}>
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center px-7 py-3.5 rounded-[13px] font-bold transition-all hover:bg-white/10 backdrop-blur" style={btnGhost}>
              Log in
            </Link>
          </div>
          <p className="rise rise-4 mt-4 text-xs" style={{ color: FAINT }}>No credit card · Free to start · Cancel anytime</p>
        </div>
      </section>

      {/* ── Continuous white band: AI Studio → Ad Films → Product Shot ──── */}
      <div style={{ background: '#FFFFFF' }}>
      {/* ── 2. AI Studio — creatives in a row (light band) ──────────────── */}
      <section id="studio" style={{ color: '#15161A' }}>
        <div className="max-w-6xl mx-auto px-6 py-12 sm:py-14">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.16em]" style={{ color: '#E5484D' }}>
              <Wand2 className="w-4 h-4" /> AI Studio
            </span>
            <h2 className="mt-4 font-display text-[2rem] sm:text-[2.7rem] font-semibold tracking-tightest leading-[1.1]" style={{ color: '#15161A' }}>Every format, on brand, in seconds.</h2>
            <p className="mt-4 leading-relaxed" style={{ color: 'rgba(21,22,26,0.62)' }}>
              Product shots, presenters, posts and stories — generated in your brand voice, ready to publish.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto">
            {STUDIO_TILES.map((t) => (
              <div key={t.label} className="flex flex-col">
                <div className="relative overflow-hidden rounded-2xl"
                  style={{ aspectRatio: '4 / 5', background: '#0D0E12', border: '1px solid #ececec', boxShadow: '0 18px 44px -26px rgba(0,0,0,0.28)' }}>
                  <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline poster={t.poster}>
                    <source src={t.video} type="video/mp4" />
                  </video>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight" style={{ color: '#15161A' }}>{t.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed flex-1" style={{ color: 'rgba(21,22,26,0.6)' }}>{t.desc}</p>
                <Link to="/login" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold self-start hover:gap-2.5 transition-all" style={{ color: '#15161A' }}>
                  Try it <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-9">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold hover:gap-2.5 transition-all" style={{ color: '#15161A' }}>Explore AI Studio <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* ── 3. Ad Films — dedicated, bordered panel ─────────────────────── */}
      <section id="films" className="max-w-6xl mx-auto px-6 py-8 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl px-5 sm:px-8 py-8 sm:py-10" style={{ background: '#0E0F12', border: '1px solid #2A2E36' }}>
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.16em]" style={{ color: CORAL }}>
              <Clapperboard className="w-4 h-4" /> Ad Films
            </span>
            <h2 className="mt-4 font-display text-[2rem] sm:text-[2.7rem] font-semibold tracking-tightest leading-[1.1]">One brief becomes a finished ad film.</h2>
            <p className="mt-4 leading-relaxed" style={{ color: MUTED }}>
              A guided production room — AI script, seed-locked stills, Veo animation, voiceover and a beat-timed mix. One identity, holding steady as the world around it transforms.
            </p>
          </div>
          <MediaFrame kind="video" label="Ad Films demo" poster="/formats/yt_short.jpg" video="/landing/adfilm.mp4" className="max-w-2xl mx-auto" />
          <div className="text-center mt-6">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold hover:gap-2.5 transition-all" style={{ color: INK }}>Make a film <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* ── 4. Product Shot — green shader bg, white border ─────────────── */}
      <section id="product" className="max-w-6xl mx-auto px-6 py-8 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl" style={{ border: '2px solid #FFFFFF' }}>
          <div className="gshader" />
          <div className="relative grid items-center gap-10 lg:gap-14 lg:grid-cols-2 px-6 sm:px-12 py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[280px]">
              <MediaFrame kind="video" label="Product Shots demo" poster="/formats/ig_carousel.jpg" video="/landing/product.mp4" portrait />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.16em]" style={{ color: '#FFFFFF' }}>
                <Package className="w-4 h-4" /> Product Shots
              </span>
              <h2 className="mt-4 font-display text-[1.9rem] sm:text-[2.4rem] font-semibold tracking-tight leading-[1.1]" style={{ color: '#FFFFFF' }}>One photo becomes a cinematic product video.</h2>
              <p className="mt-4 text-base leading-relaxed max-w-lg" style={{ color: 'rgba(255,255,255,0.82)' }}>
                Upload a product shot; keep it perfectly faithful while AI builds the light, the scene and the motion around it. Add music, export any aspect.
              </p>
              <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold hover:gap-2.5 transition-all" style={{ color: '#FFFFFF' }}>Try it <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      </div>{/* end white band */}

      {/* ── 5. Performance Marketing — large, major parts ───────────────── */}
      <section id="pm" className="relative overflow-hidden py-20 sm:py-28" style={{ background: '#0E0F12' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(70% 55% at 50% 0%, rgba(255,106,92,0.07), transparent 60%)' }} />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.16em]" style={{ color: CORAL }}>
              <BarChart3 className="w-4 h-4" /> Performance Marketing
            </span>
            <h2 className="mt-4 font-display text-[2rem] sm:text-[2.8rem] font-semibold tracking-tightest leading-[1.1]">Turn content into customers.</h2>
            <p className="mt-4 leading-relaxed" style={{ color: MUTED }}>
              The full growth engine — campaigns, funnels, pipeline and analytics, all in one place, with humans in control of every rupee.
            </p>
          </div>
          {/* Brand Brain — the hub */}
          <div className="rounded-3xl overflow-hidden mb-5 grid lg:grid-cols-2 items-stretch" style={{ background: '#141619', border: '1px solid #23262D' }}>
            <div className="relative min-h-[240px]" style={{ background: '#0D0E12' }}>
              <img src="/landing/pm-brain.jpg" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: CORAL }}>The core</span>
              <h3 className="mt-3 font-display text-[1.7rem] sm:text-[2rem] font-semibold tracking-tight leading-[1.1]">Brand Brain</h3>
              <p className="mt-3 text-base leading-relaxed" style={{ color: MUTED }}>
                Your brand's intelligence — voice, facts, guardrails and assets. Every post, film and campaign is generated from it, so everything you ship sounds unmistakably like you.
              </p>
            </div>
          </div>
          {/* 3 supporting parts, image-led */}
          <div className="grid sm:grid-cols-3 gap-5">
            {PM_PARTS.map((part) => (
              <div key={part.key} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: '#141619', border: '1px solid #23262D' }}>
                <div className="relative" style={{ aspectRatio: '16 / 10', background: '#0D0E12' }}>
                  <img src={`/landing/${part.key}.jpg`} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="p-5 flex-1">
                  <h3 className="font-display text-lg font-semibold tracking-tight">{part.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: MUTED }}>{part.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Built for Indian SMBs ────────────────────────────────────── */}
      <section id="who" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(80% 60% at 50% 0%, rgba(255,106,92,0.08), transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="font-display text-[2rem] sm:text-[2.6rem] font-semibold tracking-tightest leading-tight">Made for the businesses that run on leads.</h2>
          <p className="mt-4 max-w-xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            Salons, clinics, dealers, restaurants and D2C brands — plus the agencies that grow them. India-first, globally competitive.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-2.5">
            {CLIENTS.map((c) => (
              <span key={c} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: '#141619', border: '1px solid #23262D', color: INK }}>{c}</span>
            ))}
          </div>
          <div className="mt-12">
            <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden" style={{ border: '1px solid #23262D', boxShadow: '0 30px 80px -40px rgba(0,0,0,0.9)' }}>
              <img src="/landing/who-smbs.jpg" alt="Happy Indian small-business owners" loading="lazy" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Closing CTA ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-[28px] px-8 py-16 md:py-20 text-center"
          style={{ background: 'linear-gradient(160deg, #16181D 0%, #121417 60%, #1a1315 100%)', border: '1px solid #24262C' }}>
          <div className="bloom pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full blur-3xl" style={{ background: `radial-gradient(circle, rgba(255,106,92,0.22), transparent 60%)` }} />
          <div className="relative">
            <h2 className="font-display text-[2.2rem] md:text-[3.1rem] font-semibold tracking-tightest leading-[1.08]">
              Start creating <span className="italic" style={{ color: CORAL }}>today.</span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto leading-relaxed" style={{ color: MUTED }}>
              Connect your channels, build your Brand Brain, and let EffySocial take you from idea to revenue.
            </p>
            <Link to="/login" className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-[14px] font-extrabold transition-all hover:-translate-y-0.5" style={btnPrimary}>
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-3 text-sm" style={{ color: FAINT }}>
          <img src="/brand/effysocial-logo-trim.png" alt="EffySocial" className="w-auto" style={{ height: 22 }} />
          <span>Powered by EffyBiz · © 2026</span>
        </div>
      </footer>
    </div>
  );
}
