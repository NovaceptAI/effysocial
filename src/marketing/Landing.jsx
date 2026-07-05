import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Wand2, CalendarCheck, Inbox, Target, GitBranch, BarChart3,
  Sparkles, ShieldCheck, Zap,
} from 'lucide-react';

const JOURNEY = ['Strategy', 'Content', 'Publishing', 'Engagement', 'Advertising', 'Leads', 'Revenue'];

const FEATURES = [
  { icon: Wand2, title: 'AI Studio', body: 'Generate brand-aware posts, carousels, reels and ads — scored on brand fit, hook and policy before you publish.' },
  { icon: CalendarCheck, title: 'Plan & Approve', body: 'A calendar, scheduling and client approvals in one clean review workflow your clients actually enjoy.' },
  { icon: Inbox, title: 'Unified Inbox', body: 'Every comment, DM, mention and review in a single queue, with AI-suggested replies in your brand voice.' },
  { icon: Target, title: 'Performance Ads', body: 'Build funnels, launch Meta & Google campaigns, and optimise relentlessly on CPL and ROAS.' },
  { icon: GitBranch, title: 'Convert & Follow-up', body: 'Landing pages, forms, a lead pipeline and WhatsApp follow-up — a genuinely closed loop.' },
  { icon: BarChart3, title: 'Analytics & Reports', body: 'Tie likes to leads to revenue. White-label client reports with AI-written summaries.' },
];

const CLIENTS = ['🦷 Dental', '🏦 Banking', '🐾 Pet care', '🏠 Real estate', '🍛 Restaurants', '✨ D2C brands'];

