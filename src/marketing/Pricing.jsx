import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, ArrowRight, Sparkles } from 'lucide-react';

const PLANS = [
  {
    id: 'creative', name: 'Creative', tagline: 'The creative studio, free — no card needed.',
    monthly: 0, yearly: 0, usdM: 0, usdY: 0,
    highlights: ['1 workspace (brand)', '1 team seat', '150 credits / mo',
      'AI Studio — posts, images & avatars', 'EffyCharacters & Product Shots', 'Ad Films production room',
      'No Performance Marketing'],
  },
  {
    id: 'growth', name: 'Growth', tagline: 'For solo businesses getting consistent.',
    monthly: 1999, yearly: 19990, usdM: 24, usdY: 240,
    highlights: ['Everything in Creative, plus:', 'Performance Marketing (core)', 'Calendar, scheduling & inbox',
      'Organic analytics', '2 team seats', '500 credits / mo'],
  },
  {
    id: 'pro', name: 'Pro', tagline: 'For growing businesses & freelancers.', popular: true,
    monthly: 4999, yearly: 49990, usdM: 59, usdY: 590,
    highlights: ['3 workspaces', '5 team seats', '1,500 credits / mo',
      'Everything in Growth, plus:', 'Ads dashboard (Meta + Google)', 'Landing pages, forms & lead pipeline',
      'Follow-up automation', 'Full analytics — leads, revenue, ROAS'],
  },
  {
    id: 'agency', name: 'Agency', tagline: 'For agencies & multi-brand teams.',
    monthly: 12999, yearly: 129990, usdM: 179, usdY: 1790,
    highlights: ['15 workspaces', '20 team seats', '6,000 credits / mo',
      'Everything in Pro, plus:', 'White-label reports + client portals', 'Agency overview & oversight',
      'API access + advanced roles', 'Priority support + onboarding'],
  },
];

const MATRIX = [
  ['Workspaces (brands)', '1', '1', '3', '15'],
  ['Team seats', '1', '2', '5', '20'],
  ['Credits / month', '150', '500', '1,500', '6,000'],
  ['AI Studio (posts, images, avatars)', true, true, true, true],
  ['EffyCharacters & Product Shots', true, true, true, true],
  ['Ad Films production room', true, true, true, true],
  ['Performance Marketing', false, true, true, true],
  ['Calendar, scheduling & inbox', false, true, true, true],
  ['Organic analytics', false, true, true, true],
  ['Ads dashboard (Meta + Google)', false, false, true, true],
  ['Landing pages, forms & pipeline', false, false, true, true],
  ['Follow-up automation', false, false, true, true],
  ['Full analytics (leads/revenue/ROAS)', false, false, true, true],
  ['White-label reports + portals', false, false, false, true],
  ['Agency overview & oversight', false, false, false, true],
  ['API access + advanced RBAC', false, false, false, true],
];

const FAQ = [
  ['Is Creative really free forever?', 'Yes — the full creative studio (AI Studio, Ad Films, Product Shots, EffyCharacters) at no cost, metered by a monthly credit allowance. No card required.'],
  ['What is a "credit"?', 'One unified currency for every AI action — an image, a Veo render, an ad-film scene, a product-shot clip. Each action costs a small, transparent number of credits.'],
  ['What if I run out of credits?', 'Nothing breaks — buy a top-up bundle, or upgrade a tier for a bigger monthly allowance.'],
  ['Which plans include Performance Marketing?', 'Growth, Pro and Agency. Creative is creative-tools-only — upgrade any time you\'re ready to publish, run ads or track leads.'],
  ['Can I bill in USD?', 'Yes. INR is our India-first price; USD pricing is shown for global teams.'],
  ['Can I change plans anytime?', 'Upgrade, downgrade or cancel whenever — changes prorate to your next cycle.'],
];

