import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button, Card } from '../../ui';

const INPUT = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink';
const OBJECTIVES = ['Lead generation', 'WhatsApp conversations', 'Website traffic', 'Awareness', 'Appointments', 'Sales', 'Engagement', 'Retention'];
const STATUSES = [['draft', 'Draft'], ['live', 'Live'], ['paused', 'Paused'], ['completed', 'Completed']];
const CHANNELS = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['whatsapp', 'WhatsApp'], ['linkedin', 'LinkedIn'], ['google', 'Google'], ['youtube', 'YouTube']];

// Edit a campaign's basics (launch plan 5.1). What it saves is what the workspace
// header, plan tab and pacing read.
export default function CampaignDialog({ open, campaign, onClose, onSaved }) {
  const { canWrite } = useWorkspace();
  const queryClient = useQueryClient();
  const nameRef = useRef(null);
  const [form, setForm] = useState(() => fromCampaign(campaign));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const openedFor = open ? String(campaign?.id ?? '') : '';
  useEffect(() => {
    if (!openedFor) return;
    setForm(fromCampaign(campaign));
    setError(''); setBusy(false);
    setTimeout(() => nameRef.current?.focus(), 0);
  }, [openedFor]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open || !campaign) return null;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleChannel = (key) => setForm((f) => ({
    ...f, channels: f.channels.includes(key) ? f.channels.filter((c) => c !== key) : [...f.channels, key],
  }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Give the campaign a name.'); return; }
    setBusy(true); setError('');
    try {
      const saved = await effyApi.updateCampaign(campaign.id, {
        name: form.name.trim(), objective: form.objective, status: form.status, pillar: form.pillar.trim(),
        owner: form.owner.trim(), budget: Number(form.budget) || 0, channels: form.channels,
        start: form.start, end: form.end,
      });
      queryClient.invalidateQueries({ queryKey: ['campaign', String(campaign.id)] });
      queryClient.invalidateQueries({ queryKey: ['campaign-workspace', String(campaign.id)] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the campaign.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-labelledby="campaign-dialog-title" className="max-w-lg w-full max-h-[92vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="campaign-dialog-title" className="font-extrabold text-ink">Edit campaign</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <fieldset disabled={!canWrite || busy} className="space-y-3">
            <label className="block">
              <span className="block text-xs font-semibold text-ink-soft mb-1">Name</span>
              <input ref={nameRef} className={INPUT} value={form.name} onChange={set('name')} maxLength={200} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Objective</span>
                <select className={INPUT} value={form.objective} onChange={set('objective')}>
                  {[...new Set([form.objective, ...OBJECTIVES])].filter(Boolean).map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Status</span>
                <select className={INPUT} value={form.status} onChange={set('status')}>
                  {STATUSES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Pillar</span>
                <input className={INPUT} value={form.pillar} onChange={set('pillar')} maxLength={60} placeholder="e.g. Proof" />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Owner</span>
                <input className={INPUT} value={form.owner} onChange={set('owner')} maxLength={120} placeholder="Who runs it" />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Budget (₹)</span>
                <input type="number" min="0" className={INPUT} value={form.budget} onChange={set('budget')} />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Starts</span>
                <input type="date" className={INPUT} value={form.start} onChange={set('start')} />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-ink-soft mb-1">Ends</span>
                <input type="date" className={INPUT} value={form.end} onChange={set('end')} />
              </label>
            </div>
            <fieldset>
              <legend className="block text-xs font-semibold text-ink-soft mb-1">Channels</legend>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map(([key, label]) => (
                  <label key={key} className="inline-flex items-center gap-1.5 text-sm rounded-lg bg-surface2 px-2.5 py-1.5">
                    <input type="checkbox" className="accent-coral" checked={form.channels.includes(key)} onChange={() => toggleChannel(key)} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </fieldset>
          {error && <div role="alert" className="text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!canWrite || busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function fromCampaign(c) {
  return {
    name: c?.name || '', objective: c?.objective || 'Lead generation', status: c?.status || 'draft',
    pillar: c?.pillar || '', owner: c?.owner || '', budget: c?.budget ?? 0,
    channels: c?.channels || [], start: c?.start || '', end: c?.end || '',
  };
}