const PRINCIPLES = [
  { icon: Sparkles, title: 'AI that explains itself', body: 'Every recommendation shows what it detected, why it matters and the expected impact — never a black box.' },
  { icon: ShieldCheck, title: 'Humans control the spend', body: 'AI drafts, schedules and suggests. Anything that spends money or ships publicly waits for your approval.' },
  { icon: Zap, title: 'India-first, world-class', body: 'WhatsApp leads, click-to-call and local services — built for how business really happens here.' },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans overflow-x-hidden">
      <style>{`
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
        @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .rise { animation: rise .8s cubic-bezier(.2,.7,.2,1) both; }
        .rise-2 { animation-delay: .1s; } .rise-3 { animation-delay: .2s; } .rise-4 { animation-delay: .3s; }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>

      {/* Nav */}
      <header className="sticky top-0 z-30 bg-canvas/70 backdrop-blur-xl border-b border-hair">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-[10px] bg-aurora text-white shadow-[0_4px_14px_-2px_rgba(232,74,51,0.55)]">✦</span>
            <span className="font-display font-semibold text-[1.25rem] tracking-tight">EffySocial</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-ink-soft">
            <a href="#features" className="hover:text-ink transition-colors">Product</a>
            <a href="#journey" className="hover:text-ink transition-colors">How it works</a>
            <a href="#who" className="hover:text-ink transition-colors">Who it's for</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-bold text-ink hover:bg-surface2 transition">Log in</Link>
            <Link to="/login" className="px-4 py-2 rounded-[11px] text-sm font-bold bg-coral-btn text-white shadow-coral hover:shadow-coral-lg hover:brightness-105 transition-all">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero — dramatic warm-dark stage */}
      <section className="relative overflow-hidden bg-rail text-white">
        {/* atmospheric glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-20 w-[38rem] h-[38rem] rounded-full blur-3xl opacity-50"
               style={{ background: 'radial-gradient(circle, rgba(255,107,94,0.55), transparent 62%)' }} />
          <div className="absolute -top-24 right-0 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-40"
               style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.5), transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
               style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-28 text-center">
          <span className="rise inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white/90 bg-white/10 ring-1 ring-inset ring-white/15 px-3.5 py-1.5 rounded-full backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" /> AI Social Growth OS
          </span>
          <h1 className="rise rise-2 mt-6 font-display font-semibold tracking-tightest text-[2.7rem] sm:text-6xl md:text-[4.4rem] leading-[1.04] max-w-4xl mx-auto">
            From your first post to your
            <br className="hidden sm:block" /> next <span className="italic bg-gradient-to-r from-coral-light via-coral to-warning bg-clip-text text-transparent">paying customer.</span>
          </h1>
          <p className="rise rise-3 mt-6 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Plan, create, publish, advertise and convert — from one platform. AI does the heavy lifting across strategy, content, ads and follow-up, while you stay firmly in control.
          </p>
          <div className="rise rise-3 mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[13px] bg-white text-ink font-bold shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all">
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center px-7 py-3.5 rounded-[13px] border border-white/25 text-white font-bold hover:bg-white/10 transition-all backdrop-blur">
              Log in
            </Link>
          </div>
          <p className="rise rise-4 mt-4 text-xs text-white/45">No credit card · Free to start · Cancel anytime</p>

          {/* premium product preview */}
          <div className="rise rise-4 mt-16 max-w-4xl mx-auto rounded-[20px] ring-1 ring-white/12 bg-white/[0.03] p-2 backdrop-blur"
               style={{ boxShadow: '0 40px 90px -30px rgba(0,0,0,0.7)' }}>
            <div className="rounded-2xl border border-hair bg-surface overflow-hidden text-left text-ink">
              <div className="flex items-center gap-1.5 px-4 h-10 border-b border-hair bg-surface2">
                <span className="w-2.5 h-2.5 rounded-full bg-error/50" /><span className="w-2.5 h-2.5 rounded-full bg-warning/50" /><span className="w-2.5 h-2.5 rounded-full bg-success/50" />
                <span className="ml-3 text-xs text-ink-faint font-medium">app.effysocial.in</span>
              </div>
              <div className="grid grid-cols-[150px_1fr]">
                <div className="bg-rail p-3 space-y-1 hidden sm:block">
                  {['Overview', 'Campaigns', 'AI Studio', 'Calendar', 'Inbox', 'Pipeline', 'Analytics'].map((x, i) => (
                    <div key={x} className={`text-xs font-semibold px-2.5 py-2 rounded-lg ${i === 0 ? 'bg-coral-btn text-white' : 'text-rail-ink/65'}`}>{x}</div>
                  ))}
                </div>
                <div className="p-5 bg-canvas">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-lg font-semibold">Good morning, Priya ☀️</span>
                    <span className="text-[0.7rem] font-bold text-coral-ink bg-coral-tint ring-1 ring-inset ring-coral/20 px-2.5 py-1 rounded-full">Live</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[['Revenue', '₹4.2L', '↑ 18%'], ['Leads', '342', '↑ 12%'], ['ROAS', '4.2×', '↑ 0.4']].map(([l, v, d]) => (
                      <div key={l} className="bg-card-sheen border border-hair rounded-xl p-3 shadow-e1">
                        <div className="text-[0.6rem] text-ink-faint uppercase tracking-wide font-bold">{l}</div>
                        <div className="text-xl font-extrabold tracking-tightest tabular-nums mt-1">{v}</div>
                        <div className="text-[0.65rem] font-bold text-success mt-0.5">{d}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-end gap-1.5 h-24 rounded-xl bg-card-sheen border border-hair p-3 shadow-e1">
                    {[38, 52, 44, 66, 58, 80, 72, 94, 88].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-aurora" style={{ height: `${h}%`, opacity: 0.55 + i * 0.05 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* soft transition into cream */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-canvas" />
      </section>

      {/* Journey */}
      <section id="journey" className="scroll-mt-24 max-w-5xl mx-auto px-6 py-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-ink-faint mb-8">One connected journey — not disconnected tools</p>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
          {JOURNEY.map((s, i) => (
            <React.Fragment key={s}>
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-e1 ${i === JOURNEY.length - 1 ? 'bg-aurora text-white' : 'bg-card-sheen border border-hair text-ink'}`}>{s}</span>
              {i < JOURNEY.length - 1 && <ArrowRight className="w-4 h-4 text-coral/50" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-[2.4rem] font-semibold tracking-tightest leading-tight">Everything your growth needs</h2>
          <p className="mt-3 text-ink-soft leading-relaxed">From the first post to your next paying customer — with AI that explains itself and humans in control of spend.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="group bg-card-sheen border border-hair rounded-2xl shadow-e2 shadow-sheen p-6 hover:-translate-y-1 hover:shadow-e3 transition-all duration-300">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-coral-tint text-coral-ink ring-1 ring-inset ring-coral/15 mb-4 group-hover:scale-105 transition-transform">
                <f.icon className="w-5 h-5" strokeWidth={2} />
              </span>
              <h3 className="font-display text-lg font-semibold tracking-tight mb-1.5">{f.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principles band */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="text-center px-4">
              <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-aurora text-white shadow-coral mb-4"><p.icon className="w-5 h-5" /></span>
              <h3 className="font-display text-lg font-semibold tracking-tight mb-2">{p.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed max-w-xs mx-auto">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who */}
      <section id="who" className="scroll-mt-24 max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-[2rem] font-semibold tracking-tight mb-2">Built for agencies and businesses</h2>
        <p className="text-ink-soft mb-8 max-w-xl mx-auto leading-relaxed">Local services that live on leads — plus the agencies that grow them. India-first, globally competitive.</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {CLIENTS.map((c) => <span key={c} className="px-4 py-2 rounded-full bg-card-sheen border border-hair shadow-e1 text-sm font-semibold">{c}</span>)}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-[28px] bg-aurora text-white p-12 md:p-16 text-center shadow-e3">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
               style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          <div className="relative">
            <h2 className="font-display text-[2.2rem] md:text-[3rem] font-semibold tracking-tightest leading-[1.08] mb-4">Run your growth on autopilot — <span className="italic">with the wheel in your hands.</span></h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto leading-relaxed">Connect your channels, build your Brand Brain, and let EffySocial take you from strategy to revenue.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-[14px] bg-white text-ink font-extrabold shadow-[0_14px_36px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-hair">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-faint">
          <span className="flex items-center gap-2 font-display font-semibold text-ink text-base"><span className="grid place-items-center w-6 h-6 rounded-md bg-aurora text-white text-xs">✦</span> EffySocial</span>
          <span>Powered by EffyBiz · © 2026</span>
        </div>
      </footer>
    </div>
  );
}
