import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Wand2, CalendarCheck, Inbox, Target, GitBranch, BarChart3, Check,
} from 'lucide-react';
import FluidBackground from '../components/FluidBackground';

const JOURNEY = ['Strategy', 'Content', 'Publishing', 'Engagement', 'Advertising', 'Leads', 'Revenue'];

const FEATURES = [
  { icon: Wand2, title: 'AI Studio', body: 'Generate brand-aware posts, carousels, reels and ads — scored and preview-ready.' },
  { icon: CalendarCheck, title: 'Plan & Approve', body: 'Calendar, scheduling and client approvals with a clean review workflow.' },
  { icon: Inbox, title: 'Unified Inbox', body: 'Every comment, DM, mention and review in one queue with AI-suggested replies.' },
  { icon: Target, title: 'Performance Ads', body: 'Build funnels, launch Meta & Google campaigns, and optimise on CPL and ROAS.' },
  { icon: GitBranch, title: 'Convert & Follow-up', body: 'Landing pages, forms, lead pipeline and WhatsApp follow-up — closed-loop.' },
  { icon: BarChart3, title: 'Analytics & Reports', body: 'Tie likes to leads to revenue. White-label client reports with AI summaries.' },
];

const CLIENTS = ['🦷 Dental', '🏦 Banking', '🐾 Pet care', '🏠 Real estate', '🍛 Restaurants', '✨ D2C brands'];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-[9px] bg-coral text-white shadow-[0_6px_16px_rgba(232,74,51,0.4)]">✦</span>
            <span className="font-extrabold text-lg tracking-tight">EffySocial</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-ink-soft">
            <a href="#features" className="hover:text-ink">Product</a>
            <a href="#journey" className="hover:text-ink">How it works</a>
            <a href="#who" className="hover:text-ink">Who it's for</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-bold text-ink hover:bg-surface2 transition">Log in</Link>
            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-bold bg-coral text-white shadow-[0_8px_20px_rgba(232,74,51,0.24)] hover:-translate-y-0.5 transition">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <FluidBackground className="absolute inset-0 w-full h-full opacity-70 [mask-image:linear-gradient(180deg,#000_30%,transparent_95%)]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral-ink bg-coral-soft px-3 py-1.5 rounded-full">✦ AI Social Growth OS</span>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-4xl mx-auto">
            Plan, create, publish, advertise and <span className="bg-aurora bg-clip-text text-transparent">convert</span> — from one platform.
          </h1>
          <p className="mt-5 text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
            EffySocial takes your business from strategy and content to ads, leads, follow-up and revenue — with AI doing the heavy lifting and you staying in control.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-coral text-white font-bold shadow-[0_10px_26px_rgba(232,74,51,0.3)] hover:-translate-y-0.5 transition">
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center px-6 py-3.5 rounded-xl border border-line bg-surface font-bold hover:border-coral transition">Log in</Link>
          </div>

          {/* mock app preview */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-line bg-surface shadow-e3 overflow-hidden text-left">
            <div className="flex items-center gap-1.5 px-4 h-9 border-b border-line bg-surface2">
              <span className="w-2.5 h-2.5 rounded-full bg-error/60" /><span className="w-2.5 h-2.5 rounded-full bg-warning/60" /><span className="w-2.5 h-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-ink-faint">app.effysocial.in</span>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <div className="bg-rail p-3 space-y-1.5 hidden sm:block">
                {['Home', 'Campaigns', 'AI Studio', 'Calendar', 'Inbox', 'Analytics'].map((x, i) => (
                  <div key={x} className={`text-xs font-semibold px-2.5 py-1.5 rounded-md ${i === 0 ? 'bg-coral text-white' : 'text-rail-ink/70'}`}>{x}</div>
                ))}
              </div>
              <div className="p-4 bg-canvas">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[['Revenue', '₹4.2L'], ['Leads', '342'], ['ROAS', '4.2×']].map(([l, v]) => (
                    <div key={l} className="bg-surface border border-line rounded-lg p-2.5"><div className="text-[0.6rem] text-ink-faint uppercase">{l}</div><div className="text-base font-extrabold">{v}</div></div>
                  ))}
                </div>
                <div className="h-24 rounded-lg bg-aurora opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="max-w-5xl mx-auto px-6 py-14">
        <p className="text-center text-sm font-bold uppercase tracking-wider text-ink-faint mb-5">One connected journey — not disconnected tools</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {JOURNEY.map((s, i) => (
            <React.Fragment key={s}>
              <span className="px-3.5 py-2 rounded-full bg-surface border border-line text-sm font-bold">{s}</span>
              {i < JOURNEY.length - 1 && <ArrowRight className="w-4 h-4 text-ink-faint" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-3">Everything your social growth needs</h2>
        <p className="text-center text-ink-soft mb-10 max-w-2xl mx-auto">From the first post to your next paying customer — with AI that explains itself and humans in control of spend.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-surface border border-line rounded-2xl shadow-e1 p-6 hover:-translate-y-1 hover:border-coral hover:shadow-e2 transition">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-coral-soft text-coral-ink mb-4"><f.icon className="w-5 h-5" /></span>
              <h3 className="font-bold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who */}
      <section id="who" className="max-w-5xl mx-auto px-6 py-14 text-center">
        <h2 className="text-2xl font-extrabold mb-2">Built for agencies and businesses</h2>
        <p className="text-ink-soft mb-6">India-first workflows — WhatsApp leads, click-to-call, local services — globally competitive.</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {CLIENTS.map((c) => <span key={c} className="px-4 py-2 rounded-full bg-surface border border-line text-sm font-semibold">{c}</span>)}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-aurora text-white p-10 md:p-14 text-center shadow-e3">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">From your first post to your next paying customer.</h2>
          <p className="opacity-90 mb-7 max-w-xl mx-auto">Start free. Connect your channels, build your Brand Brain, and let EffySocial run your growth.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-coral-ink font-extrabold hover:-translate-y-0.5 transition">
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-faint">
          <span className="flex items-center gap-2 font-bold text-ink"><span className="grid place-items-center w-6 h-6 rounded-md bg-coral text-white text-xs">✦</span> EffySocial</span>
          <span>Powered by EffyBiz · © 2026</span>
        </div>
      </footer>
    </div>
  );
}
