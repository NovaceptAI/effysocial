import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useAppAuth } from '../context/AppAuth';
import { PROFILE_TYPES } from '../profiles';
import { Button, Card } from '../../ui';
import { cn } from '../../lib/cn';

const INPUT = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink';

// Add account type (launch plan 6.15): another profile on this login — any type, any
// number — with its own plan, team and billing. Only a login's first own profile gets
// the free trial; the engine decides, and this says which it will be before you add it.
// Needs only the signed-in session, so the no-organisation screen can use it too.
export default function AddProfileDialog({ open, onClose, onCreated }) {
  const { bootstrap, addProfile } = useAppAuth();
  const [type, setType] = useState('business');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setType('business'); setName(''); setError(''); setBusy(false);
  }, [open]);

  if (!open) return null;
  const spec = PROFILE_TYPES.find((t) => t.id === type);
  const trial = !!bootstrap?.newProfileTrial;

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError(type === 'personal_brand' ? 'Enter your name.' : 'Enter a name for this profile.'); nameRef.current?.focus(); return; }
    setBusy(true); setError('');
    const r = await addProfile({ type, name: name.trim() }, (data) => onCreated?.(data));
    if (!r.ok) { setError(r.message); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-labelledby="add-profile-title" className="max-w-lg w-full p-6 text-left"
        onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="flex items-center justify-between mb-1">
          <h3 id="add-profile-title" className="font-extrabold text-ink">Add account type</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-ink-soft mb-4">A separate profile on this login, with its own plan, team and billing. Switch between profiles from the top bar.</p>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <div role="radiogroup" aria-label="Account type" className="grid gap-2">
            {PROFILE_TYPES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={type === t.id} onClick={() => setType(t.id)}
                className={cn('w-full text-left px-3.5 py-2.5 rounded-lg border-2 transition', type === t.id ? 'border-coral bg-coral-soft/40' : 'border-line hover:border-coral/50')}>
                <span className="flex items-center justify-between text-sm font-bold text-ink">{t.label}{type === t.id && <Check className="w-4 h-4 text-coral" />}</span>
                <span className="block text-xs text-ink-soft">{t.desc}</span>
              </button>
            ))}
          </div>
          <label className="block">
            <span className="block text-xs font-semibold text-ink-soft mb-1">{spec.nameLabel}</span>
            <input ref={nameRef} className={INPUT} value={name} onChange={(e) => setName(e.target.value)} maxLength={160} placeholder={spec.placeholder} />
          </label>
          <p role="note" className="text-xs rounded-lg bg-surface2 text-ink-soft px-3 py-2">
            {trial
              ? 'It comes with a 14-day free trial of Pro.'
              : 'It starts on the free Creative plan, for creating content. Your free trial was used by your first profile — upgrade this one in Billing for marketing.'}
          </p>
          {error && <div role="alert" className="text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add profile'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
