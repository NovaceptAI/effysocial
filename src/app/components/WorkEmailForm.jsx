import React, { useState } from 'react';
import { Check, Mail } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Button } from '../../ui';

// A Business profile proves a work email — an address at its own domain — with a
// six-digit code sent to it (engine profiles.py). Until then the app works, with a banner.
export default function WorkEmailForm({ workEmail, canManage, onChanged }) {
  const [email, setEmail] = useState(workEmail?.pending || workEmail?.email || '');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState(workEmail?.pending || '');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const field = 'rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink min-w-0';

  if (workEmail?.verified) {
    return (
      <p className="flex items-center gap-2 text-sm text-success">
        <Check className="w-4 h-4" /> {workEmail.email} — verified
      </p>
    );
  }
  if (!canManage) {
    return <p className="text-sm text-ink-soft">Not verified yet. An owner or admin can verify it.</p>;
  }

  const run = async (key, fn) => {
    setBusy(key); setMsg(null);
    try { await fn(); } catch (e) { setMsg({ ok: false, text: e.message }); } finally { setBusy(''); }
  };
  const send = () => run('send', async () => {
    const r = await effyApi.sendWorkEmailCode(email.trim());
    if (r.verified) { setMsg({ ok: true, text: 'Verified — it’s your own sign-in email.' }); onChanged?.(); return; }
    setSentTo(r.email); setCode('');
    setMsg({ ok: true, text: r.sent ? `We sent a code to ${r.email}.` : `The code couldn’t be emailed to ${r.email} yet. Try again later.` });
  });
  const verify = () => run('verify', async () => {
    await effyApi.verifyWorkEmail(code);
    setMsg({ ok: true, text: 'Work email verified.' });
    onChanged?.();
  });

  return (
    <div className="grid gap-2 w-full">
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input type="email" aria-label="Work email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254}
          placeholder="you@yourcompany.in" className={`${field} flex-1`} />
        <Button size="sm" variant="secondary" type="submit" disabled={busy === 'send' || !email.trim()}>
          <Mail className="w-3.5 h-3.5" /> {sentTo ? 'Send a new code' : 'Send code'}
        </Button>
      </form>
      {sentTo && (
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); verify(); }}>
          <input inputMode="numeric" autoComplete="one-time-code" aria-label="Code" value={code} maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="6-digit code" className={`${field} w-36 tracking-widest`} />
          <Button size="sm" type="submit" disabled={busy === 'verify' || code.length !== 6}>Verify</Button>
        </form>
      )}
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`text-xs ${msg.ok ? 'text-success' : 'text-error'}`}>{msg.text}</p>}
    </div>
  );
}
