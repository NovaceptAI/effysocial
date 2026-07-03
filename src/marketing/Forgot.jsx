import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppAuth } from '../app/context/AppAuth';
import AuthScreen from './AuthScreen';

export default function Forgot() {
  const { forgotPassword } = useAppAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await forgotPassword(email);
    setDevLink(data?.dev_link || '');
    setSent(true);
  };

  return (
    <AuthScreen title="Reset your password">
      {sent ? (
        <>
          <p className="text-sm text-ink-soft mt-2">If an account exists for <strong>{email}</strong>, we've sent a reset link.</p>
          {devLink && <p className="text-xs text-ink-faint mt-3 break-all">Dev link: <a className="text-coral-ink" href={devLink}>{devLink}</a></p>}
          <Link to="/login" className="mt-5 inline-flex w-full justify-center rounded-lg border border-line font-bold py-3 hover:border-coral transition">Back to login</Link>
        </>
      ) : (
        <form onSubmit={submit}>
          <p className="text-sm text-ink-soft mt-1 mb-4">Enter your email and we'll send a reset link.</p>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
            className="w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none" />
          <button type="submit" className="mt-4 w-full rounded-lg bg-coral text-white font-bold py-3 hover:-translate-y-0.5 transition">Send reset link</button>
          <Link to="/login" className="mt-3 block text-center text-sm text-ink-soft">Back to login</Link>
        </form>
      )}
    </AuthScreen>
  );
}
