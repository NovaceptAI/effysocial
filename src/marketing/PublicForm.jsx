import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { effyApi } from '../app/api/effyApi';

// Public hosted form (/f/:slug) — no auth. Captures utm_* query params and
// submits them with the response; a hidden honeypot field deters bots.
export default function PublicForm() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const [form, setForm] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing | done
  const [values, setValues] = useState({});
  const [honeypot, setHoneypot] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [thankyou, setThankyou] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    effyApi.publicForm(slug)
      .then((f) => { setForm(f); setState('ready'); })
      .catch(() => setState('missing'));
  }, [slug]);

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
      const d = await effyApi.publicSubmit(slug, { data: values, utm, website: honeypot });
      setThankyou(d.thankyou);
      setState('done');
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const shell = (children) => (
    <div className="min-h-dvh bg-canvas text-ink font-sans grid place-items-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 font-extrabold text-lg mb-6">
          <span className="grid place-items-center w-8 h-8 rounded-[9px] bg-coral text-white">✦</span> EffySocial
        </div>
        <div className="bg-surface border border-line rounded-2xl shadow-e2 p-7">{children}</div>
        <p className="text-center text-xs text-ink-faint mt-4">Powered by EffySocial</p>
      </div>
    </div>
  );

  if (state === 'loading') return shell(<p className="flex items-center gap-2 text-ink-soft text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>);
  if (state === 'missing') return shell(<p className="text-sm text-ink-soft">This form isn't available. It may have been unpublished.</p>);
  if (state === 'done') return shell(
    <div className="text-center py-4">
      <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
      <p className="font-bold text-ink">{thankyou}</p>
    </div>
  );

  return shell(
    <form onSubmit={submit}>
      <h1 className="text-xl font-extrabold tracking-tight mb-5">{form.name}</h1>
      {error && <div className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}
      <div className="space-y-4">
        {form.fields.map((f) => (
          <label key={f.id} className="block">
            <span className="block text-sm font-semibold text-ink-soft mb-1.5">
              {f.label}{f.required && <span className="text-coral"> *</span>}
            </span>
            {f.type === 'textarea' ? (
              <textarea rows={3} required={f.required} value={values[f.id] || ''}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none" />
            ) : f.type === 'select' ? (
              <select required={f.required} value={values[f.id] || ''}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none">
                <option value="">Choose…</option>
                {(f.options || []).map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : 'text'}
                required={f.required} value={values[f.id] || ''}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none" />
            )}
          </label>
        ))}
        {/* honeypot — hidden from humans */}
        <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" tabIndex={-1} autoComplete="off"
          className="absolute opacity-0 pointer-events-none h-0 w-0" aria-hidden="true" />
        {form.consentText && (
          <label className="flex items-start gap-2.5 text-sm text-ink-soft cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-coral" />
            {form.consentText}
          </label>
        )}
      </div>
      <button type="submit" disabled={busy}
        className="mt-6 w-full rounded-lg bg-coral text-white font-bold py-3 shadow-[0_8px_20px_rgba(232,74,51,0.24)] hover:-translate-y-0.5 transition disabled:opacity-60">
        {busy ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}
