import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAppAuth } from '../app/context/AppAuth';
import AuthScreen from './AuthScreen';

export default function Verify() {
  const [params] = useSearchParams();
  const { verifyEmail, refresh, user } = useAppAuth();
  const [state, setState] = useState('verifying'); // verifying | ok | error

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setState('error'); return; }
    (async () => {
      const { ok } = await verifyEmail(token);
      if (ok) { await refresh(); setState('ok'); } else setState('error');
    })();
  }, []); // eslint-disable-line

  return (
    <AuthScreen title="Email verification">
      {state === 'verifying' && (
        <p className="flex items-center gap-2 text-ink-soft text-sm mt-2"><Loader2 className="w-4 h-4 animate-spin" /> Verifying your email…</p>
      )}
      {state === 'ok' && (
        <>
          <p className="flex items-center gap-2 text-success font-semibold mt-2"><CheckCircle2 className="w-5 h-5" /> Email verified!</p>
          <p className="text-sm text-ink-soft mt-2">Your account is all set.</p>
          <Link to={user ? '/app' : '/login'} className="mt-5 inline-flex w-full justify-center rounded-lg bg-coral text-white font-bold py-3 hover:-translate-y-0.5 transition">
            {user ? 'Go to dashboard' : 'Log in'}
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <p className="flex items-center gap-2 text-error font-semibold mt-2"><XCircle className="w-5 h-5" /> Link invalid or expired</p>
          <p className="text-sm text-ink-soft mt-2">Request a fresh verification email from inside the app.</p>
          <Link to="/login" className="mt-5 inline-flex w-full justify-center rounded-lg border border-line font-bold py-3 hover:border-coral transition">Back to login</Link>
        </>
      )}
    </AuthScreen>
  );
}
