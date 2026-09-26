import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2, FileText, Target, Plug, Brain, Sparkles, Compass, Rocket,
  Check, ArrowRight, ArrowLeft, Loader2, Wand2, Clapperboard, AlertTriangle,
} from 'lucide-react';
import { useAppAuth } from '../app/context/AppAuth';
import { WORKSPACE_ADMIN_ROLES } from '../app/context/WorkspaceContext';
import { effyApi } from '../app/api/effyApi';
import BrandSources from '../app/components/BrandSources';
import PlanView from '../app/components/PlanView';
import { cn } from '../lib/cn';
import { INDUSTRY_GROUPS, INDUSTRIES } from './industries';

// Onboarding (G20). Answers are saved on the organisation as you go, so a reload
// resumes at the same step. What you want from EffySocial decides the route:
// creation only skips goals, connections and the plan.
const STEP_META = {
  type: { label: 'Organisation', icon: Building2 },
  details: { label: 'Details', icon: FileText },
  offer: { label: 'What you need', icon: Compass },
  goals: { label: 'Goals', icon: Target },
  connect: { label: 'Connect', icon: Plug },
  brand: { label: 'Brand Brain', icon: Brain },
  plan: { label: 'First plan', icon: Sparkles },
  start: { label: 'Start creating', icon: Rocket },
};

export function stepsFor(offer) {
  if (offer === 'creation') return ['type', 'details', 'offer', 'brand', 'start'];
  return ['type', 'details', 'offer', 'goals', 'connect', 'brand', 'plan'];
}

const ORG_TYPES = [
  // The three profiles (engine profiles.py). Each says what the profile does.
  { id: 'business', label: 'Business', desc: 'We market our own company or shop.' },
  { id: 'personal_brand', label: 'Personal Brand', desc: 'I market myself — my expertise, practice or profile.' },
  { id: 'agency', label: 'Agency & Creators', desc: 'I create and run marketing for other brands.' },
];
const OFFERS = [
  { id: 'creation', label: 'Create content', desc: 'Posts, images, Product Shots and ad films in AI Studio and Ad Films.' },
  { id: 'marketing', label: 'Market and grow', desc: 'Campaigns, leads, ads and analytics.' },
  { id: 'both', label: 'Both', desc: 'Create the content, then run the marketing around it.' },
];
const TZ_LABELS = { 'Asia/Kolkata': 'Asia/Kolkata (IST)', 'Asia/Dubai': 'Asia/Dubai', 'Asia/Singapore': 'Asia/Singapore', 'Europe/London': 'Europe/London', 'America/New_York': 'America/New_York', UTC: 'UTC' };
const CURRENCY_LABELS = { INR: 'INR (₹)', USD: 'USD ($)', AED: 'AED', SGD: 'SGD', GBP: 'GBP (£)', EUR: 'EUR (€)' };
const OTHER = '__other';
const CONNECT_RESULT = {
  denied: 'was cancelled on its sign-in screen',
  invalid_state: 'took too long — try again',
  exchange_failed: 'didn’t confirm the connection — try again',
};
const DEFAULT_DETAILS = { name: '', website: '', industry: '', location: '', timezone: 'Asia/Kolkata', currency: 'INR', teamSize: '1-5' };

const input = 'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none';

function Field({ label, hint, className, children }) {
  return (
    <div className={className}>
      <label className="block"><span className="block text-sm font-semibold text-ink-soft mb-1.5">{label}</span>{children}</label>
      {hint && <p className="text-xs text-ink-faint mt-1.5">{hint}</p>}
    </div>
  );
}

function Choice({ selected, onClick, label, desc }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onClick}
      className={cn('w-full text-left p-4 rounded-xl border-2 transition', selected ? 'border-coral bg-coral-soft/40' : 'border-line hover:border-coral/50')}>
      <div className="flex items-center justify-between"><span className="font-bold text-ink">{label}</span>{selected && <Check className="w-5 h-5 text-coral" />}</div>
      <p className="text-sm text-ink-soft mt-0.5">{desc}</p>
    </button>
  );
}

