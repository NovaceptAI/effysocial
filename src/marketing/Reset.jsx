import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAppAuth } from '../app/context/AppAuth';
import AuthScreen from './AuthScreen';

export default function Reset() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAppAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const { ok, data } = await resetPassword(params.get('token'), password);
    if (ok) setDone(true);
    else setError(data?.message || 'Reset failed.');
  };

  return (
    <AuthScreen title="Set a new password">
      {done ? (
        <>
          <p className="text-sm text-success font-semibold mt-2">Password updated.</p>
          <button onClick={() => navigate('/login')} className="mt-5 w-full rounded-lg bg-coral text-white font-bold py-3 hover:-translate-y-0.5 transition">Log in</button>
        </>
      ) : (
        <form onSubmit={submit}>
          {error && <div className="mt-2 mb-3 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}
          <p className="text-sm text-ink-soft mt-1 mb-4">Choose a new password for your account.</p>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (6+ chars)"
            className="w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none" />
          <button type="submit" className="mt-4 w-full rounded-lg bg-coral text-white font-bold py-3 hover:-translate-y-0.5 transition">Update password</button>
          <Link to="/login" className="mt-3 block text-center text-sm text-ink-soft">Back to login</Link>
        </form>
      )}
    </AuthScreen>
  );
}
