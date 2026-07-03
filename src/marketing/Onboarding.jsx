import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, FileText, Target, Plug, Brain, UserPlus, Sparkles,
  Check, ArrowRight, ArrowLeft, Globe, Upload, Plus, Loader2,
} from 'lucide-react';
import { cn } from '../lib/cn';

const STEPS = [
  { id: 'type', label: 'Organisation', icon: Building2 },
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'connect', label: 'Connect', icon: Plug },
  { id: 'brand', label: 'Brand Brain', icon: Brain },
  { id: 'invite', label: 'Invite', icon: UserPlus },
  { id: 'plan', label: 'First plan', icon: Sparkles },
];

const ORG_TYPES = [
  { id: 'business', label: 'Business', desc: 'I market my own brand.' },
  { id: 'agency', label: 'Marketing agency', desc: 'I manage many clients.' },
  { id: 'freelancer', label: 'Freelancer / consultant', desc: 'I run social for a few clients.' },
];
const GOALS = ['Increase awareness', 'Grow engagement', 'Generate leads', 'WhatsApp conversations', 'Get phone calls', 'Book appointments', 'Ecommerce sales', 'Customer care'];
const CHANNELS = ['Facebook', 'Instagram', 'LinkedIn', 'X', 'YouTube', 'Google Business', 'Meta Ads', 'Google Ads', 'Google Analytics 4', 'WhatsApp'];

