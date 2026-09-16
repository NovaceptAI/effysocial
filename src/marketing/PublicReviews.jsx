import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Loader2, Star } from 'lucide-react';
import { effyApi } from '../app/api/effyApi';

// Public review-request page (/r/:slug) — no auth (launch plan 5.8, G31). Everyone
// sees every review site and the private feedback box, whatever they think of the
// business: Google forbids steering only happy customers to it.
export default function PublicReviews() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [state, setState] = useState('loading');   // loading | ready | missing
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    effyApi.publicReviewPage(slug)
      .then((d) => { setPage(d); setState('ready'); })
      .catch(() => setState('missing'));
  }, [slug]);

  const visit = (site) => {
    // Count the click without holding the visitor up; the link opens either way.
    effyApi.publicReviewClick(slug, site.id).catch(() => {});
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!rating) { setError('Choose from 1 to 5 stars.'); return; }
    if (!text.trim()) { setError('Tell us a little about your experience.'); return; }
    setBusy(true);
    try {
      await effyApi.publicReviewFeedback(slug, { rating, name, text, website: honeypot });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send your feedback. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const shell = (children) => (
    <div className="min-h-dvh bg-canvas text-ink font-sans grid place-items-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-line rounded-2xl shadow-e2 p-7">{children}</div>
        <p className="text-center text-xs text-ink-faint mt-4">Powered by EffySocial</p>
      </div>
    </div>
  );

  if (state === 'loading') return shell(<p className="flex items-center gap-2 text-ink-soft text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>);
  if (state === 'missing') return shell(<p className="text-sm text-ink-soft">This review link isn’t available.</p>);

  return shell(
    <>
      <div className="text-center mb-6">
        <div className="grid place-items-center w-12 h-12 rounded-xl bg-coral-soft text-2xl mx-auto mb-3">{page.business.logo || '✦'}</div>
        <h1 className="text-xl font-extrabold tracking-tight">How was your experience with {page.business.name}?</h1>
        <p className="text-sm text-ink-soft mt-1.5">A review helps other people decide — and helps {page.business.name} get better.</p>
      </div>

      <section aria-label="Leave a public review" className="space-y-2">
        {page.sites.map((site) => (
          <a key={site.id} href={site.url} target="_blank" rel="noopener noreferrer" onClick={() => visit(site)}
            className="flex items-center justify-between w-full rounded-lg border border-line px-4 py-3 font-semibold text-ink hover:border-coral hover:bg-coral-soft/40 transition">
            Review us on {site.label === 'Our review page' ? 'our review page' : site.label}
            <ExternalLink className="w-4 h-4 text-ink-faint" />
          </a>
        ))}
      </section>

      <div className="flex items-center gap-3 my-6 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-line" /> or tell {page.business.name} privately <span className="h-px flex-1 bg-line" />
      </div>

      {sent ? (
        <div role="status" className="text-center py-2">
          <CheckCircle2 className="w-9 h-9 text-success mx-auto mb-2" />
          <p className="font-bold text-ink">Thank you — {page.business.name} has your feedback.</p>
        </div>
      ) : (
        <form onSubmit={submit} aria-label="Private feedback">
          <fieldset className="mb-3">
            <legend className="text-sm font-semibold text-ink-soft mb-1.5">Your rating</legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-label={`${n} star${n === 1 ? '' : 's'}`} aria-pressed={rating === n} onClick={() => setRating(n)}>
                  <Star className={`w-7 h-7 ${n <= rating ? 'fill-warning text-warning' : 'text-line'}`} />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block mb-3">
            <span className="block text-sm font-semibold text-ink-soft mb-1.5">What happened?</span>
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} maxLength={2000}
              className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-coral" />
          </label>
          <label className="block mb-3">
            <span className="block text-sm font-semibold text-ink-soft mb-1.5">Your name (optional)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120}
              className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-coral" />
          </label>
          {/* Honeypot: people never see this; bots fill it in. */}
          <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
            aria-hidden="true" className="absolute left-[-9999px] w-px h-px opacity-0" name="website" />
          {error && <p role="alert" className="text-sm text-error mb-3">{error}</p>}
          <button type="submit" disabled={busy}
            className="w-full rounded-lg bg-coral text-white font-bold py-3 hover:brightness-95 transition disabled:opacity-60">
            {busy ? 'Sending…' : 'Send privately'}
          </button>
        </form>
      )}
    </>,
  );
}