function ConnectStep({ workspace }) {
  const [params] = useSearchParams();
  const [items, setItems] = useState(null);
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    effyApi.listIntegrations(workspace.id).then(setItems).catch((e) => setError(e.message));
  }, [workspace.id]);

  const returned = params.get('connected');
  const label = (provider) => items?.find((i) => i.provider === provider)?.label || provider;

  const connect = async (provider) => {
    setBusy(provider); setError('');
    try {
      const r = await effyApi.connectIntegration(provider, workspace.id, 'onboarding');
      if (r.state === 'redirect' && r.redirect) { window.location.assign(r.redirect); return; }
      setNotes((n) => ({
        ...n,
        [provider]: r.state === 'pending_credentials'
          ? 'Not available yet — EffySocial still has to set this connection up. Skip it for now.'
          : (r.message || 'This connection isn’t ready yet.'),
      }));
    } catch (e) {
      setError(e.message);
    }
    setBusy('');
  };

  return (
    <Step title="Connect your accounts" sub="Connect what you use now, or skip — you can connect more from Integrations later.">
      {returned && items && (
        <p role="status" className={cn('mb-4 text-sm rounded-lg px-3.5 py-2.5', params.get('status') === 'success' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning')}>
          {params.get('status') === 'success' ? `${label(returned)} connected.` : `${label(returned)} ${CONNECT_RESULT[params.get('status')] || 'didn’t connect — try again'}.`}
        </p>
      )}
      {error && <p role="alert" className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</p>}
      {!items ? (
        <p className="text-sm text-ink-soft flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Checking your connections…</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3" aria-label="Channels">
          {items.map((it) => (
            <li key={it.provider} className="p-3 rounded-xl border border-line">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block font-semibold text-sm">{it.label}</span>
                  <span className="block text-xs text-ink-faint">{it.state === 'connected' ? (it.account || 'Connected') : it.category}</span>
                </span>
                {it.state === 'connected' ? (
                  <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-success-soft text-success"><Check className="w-3.5 h-3.5" /> Connected</span>
                ) : (
                  <button type="button" onClick={() => connect(it.provider)} disabled={!!busy} aria-label={`Connect ${it.label}`}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface2 text-ink-soft hover:text-ink disabled:opacity-50">
                    {busy === it.provider ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : it.state === 'expired' ? 'Reconnect' : 'Connect'}
                  </button>
                )}
              </div>
              {notes[it.provider] && <p className="mt-2 text-xs text-warning flex gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> {notes[it.provider]}</p>}
            </li>
          ))}
        </ul>
      )}
    </Step>
  );
}

function BrandStep({ workspace, website }) {
  const [sources, setSources] = useState(null);
  const load = useCallback(() => {
    effyApi.getBrand(workspace.id).then((b) => setSources(b.sources?.data || [])).catch(() => setSources([]));
  }, [workspace.id]);
  useEffect(load, [load]);
  return (
    <Step title="Build your Brand Brain" sub="Give the AI your brand's own words so everything it writes sounds like you.">
      <div role="note" aria-label="Why a brief helps" className="mb-4 flex gap-3 rounded-xl border border-coral/30 bg-coral-tint px-4 py-3">
        <FileText className="w-5 h-5 text-coral-ink shrink-0 mt-0.5" />
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">A brief goes a long way.</span> Your first plan is only as specific as what we know about you.
          Upload a brochure, pitch deck or company profile, or write a few lines about what you sell, who buys it and what makes you different.
          {website ? ' We’ll also read your website.' : ''}
        </p>
      </div>
      {sources ? <BrandSources workspaceId={workspace.id} sources={sources} onChanged={load} defaultLink={website} briefOpen /> : <p className="text-sm text-ink-soft">Loading…</p>}
      <p className="text-sm text-ink-faint text-center pt-3">You can fill in tone, products and more later in Brand Brain.</p>
    </Step>
  );
}

function PlanStep({ workspace, plan, onPlan }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generate = async () => {
    setBusy(true); setError('');
    try { onPlan(await effyApi.createMarketingPlan(workspace.id, 'onboarding')); } catch (e) { setError(e.message); }
    setBusy(false);
  };
  return (
    <Step title="Generate your first marketing plan" sub="EffySocial drafts a month of strategy from your answers and your Brand Brain.">
      {error && <p role="alert" className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</p>}
      {!plan ? (
        <div className="text-center py-8">
          <p className="text-sm text-ink-soft max-w-md mx-auto mb-5">
            We use your answers, your website and anything you added in Brand Brain. No brief or document yet?
            Go back a step and add one — the plan will be far more specific.
          </p>
          <button type="button" onClick={generate} disabled={busy}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-coral text-white font-bold shadow-[0_10px_26px_rgba(232,74,51,0.3)] disabled:opacity-70">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing your plan…</> : <><Sparkles className="w-4 h-4" /> Generate first plan</>}
          </button>
          {busy && <p className="text-xs text-ink-faint mt-3">This usually takes under a minute.</p>}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-success font-bold"><Check className="w-5 h-5" /> Your plan is ready</span>
            <button type="button" onClick={generate} disabled={busy} className="text-xs font-bold text-coral-ink disabled:opacity-50">
              {busy ? 'Writing…' : 'Write it again'}
            </button>
          </div>
          {plan.inputs?.websiteNote && (
            <p role="status" className="mb-3 text-sm rounded-lg bg-warning-soft text-warning px-3.5 py-2.5">
              We couldn’t use your website for this plan: {plan.inputs.websiteNote}
            </p>
          )}
          <PlanView plan={plan} />
        </div>
      )}
    </Step>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { bootstrap, refresh } = useAppAuth();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [orgType, setOrgType] = useState('business');
  const [details, setDetails] = useState(DEFAULT_DETAILS);
  const [otherIndustry, setOtherIndustry] = useState(false);
  const [offer, setOffer] = useState('');
  const [goals, setGoals] = useState([]);
  const [plan, setPlan] = useState(null);
  const [cur, setCur] = useState('type');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSetUp = WORKSPACE_ADMIN_ROLES.has(bootstrap?.role);

  useEffect(() => {
    effyApi.getOnboarding().then((d) => {
      const ob = d.onboarding || {};
      setData(d);
      setOrgType(ob.orgType || d.org.type || 'business');
      setDetails({ ...DEFAULT_DETAILS, ...(ob.details || {}) });
      setOtherIndustry(!!ob.details?.industry && !INDUSTRIES.includes(ob.details.industry));
      setOffer(ob.offer || '');
      setGoals(ob.goals || []);
      setPlan(d.plan);
      setCur(stepsFor(ob.offer).includes(ob.step) ? ob.step : 'type');
    }).catch((e) => setLoadError(e.message));
  }, []);

  const steps = stepsFor(offer);
  const index = Math.max(0, steps.indexOf(cur));

  const answersFor = (step) => ({
    type: { orgType },
    details: { details },
    offer: { offer },
    goals: { goals },
  }[step] || {});

  const problem = () => {
    if (cur === 'details' && !details.name.trim()) return orgType === 'personal_brand' ? 'Enter your name.' : 'Enter your business or agency name.';
    if (cur === 'details' && !details.industry.trim()) {
      return otherIndustry ? 'Tell us which business you’re in.' : 'Choose your industry, or pick Other and describe it.';
    }
    if (cur === 'offer' && !offer) return 'Choose what you want to do with EffySocial.';
    if (cur === 'goals' && !goals.length) return 'Pick at least one goal.';
    return '';
  };

  const next = async () => {
    const p = problem();
    if (p) { setError(p); return; }
    const to = steps[index + 1];
    setSaving(true); setError('');
    try {
      await effyApi.saveOnboarding({ ...answersFor(cur), step: to });
      setCur(to);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };
  const back = () => { setError(''); setCur(steps[Math.max(index - 1, 0)]); };

  const finish = async (to) => {
    setSaving(true); setError('');
    try {
      await effyApi.completeOnboarding();
      await refresh();
      navigate(to);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  const toggleGoal = (g) => setGoals((list) => (list.includes(g) ? list.filter((x) => x !== g) : [...list, g]));
  const setDetail = (key) => (e) => setDetails((d) => ({ ...d, [key]: e.target.value }));

  if (loadError) {
    return <div className="min-h-dvh grid place-items-center bg-canvas text-ink p-6"><p role="alert" className="text-sm text-error">{loadError}</p></div>;
  }
  if (!data) {
    return <div className="min-h-dvh grid place-items-center bg-canvas text-ink-soft"><Loader2 className="w-5 h-5 animate-spin" aria-label="Loading" /></div>;
  }
  if (!canSetUp) {
    return (
      <div className="onboarding-page min-h-dvh grid place-items-center bg-canvas text-ink p-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight">{data.org.name} is set up by its owner</h1>
          <p className="text-ink-soft mt-2 mb-6">Your role ({bootstrap?.role}) can use EffySocial straight away.</p>
          <button type="button" onClick={() => navigate('/app')} className="px-5 py-2.5 rounded-lg bg-coral text-white font-bold">Go to EffySocial</button>
        </div>
      </div>
    );
  }

  const ws = data.workspace;
  const primary = 'flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-coral text-white font-bold shadow-[0_8px_20px_rgba(232,74,51,0.24)] disabled:opacity-50 hover:-translate-y-0.5 transition';

  return (
    <div className="onboarding-page min-h-dvh bg-canvas text-ink font-sans grid lg:grid-cols-[280px_1fr]">
      {/* A fixed dark rail, like the sign-in page's brand panel: the app's rail colours
          live under .app-root and would render white here. */}
      <aside className="hidden lg:flex flex-col bg-[#0B0C0E] text-white p-7" aria-label="Setup progress">
        <img src="/brand/effysocial-logo-trim.png" alt="EffySocial" className="w-auto self-start mb-10" style={{ height: 24 }} />
        <ol className="space-y-1 flex-1" aria-label="Onboarding steps">
          {steps.map((id, i) => (
            <li key={id} aria-current={i === index ? 'step' : undefined} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg', i === index ? 'bg-white/10' : '')}>
              <span className={cn('grid place-items-center w-7 h-7 rounded-full text-xs font-bold',
                i < index ? 'bg-success text-white' : i === index ? 'bg-coral text-white' : 'bg-white/10 text-white/60')}>
                {i < index ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <span className={cn('text-sm font-semibold', i === index ? 'text-white' : 'text-white/60')}>{STEP_META[id].label}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-white/50">Step {index + 1} of {steps.length}</p>
      </aside>

      <main className="flex flex-col">
        <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
          {cur === 'type' && (
            <Step title="Welcome! What best describes you?" sub="We'll tailor EffySocial to how you work.">
              <div role="radiogroup" aria-label="Organisation type" className="space-y-3">
                {ORG_TYPES.map((t) => <Choice key={t.id} selected={orgType === t.id} onClick={() => setOrgType(t.id)} label={t.label} desc={t.desc} />)}
              </div>
            </Step>
          )}

          {cur === 'details' && (
            <Step title={{ agency: 'Tell us about your agency', personal_brand: 'Tell us about yourself' }[orgType] || 'Tell us about your business'} sub="This personalises your workspace, plans and reports.">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name"><input className={input} value={details.name} onChange={setDetail('name')} maxLength={160}
                  placeholder={{ agency: 'e.g. Northwind Digital', personal_brand: 'e.g. Dr Asha Rao' }[orgType] || 'e.g. Roofseal Pune'} /></Field>
                <Field label="Website" hint="Optional — we’ll read your home page and main pages to learn what you do.">
                  <input className={input} value={details.website} onChange={setDetail('website')} maxLength={300} placeholder="https://…" />
                </Field>
                <Field label="Industry">
                  <select aria-label="Industry" className={input} value={otherIndustry ? OTHER : details.industry}
                    onChange={(e) => {
                      const other = e.target.value === OTHER;
                      setOtherIndustry(other);
                      setDetails((d) => ({ ...d, industry: other ? '' : e.target.value }));
                    }}>
                    <option value="">Choose your industry…</option>
                    {INDUSTRY_GROUPS.map(([group, items]) => (
                      <optgroup key={group} label={group}>{items.map((i) => <option key={i} value={i}>{i}</option>)}</optgroup>
                    ))}
                    <option value={OTHER}>Other — not listed</option>
                  </select>
                </Field>
                {otherIndustry && (
                  <Field label="Which business are you in?" hint="A few words is enough, e.g. “AI voice agents for banks”." className="sm:col-span-2">
                    <input className={input} value={details.industry} onChange={setDetail('industry')} maxLength={80} autoFocus placeholder="Describe your business" />
                  </Field>
                )}
                <Field label="Primary location"><input className={input} value={details.location} onChange={setDetail('location')} maxLength={80} placeholder="e.g. Pune, India" /></Field>
                <Field label="Time zone">
                  <select aria-label="Time zone" className={input} value={details.timezone} onChange={setDetail('timezone')}>
                    {data.options.timezones.map((t) => <option key={t} value={t}>{TZ_LABELS[t] || t}</option>)}
                  </select>
                </Field>
                <Field label="Currency">
                  <select aria-label="Currency" className={input} value={details.currency} onChange={setDetail('currency')}>
                    {data.options.currencies.map((c) => <option key={c} value={c}>{CURRENCY_LABELS[c] || c}</option>)}
                  </select>
                </Field>
                <Field label="Team size">
                  <select aria-label="Team size" className={input} value={details.teamSize} onChange={setDetail('teamSize')}>
                    {data.options.teamSizes.map((t) => <option key={t} value={t}>{t.replace('-', '–')}</option>)}
                  </select>
                </Field>
              </div>
            </Step>
          )}

          {cur === 'offer' && (
            <Step title="What do you want to do with EffySocial?" sub="We'll set up the right tools first. You can use everything later.">
              <div role="radiogroup" aria-label="What you need" className="space-y-3">
                {OFFERS.map((o) => <Choice key={o.id} selected={offer === o.id} onClick={() => setOffer(o.id)} label={o.label} desc={o.desc} />)}
              </div>
            </Step>
          )}

          {cur === 'goals' && (
            <Step title="What do you want to achieve?" sub="Pick all that apply — your first plan is built around them.">
              <div className="flex flex-wrap gap-2.5" role="group" aria-label="Goals">
                {data.options.goals.map((g) => (
                  <button key={g} type="button" aria-pressed={goals.includes(g)} onClick={() => toggleGoal(g)}
                    className={cn('px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition', goals.includes(g) ? 'border-coral bg-coral text-white' : 'border-line text-ink-soft hover:border-coral/50')}>
                    {g}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {cur === 'connect' && ws && <ConnectStep workspace={ws} />}
          {cur === 'brand' && ws && <BrandStep workspace={ws} website={details.website} />}
          {cur === 'plan' && ws && <PlanStep workspace={ws} plan={plan} onPlan={setPlan} />}

          {cur === 'start' && (
            <Step title="You're ready to create" sub="No accounts to connect — pick where to start. Everything else stays one click away.">
              <div className="grid sm:grid-cols-2 gap-3">
                <button type="button" disabled={saving} onClick={() => finish('/app/studio')}
                  className="text-left p-5 rounded-xl border-2 border-line hover:border-coral transition disabled:opacity-50">
                  <Wand2 className="w-6 h-6 text-coral-ink mb-2" />
                  <span className="block font-bold text-ink">Open AI Studio</span>
                  <span className="block text-sm text-ink-soft">Posts, images, Product Shots and avatars.</span>
                </button>
                <button type="button" disabled={saving} onClick={() => finish('/app/films')}
                  className="text-left p-5 rounded-xl border-2 border-line hover:border-coral transition disabled:opacity-50">
                  <Clapperboard className="w-6 h-6 text-coral-ink mb-2" />
                  <span className="block font-bold text-ink">Make an ad film</span>
                  <span className="block text-sm text-ink-soft">From a brief to a finished film.</span>
                </button>
              </div>
            </Step>
          )}

          {error && <p role="alert" className="mt-5 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</p>}
        </div>

        <div className="border-t border-line bg-canvas/80 backdrop-blur sticky bottom-0">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <button type="button" onClick={back} disabled={index === 0 || saving} className="flex items-center gap-1.5 text-sm font-bold text-ink-soft disabled:opacity-40 hover:text-ink">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {cur === 'plan' ? (
              <button type="button" onClick={() => finish(offer === 'marketing' ? '/app/home' : '/app')} disabled={!plan || saving} className={primary}>
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : cur !== 'start' && (
              <button type="button" onClick={next} disabled={saving} className={primary}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Continue <ArrowRight className="w-4 h-4" />
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
