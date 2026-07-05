import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, MessageCircle, ShoppingBag, CalendarCheck, CreditCard, Star, ExternalLink } from 'lucide-react';
import { effyApi } from '../app/api/effyApi';

// Public link-in-bio page (/b/:slug) — no auth. Every link click is recorded
// for per-link analytics; the lead form links to the hosted /f/:slug flow so
// submissions reuse the form → lead pipeline with UTM attribution.
const THEMES = {
  warm: { page: '#fdf6ef', card: '#ffffff', text: '#2b2119', soft: '#6f645c', border: '#e8d9c8' },
  dark: { page: '#1c1917', card: '#292421', text: '#f5efe9', soft: '#a89e96', border: '#3d3733' },
  mint: { page: '#eef7f1', card: '#ffffff', text: '#1d2b23', soft: '#5e7268', border: '#cfe5d6' },
};
// Brand icons were removed from lucide-react (trademark) — letter badges, as elsewhere.
const SOCIAL_LETTERS = { instagram: 'Ig', facebook: 'f', youtube: 'Yt', linkedin: 'in', x: 'X' };
const KIND_ICONS = {
  product: ShoppingBag, appointment: CalendarCheck, payment: CreditCard, featured: Star,
};

export default function PublicBio() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing

  useEffect(() => {
    effyApi.publicBio(slug)
      .then((p) => { setPage(p); setState('ready'); })
      .catch(() => setState('missing'));
  }, [slug]);

  if (state === 'loading') {
    return (
      <div className="min-h-dvh grid place-items-center bg-canvas">
        <p className="flex items-center gap-2 text-ink-soft text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>
      </div>
    );
  }
  if (state === 'missing') {
    return (
      <div className="min-h-dvh grid place-items-center bg-canvas p-6">
        <p className="text-sm text-ink-soft">This page isn't available. It may have been unpublished.</p>
      </div>
    );
  }

  const t = THEMES[page.theme] || THEMES.warm;
  const accent = page.accent || '#e84a33';
  const waLink = page.whatsapp
    ? `https://wa.me/${page.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I found you via your bio page.`)}`
    : '';
  const click = (linkId) => effyApi.publicBioClick(slug, linkId).catch(() => {});

  return (
    <div className="min-h-dvh font-sans" style={{ background: t.page, color: t.text }}>
      <main className="max-w-md mx-auto px-6 py-12">
        {/* Profile */}
        <div className="text-center">
          <span className="inline-grid place-items-center w-20 h-20 rounded-full text-4xl shadow-e2"
            style={{ background: t.card, border: `1px solid ${t.border}` }}>
            {page.avatar || '✦'}
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{page.title}</h1>
          {page.bio && <p className="mt-2 text-sm" style={{ color: t.soft }}>{page.bio}</p>}
          {/* Socials */}
          {Object.keys(page.socials || {}).length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              {Object.entries(page.socials).map(([key, url]) => (
                SOCIAL_LETTERS[key] ? (
                  <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={key}
                    className="grid place-items-center w-10 h-10 rounded-full text-sm font-bold transition hover:-translate-y-0.5"
                    style={{ background: t.card, border: `1px solid ${t.border}`, color: accent }}>
                    {SOCIAL_LETTERS[key]}
                  </a>
                ) : null
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="mt-8 space-y-3">
          {page.whatsapp && (
            <a href={waLink} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl text-white font-bold py-3.5 transition hover:-translate-y-0.5"
              style={{ background: accent }}>
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          )}
          {page.formSlug && (
            <Link to={`/f/${page.formSlug}${window.location.search}`}
              className="flex items-center justify-center gap-2 rounded-xl font-bold py-3.5 transition hover:-translate-y-0.5"
              style={{ background: t.card, border: `2px solid ${accent}`, color: accent }}>
              Get in touch
            </Link>
          )}
          {(page.links || []).map((l) => {
            const Icon = KIND_ICONS[l.kind] || ExternalLink;
            return (
              <a key={l.id} href={l.url} target="_blank" rel="noreferrer" onClick={() => click(l.id)}
                className="flex items-center gap-3 rounded-xl px-5 py-3.5 font-bold transition hover:-translate-y-0.5 shadow-e1"
                style={{ background: t.card, border: `1px solid ${t.border}`, color: t.text }}>
                <Icon className="w-4 h-4 shrink-0" style={{ color: accent }} />
                <span className="flex-1 text-center pr-7">{l.label}</span>
              </a>
            );
          })}
        </div>

        <footer className="mt-12 text-center text-xs" style={{ color: t.soft }}>
          Made with <span className="font-bold">EffySocial</span>
        </footer>
      </main>
    </div>
  );
}