const inr = (n) => '₹' + n.toLocaleString('en-IN');

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-canvas/70 backdrop-blur-xl border-b border-hair">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/brand/effysocial-logo-trim.png" alt="EffySocial" className="w-auto" style={{ height: 26 }} />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-bold text-ink hover:bg-surface2 transition">Log in</Link>
            <Link to="/login" className="px-4 py-2 rounded-[11px] text-sm font-bold bg-coral-btn text-white shadow-coral hover:brightness-105 transition-all">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-coral-ink bg-coral-tint ring-1 ring-inset ring-coral/20 px-3.5 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> Simple, honest pricing
        </span>
        <h1 className="mt-5 font-display text-[2.6rem] md:text-6xl font-semibold tracking-tightest leading-[1.05]">
          One platform. <span className="italic bg-gradient-to-r from-coral-light via-coral to-warning bg-clip-text text-transparent">Every stage of growth.</span>
        </h1>
        <p className="mt-5 text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
          From your first post to your next paying customer — pick the plan that fits, upgrade as you grow.
        </p>

        {/* billing toggle */}
        <div className="mt-8 inline-flex items-center gap-3 bg-surface2 rounded-full p-1 border border-hair">
          <button onClick={() => setYearly(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${!yearly ? 'bg-surface shadow-e1 text-ink' : 'text-ink-faint'}`}>Monthly</button>
          <button onClick={() => setYearly(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition flex items-center gap-1.5 ${yearly ? 'bg-surface shadow-e1 text-ink' : 'text-ink-faint'}`}>
            Yearly <span className="text-[0.65rem] font-bold text-success bg-success-soft px-1.5 py-0.5 rounded-full">2 months free</span>
          </button>
        </div>
      </section>

      {/* plan cards */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {PLANS.map((p) => (
            <div key={p.id} className={`relative rounded-2xl p-6 flex flex-col ${p.popular
              ? 'bg-rail text-white shadow-e3 ring-1 ring-coral/40 lg:-mt-3 lg:mb-3'
              : 'bg-card-sheen border border-hair shadow-e2'}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold uppercase tracking-wide bg-aurora text-white px-3 py-1 rounded-full shadow-coral">Most popular</span>
              )}
              <h3 className={`font-display text-xl font-semibold tracking-tight ${p.popular ? 'text-white' : 'text-ink'}`}>{p.name}</h3>
              <p className={`text-sm mt-1 mb-4 ${p.popular ? 'text-white/70' : 'text-ink-soft'}`}>{p.tagline}</p>
              <div className="flex items-end gap-1.5">
                <span className={`text-[2.4rem] font-extrabold tracking-tightest tabular-nums leading-none ${p.popular ? 'text-white' : 'text-ink'}`}>
                  {p.monthly === 0 ? 'Free' : inr(yearly ? Math.round(p.yearly / 12) : p.monthly)}
                </span>
                {p.monthly > 0 && <span className={`text-sm mb-1 ${p.popular ? 'text-white/60' : 'text-ink-faint'}`}>/mo</span>}
              </div>
              <p className={`text-xs mt-1 ${p.popular ? 'text-white/55' : 'text-ink-faint'}`}>
                {p.monthly === 0 ? 'No credit card required' : `${yearly ? `${inr(p.yearly)}/yr · ` : ''}$${yearly ? p.usdY + '/yr' : p.usdM + '/mo'} · ex-GST`}
              </p>
              <Link to="/login"
                className={`mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[12px] font-bold transition-all ${p.popular
                  ? 'bg-white text-ink hover:-translate-y-0.5'
                  : 'bg-coral-btn text-white shadow-coral hover:shadow-coral-lg hover:brightness-105'}`}>
                {p.monthly === 0 ? 'Start for free' : 'Start free trial'} <ArrowRight className="w-4 h-4" />
              </Link>
              <ul className="mt-6 space-y-2.5">
                {p.highlights.map((h) => (
                  <li key={h} className={`flex items-start gap-2.5 text-sm ${h.endsWith('plus:') ? 'font-bold pt-1' : ''}`}>
                    {!h.endsWith('plus:') && <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.popular ? 'text-coral-light' : 'text-coral-ink'}`} />}
                    <span className={p.popular ? 'text-white/90' : 'text-ink-soft'}>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-ink-faint mt-6">Metered by credits, not a wall of per-feature caps · cancel anytime.</p>
      </section>

      {/* comparison */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-display text-[2rem] font-semibold tracking-tight text-center mb-8">Compare every feature</h2>
        <div className="overflow-x-auto rounded-2xl border border-hair bg-card-sheen shadow-e1">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-hair">
                <th className="text-left font-semibold text-ink-faint px-4 py-3">Feature</th>
                {['Creative', 'Growth', 'Pro', 'Agency'].map((n) => <th key={n} className="px-4 py-3 font-display font-semibold text-ink text-center">{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row) => (
                <tr key={row[0]} className="border-b border-hair/60 last:border-0">
                  <td className="px-4 py-2.5 text-ink-soft">{row[0]}</td>
                  {row.slice(1).map((cell, i) => (
                    <td key={i} className="px-4 py-2.5 text-center">
                      {cell === true ? <Check className="w-4 h-4 text-success mx-auto" />
                        : cell === false ? <Minus className="w-4 h-4 text-ink-faint/50 mx-auto" />
                        : <span className="font-semibold text-ink tabular-nums">{cell}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-sm text-ink-soft mt-5">
          Need lip-sync video, AI voice or dubbing? Available as transparent, pay-per-use add-ons on any plan.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="font-display text-[2rem] font-semibold tracking-tight text-center mb-8">Questions, answered</h2>
        <div className="space-y-3">
          {FAQ.map(([q, a]) => (
            <div key={q} className="bg-card-sheen border border-hair rounded-xl shadow-e1 p-5">
              <h3 className="font-bold text-ink mb-1.5">{q}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-[28px] bg-aurora text-white p-12 md:p-14 text-center shadow-e3">
          <h2 className="font-display text-[2rem] md:text-[2.6rem] font-semibold tracking-tightest leading-[1.1] mb-4">Start free. Grow when you're ready.</h2>
          <p className="text-white/85 mb-8 max-w-xl mx-auto">No credit card to start — connect your channels and see EffySocial run your growth.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-[14px] bg-white text-ink font-extrabold shadow-[0_14px_36px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-hair">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-faint">
          <Link to="/" className="flex items-center"><img src="/brand/effysocial-logo-trim.png" alt="EffySocial" className="w-auto" style={{ height: 20 }} /></Link>
          <span>Powered by EffyBiz · © 2026</span>
        </div>
      </footer>
    </div>
  );
}
