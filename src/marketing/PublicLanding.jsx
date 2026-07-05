import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { effyApi } from '../app/api/effyApi';

// Public hosted landing page (/p/:slug) — no auth. Brand-accented sections;
// the embedded lead form reuses the Forms public flow (honeypot, UTM → lead),
// with utm_* query params passed straight through to the submission.
function EmbeddedForm({ formSlug, accent }) {
  const [params] = useSearchParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [honeypot, setHoneypot] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [thankyou, setThankyou] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    effyApi.publicForm(formSlug).then(setForm).catch(() => setForm(null));
  }, [formSlug]);

  if (!form) return null;
  if (thankyou) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: accent }} />
        <p className="font-bold text-ink">{thankyou}</p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.consentText && !consent) { setError('Please accept the consent checkbox.'); return; }
    setBusy(true);
    try {
      const utm = {
        source: params.get('utm_source') || '',
        medium: params.get('utm_medium') || '',
        campaign: params.get('utm_campaign') || '',
      };
      const d = await effyApi.publicSubmit(formSlug, { data: values, utm, website: honeypot });
      setThankyou(d.thankyou);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:ring-2';
  return (
    <form onSubmit={submit}>
      <h2 className="text-lg font-extrabold tracking-tight mb-4">{form.name}</h2>
      {error && <div className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}
      <div className="space-y-4">
        {form.fields.map((f) => (
          <label key={f.id} className="block">
            <span className="block text-sm font-semibold text-ink-soft mb-1.5">
              {f.label}{f.required && <span style={{ color: accent }}> *</span>}
            </span>
            {f.type === 'textarea' ? (
              <textarea rows={3} required={f.required} value={values[f.id] || ''}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} className={inputCls} />
            ) : f.type === 'select' ? (
              <select required={f.required} value={values[f.id] || ''}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} className={inputCls}>
                <option value="">Choose…</option>
                {(f.options || []).map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : 'text'}
                required={f.required} value={values[f.id] || ''}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} className={inputCls} />
            )}
          </label>
        ))}
        {/* honeypot — hidden from humans */}
        <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" tabIndex={-1} autoComplete="off"
          className="absolute opacity-0 pointer-events-none h-0 w-0" aria-hidden="true" />
        {form.consentText && (
          <label className="flex items-start gap-2.5 text-sm text-ink-soft cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            {form.consentText}
          </label>
        )}
      </div>
      <button type="submit" disabled={busy}
        className="mt-6 w-full rounded-lg text-white font-bold py-3 hover:-translate-y-0.5 transition disabled:opacity-60"
        style={{ background: accent }}>
        {busy ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}

export default function PublicLanding() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing

  useEffect(() => {
    effyApi.publicLanding(slug)
      .then((p) => { setPage(p); setState('ready'); })
      .catch(() => setState('missing'));
  }, [slug]);

  if (state === 'loading') {
    return (
      <div className="min-h-dvh bg-canvas grid place-items-center">
        <p className="flex items-center gap-2 text-ink-soft text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>
      </div>
    );
  }
  if (state === 'missing') {
    return (
      <div className="min-h-dvh bg-canvas grid place-items-center p-6">
        <p className="text-sm text-ink-soft">This page isn't available. It may have been unpublished.</p>
      </div>
    );
  }

  const { sections, formSlug, whatsapp, phone } = page;
  const accent = page.accent || '#e84a33';
  const enabled = sections.enabled || {};
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in ${page.name}.`)}`
    : '';

  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans">
      <header className="max-w-3xl mx-auto flex items-center gap-2 px-6 py-5 font-extrabold">
        <span className="grid place-items-center w-8 h-8 rounded-[9px] text-white" style={{ background: accent }}>{page.logo || '✦'}</span>
        {page.workspace}
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-16">
        {/* Hero */}
        <section className="text-center py-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{sections.hero.headline || page.name}</h1>
          {sections.hero.sub && <p className="mt-4 text-lg text-ink-soft max-w-xl mx-auto">{sections.hero.sub}</p>}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {enabled.form && formSlug && (
              <a href="#lead-form" className="rounded-lg text-white font-bold px-6 py-3 hover:-translate-y-0.5 transition"
                style={{ background: accent }}>
                {sections.hero.cta || 'Get started'}
              </a>
            )}
            {enabled.whatsapp && waLink && (
              <a href={waLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-line bg-surface font-bold px-5 py-3 hover:-translate-y-0.5 transition">
                <MessageCircle className="w-4 h-4" style={{ color: accent }} /> WhatsApp us
              </a>
            )}
            {enabled.call && phone && (
              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface font-bold px-5 py-3 hover:-translate-y-0.5 transition">
                <Phone className="w-4 h-4" style={{ color: accent }} /> Call us
              </a>
            )}
          </div>
        </section>

        {/* Features */}
        {enabled.features && sections.features.items.length > 0 && (
          <section className="py-8">
            <h2 className="text-xl font-extrabold tracking-tight text-center mb-6">{sections.features.title}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {sections.features.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-surface border border-line rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
                  <span className="text-sm font-semibold text-ink-soft">{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonial */}
        {enabled.testimonial && sections.testimonial.quote && (
          <section className="py-8">
            <blockquote className="bg-surface border border-line rounded-2xl p-7 text-center max-w-xl mx-auto">
              <p className="text-lg font-semibold">“{sections.testimonial.quote}”</p>
              {sections.testimonial.author && <footer className="mt-3 text-sm text-ink-faint">— {sections.testimonial.author}</footer>}
            </blockquote>
          </section>
        )}

        {/* Lead form */}
        {enabled.form && formSlug && (
          <section id="lead-form" className="py-8">
            <div className="bg-surface border border-line rounded-2xl shadow-e2 p-7 max-w-md mx-auto">
              <EmbeddedForm formSlug={formSlug} accent={accent} />
            </div>
          </section>
        )}
      </main>

      <p className="text-center text-xs text-ink-faint pb-8">Powered by EffySocial</p>
    </div>
  );
}
