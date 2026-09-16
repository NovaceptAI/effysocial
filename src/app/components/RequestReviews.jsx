import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Loader2, MessageCircle, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button, Card } from '../../ui';

// Request reviews (launch plan 5.8, G31): one shareable page listing where the business
// takes reviews. Every visitor sees every site — no filtering by how happy they are.
const FIELDS = [
  { id: 'google', label: 'Google review link', placeholder: 'https://g.page/r/…/review' },
  { id: 'facebook', label: 'Facebook reviews page', placeholder: 'https://facebook.com/…/reviews' },
  { id: 'other', label: 'Another review site (Justdial, Practo, Zomato…)', placeholder: 'https://…' },
];

export default function RequestReviews({ onClose }) {
  const { workspace, canWrite } = useWorkspace();
  const qc = useQueryClient();
  const key = ['review-link', workspace.id];
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => effyApi.getReviewLink(workspace.id) });
  const link = data?.link;
  const [sites, setSites] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (link) setSites(link.sites); }, [link]);

  const url = link ? `${window.location.origin}${link.publicUrl}` : '';
  const message = `Hi! Thanks for choosing ${workspace.name}. Would you take a minute to tell us how we did? ${url}`;

  const save = async () => {
    setBusy(true); setError('');
    try {
      const saved = await effyApi.saveReviewLink(workspace.id, sites);
      qc.setQueryData(key, { ...data, link: saved });
    } catch (e) {
      setError(e.message || 'Could not save the review links.');
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg p-5 max-h-[90dvh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="request-reviews-title"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 id="request-reviews-title" className="font-display text-lg font-semibold tracking-tight">Request reviews</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-ink-soft mb-4">
          Share one link with customers. It shows every place below, and a way to tell you privately — everyone sees all of it, whatever they thought.
        </p>

        {isLoading ? (
          <p className="text-sm text-ink-faint flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>
        ) : (
          <>
            <div className="space-y-3">
              {FIELDS.map((f) => (
                <label key={f.id} className="block">
                  <span className="block text-xs font-semibold text-ink-faint mb-1">{f.label}</span>
                  <input value={sites[f.id] || ''} onChange={(e) => setSites({ ...sites, [f.id]: e.target.value })}
                    placeholder={f.placeholder} disabled={!canWrite}
                    className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
                </label>
              ))}
            </div>
            {error && <p role="alert" className="text-sm text-error mt-3">{error}</p>}
            {canWrite && (
              <div className="flex justify-end mt-3">
                <Button size="sm" onClick={save} disabled={busy}>{busy ? 'Saving…' : link ? 'Save changes' : 'Create link'}</Button>
              </div>
            )}

            {link && (
              <div className="mt-5 pt-4 border-t border-line" role="region" aria-label="Your review link">
                <p className="text-xs font-semibold text-ink-faint mb-1">Your review link</p>
                <div className="flex gap-2">
                  <input readOnly value={url} aria-label="Review link" className="flex-1 rounded-sm border border-line bg-surface2 px-3 py-2 text-sm" />
                  <Button size="sm" variant="secondary" onClick={copy}>{copied ? <><Check className="w-3.5 h-3.5 text-success" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</Button>
                </div>
                <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-coral-ink hover:underline">
                  <MessageCircle className="w-4 h-4" /> Share on WhatsApp
                </a>
                <p className="text-xs text-ink-faint mt-3">
                  Opened {link.visits} time{link.visits === 1 ? '' : 's'}
                  {Object.entries(link.clicks || {}).map(([site, n]) => ` · ${n} went to ${site === 'other' ? 'your other site' : site[0].toUpperCase() + site.slice(1)}`).join('')}.
                  {' '}Private feedback appears in Reviews.
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
