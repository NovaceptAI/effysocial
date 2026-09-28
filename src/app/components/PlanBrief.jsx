import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Button, Card } from '../../ui';
import { cn } from '../../lib/cn';

// The workspace's plan brief (launch plan 6.17, engine brief.py): what is marketed here —
// a business or a personal brand — and one goal with a monthly target, the offer, the
// customer, the ad budget, the posts a week the team can make, and the website. Plans are
// written from it, never from the organisation's sign-up answers.
const FIELD = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink disabled:opacity-70';
const MISSING = { goal: 'a goal', target: 'a target', offer: 'what you offer', customer: 'who it’s for', budget: 'the ad budget', capacity: 'posts a week' };

const toForm = (b) => ({
  kind: b?.kind || 'business', metric: b?.goal?.metric || '', target: b?.goal?.target ?? '',
  offer: b?.offer || '', customer: b?.customer || '', budget: b?.budget ?? '', capacity: b?.capacity ?? '', website: b?.website || '',
});

function Label({ children, hint }) {
  return (
    <span className="block mb-1">
      <span className="text-xs font-semibold text-ink-soft">{children}</span>
      {hint && <span className="block text-[0.7rem] text-ink-faint">{hint}</span>}
    </span>
  );
}

export default function PlanBrief({ workspaceId, brief, options, canWrite, onSaved }) {
  const [form, setForm] = useState(() => toForm(brief));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => { setForm(toForm(brief)); }, [brief]);
  useEffect(() => { setMsg(null); }, [workspaceId]);

  if (!brief) return null;
  const metrics = options?.metrics || [];
  const unit = metrics.find((m) => m.key === form.metric)?.unit || '';
  const personal = form.kind === 'personal_brand';
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const readOnly = !canWrite;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const saved = await effyApi.saveBrief(workspaceId, {
        ...(brief.kindEditable ? { kind: form.kind } : {}),
        goal: { metric: form.metric || null, target: form.target === '' ? null : form.target },
        offer: form.offer, customer: form.customer, budget: form.budget, capacity: form.capacity, website: form.website.trim(),
      });
      onSaved?.(saved);
      setMsg({ ok: true, text: 'Brief saved.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
    setBusy(false);
  };

  return (
    <Card className="p-5">
      <section aria-label="Plan brief">
        <h3 className="font-bold text-ink">Plan brief</h3>
        <p className="text-xs text-ink-faint mt-0.5 mb-3">The plan is written from this, for this workspace only.</p>
        <form onSubmit={save} className="space-y-3" noValidate>
          <div>
            <Label hint={brief.kindEditable ? null : 'Follows your profile.'}>What’s marketed here</Label>
            {brief.kindEditable && !readOnly ? (
              <div role="radiogroup" aria-label="What’s marketed here" className="grid grid-cols-2 gap-2">
                {(options?.kinds || []).map((k) => (
                  <button key={k.key} type="button" role="radio" aria-checked={form.kind === k.key} onClick={() => setForm((f) => ({ ...f, kind: k.key }))}
                    className={cn('flex items-center justify-between rounded-lg border-2 px-3 py-2 text-sm font-semibold transition',
                      form.kind === k.key ? 'border-coral bg-coral-soft/40 text-ink' : 'border-line text-ink-soft hover:border-coral/50')}>
                    {k.label}{form.kind === k.key && <Check className="w-4 h-4 text-coral" />}
                  </button>
                ))}
              </div>
            ) : <p className="text-sm font-semibold text-ink">{brief.kindLabel}</p>}
          </div>

          <label className="block">
            <Label>Goal</Label>
            <select aria-label="Goal" className={FIELD} value={form.metric} onChange={set('metric')} disabled={readOnly}>
              <option value="">Choose one goal…</option>
              {metrics.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </label>
          {form.metric && (
            <label className="block">
              <Label hint={`Aim for this many ${unit}. Leave it blank and the plan suggests one.`}>Target</Label>
              <input aria-label="Target" inputMode="numeric" className={FIELD} value={form.target} onChange={set('target')} disabled={readOnly} placeholder="e.g. 40" />
            </label>
          )}
          <label className="block">
            <Label>{personal ? 'What you offer' : 'What the business offers'}</Label>
            <textarea aria-label="What’s offered" rows={2} maxLength={400} className={FIELD} value={form.offer} onChange={set('offer')} disabled={readOnly}
              placeholder={personal ? 'e.g. Paediatric dental check-ups and braces' : 'e.g. Terrace waterproofing with a 5-year warranty'} />
          </label>
          <label className="block">
            <Label>Who it’s for</Label>
            <textarea aria-label="Who it’s for" rows={2} maxLength={400} className={FIELD} value={form.customer} onChange={set('customer')} disabled={readOnly}
              placeholder="e.g. Housing societies in Pune, before the monsoon" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <Label hint={`${brief.currency} a month · 0 = organic only`}>Ad budget</Label>
              <input aria-label="Ad budget" inputMode="numeric" className={FIELD} value={form.budget} onChange={set('budget')} disabled={readOnly} />
            </label>
            <label className="block">
              <Label hint="the team can make">Posts a week</Label>
              <input aria-label="Posts a week" inputMode="numeric" className={FIELD} value={form.capacity} onChange={set('capacity')} disabled={readOnly} />
            </label>
          </div>
          <label className="block">
            <Label hint="Read once when the plan is written.">Website</Label>
            <input aria-label="Website" className={FIELD} value={form.website} onChange={set('website')} disabled={readOnly} placeholder="https://…" maxLength={300} />
          </label>

          {brief.missing?.length > 0 && (
            <p role="note" className="text-xs rounded-lg bg-surface2 text-ink-soft px-3 py-2">
              Still to add: {brief.missing.map((k) => MISSING[k] || k).join(', ')}.{brief.missing.includes('goal') ? ' A plan needs at least the goal.' : ''}
            </p>
          )}
          {msg && <p role={msg.ok ? 'status' : 'alert'} className={cn('text-xs', msg.ok ? 'text-success' : 'text-error')}>{msg.text}</p>}
          {!readOnly && <Button type="submit" size="sm" disabled={busy}>{busy ? 'Saving…' : 'Save brief'}</Button>}
        </form>
      </section>
    </Card>
  );
}
