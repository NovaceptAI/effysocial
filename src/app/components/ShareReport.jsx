import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Link2, Loader2, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { formatInZone, orgZone } from '../timezone';
import { Badge, Button, Card } from '../../ui';

// Read-only share links for a campaign report (launch plan 5.10). Each link freezes the
// report as it is now; it is shown once (only its hash is kept), expires, and can be revoked.
const STATE_TONE = { active: 'success', expired: 'default', revoked: 'error' };

export default function ShareReport({ campaign, onClose }) {
  const { org, canWrite } = useWorkspace();
  const zone = orgZone(org);
  const qc = useQueryClient();
  const key = ['report-shares', campaign.id];
  const { data: shares = [], isLoading } = useQuery({ queryKey: key, queryFn: () => effyApi.reportShares(campaign.id) });
  const [days, setDays] = useState(30);
  const [made, setMade] = useState(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    setBusy(true); setError('');
    try {
      const r = await effyApi.shareCampaignReport(campaign.id, days);
      setMade(`${window.location.origin}${r.url}`);
      qc.invalidateQueries({ queryKey: key });
    } catch (e) {
      setError(e.message || 'Could not create a share link.');
    } finally {
      setBusy(false);
    }
  };
  const revoke = async (id) => {
    setError('');
    try {
      await effyApi.revokeReportShare(id);
      qc.invalidateQueries({ queryKey: key });
    } catch (e) {
      setError(e.message || 'Could not end that link.');
    }
  };
  const copy = () => { navigator.clipboard?.writeText(made); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg p-5 max-h-[90dvh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="share-report-title" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 id="share-report-title" className="font-display text-lg font-semibold tracking-tight">Share “{campaign.name}” report</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-ink-soft mb-4">
          Anyone with the link can read the report as it is right now — later changes don't appear. It shows your business name only.
        </p>

        {canWrite && (
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-sm">
              <span className="block text-xs font-semibold text-ink-faint mb-1">Link lasts</span>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm">
                {[7, 30, 90].map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </label>
            <Button onClick={create} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Create link</Button>
          </div>
        )}
        {made && (
          <div className="mt-3 rounded-lg bg-success-soft/50 p-3" role="region" aria-label="New share link">
            <div className="flex gap-2">
              <input readOnly value={made} aria-label="Share link" className="flex-1 rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm" />
              <Button size="sm" variant="secondary" onClick={copy}>{copied ? <><Check className="w-3.5 h-3.5 text-success" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</Button>
            </div>
            <p className="text-xs text-ink-soft mt-1.5">Copy it now — for safety it can't be shown again. Make a new one any time.</p>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-error mt-3">{error}</p>}

        <div className="mt-5 pt-4 border-t border-line">
          <h3 className="text-sm font-bold text-ink mb-2">Links for this report</h3>
          {isLoading ? <p className="text-xs text-ink-faint">Loading…</p> : !shares.length ? (
            <p className="text-xs text-ink-faint">No links yet.</p>
          ) : (
            <ul className="space-y-2" aria-label="Share links">
              {shares.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge tone={STATE_TONE[s.state]}>{s.state}</Badge>
                  <span className="text-ink-soft">
                    Made {formatInZone(s.createdAt, zone, { day: 'numeric', month: 'short' })}{s.createdBy ? ` by ${s.createdBy}` : ''} · {s.state === 'active' ? `ends ${formatInZone(s.expiresAt, zone, { day: 'numeric', month: 'short' })}` : 'ended'} · opened {s.views} time{s.views === 1 ? '' : 's'}
                  </span>
                  {s.state === 'active' && canWrite && (
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => revoke(s.id)}>End link</Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
