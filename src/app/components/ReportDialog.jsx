import React, { useCallback, useEffect, useState } from 'react';
import { X, RefreshCw, ExternalLink } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { formatInZone, orgZone } from '../timezone';
import { Button, Card } from '../../ui';

const FIGURES = [
  ['reach', 'Reach'], ['views', 'Views'], ['likes', 'Likes'], ['comments', 'Comments'],
  ['saved', 'Saves'], ['shares', 'Shares'], ['interactions', 'Interactions'], ['profileVisits', 'Profile visits'], ['follows', 'Follows'],
];

// Published → Report: the post's live numbers from Instagram, fetched on open and
// kept on the post (so its card and Organic analytics show them too).
export default function ReportDialog({ post, onClose, onChange }) {
  const { org } = useWorkspace();
  const [state, setState] = useState({ loading: true, error: '', metrics: post?.metrics || null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const r = await effyApi.postInsights(post.id);
      setState({ loading: false, error: '', metrics: r.metrics });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message || 'Could not read the numbers from Instagram.' }));
    } finally {
      onChange?.();
    }
  }, [post?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (post) load(); }, [post?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!post) return null;
  const { metrics } = state;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-labelledby="report-title" className="max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 id="report-title" className="font-extrabold text-ink">Report: {post.title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-ink-faint mb-4">
          {post.publishedAt ? `Published ${formatInZone(post.publishedAt, orgZone(org))} on Instagram. ` : ''}
          Instagram can take up to 48 hours to settle these numbers.
        </p>

        {state.error && <div role="alert" className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{state.error}</div>}
        {metrics ? (
          <>
            <dl className="grid grid-cols-3 gap-3 mb-3">
              {FIGURES.filter(([key]) => metrics[key] !== undefined).map(([key, label]) => (
                <div key={key} className="rounded-xl bg-surface2/70 px-3 py-2.5">
                  <dt className="text-[0.68rem] font-semibold text-ink-faint">{label}</dt>
                  <dd className="text-lg font-extrabold tabular-nums text-ink">{num(metrics[key])}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-ink-soft">
              Engagement rate <strong className="text-ink tabular-nums">{metrics.engagement}%</strong>
              <span className="text-xs text-ink-faint"> (interactions ÷ reach)</span>
            </p>
            {metrics.syncedAt && <p className="text-xs text-ink-faint mt-1">Read from Instagram {formatInZone(metrics.syncedAt, orgZone(org))}.</p>}
          </>
        ) : state.loading ? (
          <p role="status" className="py-8 text-center text-sm text-ink-soft">Reading the numbers from Instagram…</p>
        ) : null}

        <div className="flex items-center justify-between gap-2 mt-5">
          {post.permalink ? (
            <a href={post.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-coral-ink">
              View on Instagram <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : <span />}
          <Button type="button" variant="secondary" size="sm" disabled={state.loading} onClick={load}>
            <RefreshCw className={state.loading ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'} /> {state.loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
