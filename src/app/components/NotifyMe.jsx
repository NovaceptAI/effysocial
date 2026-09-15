import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Loader2 } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Button } from '../../ui';

// “Notify me when ready” for a feature that isn't built yet (G49). The ask is recorded
// once per person (engine interest.py) and platform admins see the list.
export default function NotifyMe({ feature, size = 'sm', variant = 'secondary' }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['interest'], queryFn: effyApi.myInterest, staleTime: 5 * 60_000 });
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const asked = !!data?.includes(feature);

  const ask = async () => {
    setBusy(true); setError('');
    try {
      const r = await effyApi.registerInterest(feature);
      setConfirmation(`You’re on the list. We’ll email ${r.email} when ${r.label} is ready.`);
      qc.setQueryData(['interest'], (old = []) => [...new Set([...old, feature])]);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  return (
    <span className="inline-flex flex-col items-start gap-1.5">
      {asked ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success"><Check className="w-3.5 h-3.5" /> We’ll let you know</span>
      ) : (
        <Button size={size} variant={variant} onClick={ask} disabled={busy || !data}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />} Notify me when ready
        </Button>
      )}
      {confirmation && <span role="status" className="text-xs text-ink-soft">{confirmation}</span>}
      {error && <span role="alert" className="text-xs text-error">{error}</span>}
    </span>
  );
}
