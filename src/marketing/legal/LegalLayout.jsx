import React from 'react';
import { Link } from 'react-router-dom';
import { LEGAL } from './meta';

// A detail the approvers must fill in. Highlighted so it can't be missed in review.
export function Ph({ children }) {
  return <mark className="rounded bg-warning-soft px-1 text-warning font-semibold not-italic">[{children}]</mark>;
}

export function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink mt-12 mb-3">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-coral-ink [&_a]:font-semibold">
        {children}
      </div>
    </section>
  );
}

export function LegalFooterLinks({ className = '' }) {
  return (
    <nav aria-label="Legal" className={`flex items-center gap-4 ${className}`}>
      <Link to="/privacy" className="hover:text-ink">Privacy Policy</Link>
      <Link to="/terms" className="hover:text-ink">Terms of Service</Link>
    </nav>
  );
}

export default function LegalLayout({ title, intro, sections, children }) {
  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur-xl border-b border-hair">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/brand/effysocial-logo-trim.png" alt="EffySocial" className="w-auto" style={{ height: 26 }} />
          </Link>
          <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-bold text-ink hover:bg-surface2 transition">Log in</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24 text-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-3">On this page</p>
            <ol className="space-y-2">
              {sections.map(([id, label]) => (
                <li key={id}><a href={`#${id}`} className="text-ink-soft hover:text-coral-ink">{label}</a></li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="max-w-[68ch]">
          {LEGAL.draft && (
            <div role="note" className="mb-8 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
              <strong className="font-bold">Draft — pending approval.</strong>{' '}
              This document is under review and may change before it takes effect. Highlighted items in brackets are still to be confirmed:{' '}
              {LEGAL.placeholders.join(', ')}.
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-wide text-coral-ink">Last updated {LEGAL.lastUpdated}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink mt-2">{title}</h1>
          <p className="mt-4 text-lg text-ink-soft leading-relaxed">{intro}</p>
          {children}
        </article>
      </main>

      <footer className="border-t border-hair">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-faint">
          <Link to="/" className="flex items-center"><img src="/brand/effysocial-logo-trim.png" alt="EffySocial" className="w-auto" style={{ height: 20 }} /></Link>
          <LegalFooterLinks />
          <span>Powered by EffyBiz · © 2026</span>
        </div>
      </footer>
    </div>
  );
}