function Field({ label, children }) {
  return <label className="block"><span className="block text-sm font-semibold text-ink-soft mb-1.5">{label}</span>{children}</label>;
}
const input = 'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orgType, setOrgType] = useState('agency');
  const [goals, setGoals] = useState(['Generate leads', 'WhatsApp conversations']);
  const [connected, setConnected] = useState({ Instagram: true, Facebook: true });
  const [invites, setInvites] = useState(['']);
  const [planning, setPlanning] = useState(false);
  const [planned, setPlanned] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const toggleGoal = (g) => setGoals((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));
  const cur = STEPS[step].id;

  const runPlan = () => {
    setPlanning(true);
    setTimeout(() => { setPlanning(false); setPlanned(true); }, 1400);
  };

  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans grid lg:grid-cols-[280px_1fr]">
      {/* progress rail */}
      <aside className="hidden lg:flex flex-col bg-rail text-white p-7">
        <div className="flex items-center gap-2.5 font-extrabold text-lg mb-10">
          <span className="grid place-items-center w-8 h-8 rounded-[9px] bg-coral text-white">✦</span> EffySocial
        </div>
        <ul className="space-y-1 flex-1">
          {STEPS.map((s, i) => (
            <li key={s.id} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg', i === step ? 'bg-rail-soft' : '')}>
              <span className={cn('grid place-items-center w-7 h-7 rounded-full text-xs font-bold',
                i < step ? 'bg-success text-white' : i === step ? 'bg-coral text-white' : 'bg-rail-line text-rail-muted')}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <span className={cn('text-sm font-semibold', i === step ? 'text-white' : 'text-rail-muted')}>{s.label}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/40">Step {step + 1} of {STEPS.length}</p>
      </aside>

      {/* content */}
      <main className="flex flex-col">
        <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
          {cur === 'type' && (
            <Step title="Welcome! What best describes you?" sub="We'll tailor EffySocial to how you work.">
              <div className="space-y-3">
                {ORG_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setOrgType(t.id)}
                    className={cn('w-full text-left p-4 rounded-xl border-2 transition', orgType === t.id ? 'border-coral bg-coral-soft/40' : 'border-line hover:border-coral/50')}>
                    <div className="flex items-center justify-between"><span className="font-bold text-ink">{t.label}</span>{orgType === t.id && <Check className="w-5 h-5 text-coral" />}</div>
                    <p className="text-sm text-ink-soft mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </Step>
          )}

          {cur === 'details' && (
            <Step title="Tell us about your business" sub="This personalises your workspace and reports.">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name"><input className={input} placeholder="EffyBiz Digital" /></Field>
                <Field label="Website"><input className={input} placeholder="https://…" /></Field>
                <Field label="Industry"><select className={input}><option>Dental clinic</option><option>Cooperative bank</option><option>Real estate</option><option>Restaurant</option><option>D2C ecommerce</option><option>Other</option></select></Field>
                <Field label="Primary location"><input className={input} placeholder="Pune, India" /></Field>
                <Field label="Time zone"><select className={input}><option>Asia/Kolkata (IST)</option><option>Asia/Dubai</option><option>UTC</option></select></Field>
                <Field label="Currency"><select className={input}><option>INR (₹)</option><option>USD ($)</option><option>AED</option></select></Field>
                <Field label="Team size"><select className={input}><option>1–5</option><option>6–20</option><option>21–50</option><option>50+</option></select></Field>
              </div>
            </Step>
          )}

          {cur === 'goals' && (
            <Step title="What do you want to achieve?" sub="Pick all that apply — we'll weight your strategy accordingly.">
              <div className="flex flex-wrap gap-2.5">
                {GOALS.map((g) => (
                  <button key={g} onClick={() => toggleGoal(g)}
                    className={cn('px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition', goals.includes(g) ? 'border-coral bg-coral text-white' : 'border-line text-ink-soft hover:border-coral/50')}>
                    {g}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {cur === 'connect' && (
            <Step title="Connect your accounts" sub="Connect now or skip — you can add more later.">
              <div className="grid sm:grid-cols-2 gap-3">
                {CHANNELS.map((c) => {
                  const on = connected[c];
                  return (
                    <div key={c} className="flex items-center justify-between p-3 rounded-xl border border-line">
                      <span className="font-semibold text-sm">{c}</span>
                      <button onClick={() => setConnected((p) => ({ ...p, [c]: !p[c] }))}
                        className={cn('text-xs font-bold px-3 py-1.5 rounded-lg', on ? 'bg-success-soft text-success' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                        {on ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Connected</span> : 'Connect'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Step>
          )}

          {cur === 'brand' && (
            <Step title="Build your Brand Brain" sub="Give the AI context so every output sounds like you.">
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-line hover:border-coral transition text-left">
                  <span className="grid place-items-center w-10 h-10 rounded-lg bg-coral-soft text-coral-ink"><Globe className="w-5 h-5" /></span>
                  <span><span className="block font-bold text-ink">Import from website</span><span className="text-sm text-ink-soft">We'll extract tone, products and FAQs.</span></span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-line hover:border-coral transition text-left">
                  <span className="grid place-items-center w-10 h-10 rounded-lg bg-coral-soft text-coral-ink"><Upload className="w-5 h-5" /></span>
                  <span><span className="block font-bold text-ink">Upload brochure / guidelines</span><span className="text-sm text-ink-soft">PDF, deck or catalogue.</span></span>
                </button>
                <p className="text-sm text-ink-faint text-center pt-2">You can refine everything later in Brand Brain.</p>
              </div>
            </Step>
          )}

          {cur === 'invite' && (
            <Step title="Invite your team or client" sub="Add people now or do it later.">
              <div className="space-y-2.5">
                {invites.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <input className={input} placeholder="name@company.com" value={v}
                      onChange={(e) => setInvites((p) => p.map((x, j) => (j === i ? e.target.value : x)))} />
                    <select className="rounded-lg border border-line bg-surface px-3 text-sm"><option>Account manager</option><option>Copywriter</option><option>Client approver</option><option>View-only</option></select>
                  </div>
                ))}
                <button onClick={() => setInvites((p) => [...p, ''])} className="flex items-center gap-1.5 text-sm font-bold text-coral-ink"><Plus className="w-4 h-4" /> Add another</button>
              </div>
            </Step>
          )}

          {cur === 'plan' && (
            <Step title="Generate your first marketing plan" sub="EffySocial will draft a month of strategy from everything above.">
              {!planned ? (
                <div className="text-center py-8">
                  <button onClick={runPlan} disabled={planning}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-coral text-white font-bold shadow-[0_10px_26px_rgba(232,74,51,0.3)] disabled:opacity-70">
                    {planning ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your plan…</> : <><Sparkles className="w-4 h-4" /> Generate first plan</>}
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-line bg-surface">
                  <div className="flex items-center gap-2 mb-3 text-success font-bold"><Check className="w-5 h-5" /> Your plan is ready</div>
                  <ul className="space-y-2 text-sm text-ink-soft">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Content pillars set (Educational 30% · Product 25% · Proof 20% · Engagement 15% · Promo 10%)</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> 12 post ideas + a posting cadence drafted</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> Lead-gen funnel + WhatsApp follow-up recommended</li>
                  </ul>
                </div>
              )}
            </Step>
          )}
        </div>

        {/* footer nav */}
        <div className="border-t border-line bg-canvas/80 backdrop-blur sticky bottom-0">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={back} disabled={step === 0} className="flex items-center gap-1.5 text-sm font-bold text-ink-soft disabled:opacity-40 hover:text-ink">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {cur !== 'plan' ? (
              <button onClick={next} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-coral text-white font-bold shadow-[0_8px_20px_rgba(232,74,51,0.24)] hover:-translate-y-0.5 transition">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => navigate('/app')} disabled={!planned}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-coral text-white font-bold shadow-[0_8px_20px_rgba(232,74,51,0.24)] disabled:opacity-50 hover:-translate-y-0.5 transition">
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Step({ title, sub, children }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-ink-soft mt-1 mb-7">{sub}</p>
      {children}
    </div>
  );
}
