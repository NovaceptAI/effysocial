import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import { useAppAuth } from '../app/context/AppAuth';
import { effyApi } from '../app/api/effyApi';

// Accept an invite to join an organisation (G23). New people create their account
// here; people with an account sign in first and come back to this page.
const input = 'w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none';
const primary = 'w-full flex items-center justify-center gap-2 rounded-lg bg-coral text-white font-bold py-3 disabled:opacity-60';

export default function Join() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { user, loading, refresh, logout } = useAppAuth();
  const [invite, setInvite] = useState(null);
  const [problem, setProblem] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setProblem('This invite link is incomplete. Open the link from your invite again.'); return; }
    effyApi.getInvite(token).then(setInvite).catch((e) => setProblem(e.message));
  }, [token]);

  const here = `/join?token=${encodeURIComponent(token)}`;

  const accept = async (e) => {
    e?.preventDefault();
    setBusy(true); setError('');
    try {
      await effyApi.acceptInvite(token, user ? {} : { name: name.trim(), password });
      await refresh();
      navigate('/app');
    } catch (err) {
      if (err.data?.needsSignIn) {
        navigate(`/login?next=${encodeURIComponent(here)}&email=${encodeURIComponent(invite.email)}`);
        return;
      }
      setError(err.message);
      setBusy(false);
    }
  };

  let body;
  if (problem) {
    body = (
      <>
        <h1 className="text-2xl font-extrabold tracking-tight">This invite can’t be used</h1>
        <p role="alert" className="text-ink-soft mt-2 mb-6">{problem}</p>
        <Link to="/login" className="text-sm font-bold text-coral-ink">Go to sign in</Link>
      </>
    );
  } else if (!invite || loading) {
    body = <Loader2 className="w-5 h-5 animate-spin text-ink-soft mx-auto" aria-label="Loading invite" />;
  } else {
    const heading = (
      <>
        <span className="grid place-items-center w-12 h-12 rounded-2xl bg-coral-tint text-coral-ink mb-4 mx-auto"><Users className="w-6 h-6" /></span>
        <h1 className="text-2xl font-extrabold tracking-tight">Join {invite.org} on EffySocial</h1>
        <p className="text-ink-soft mt-2 mb-6">
          {invite.invitedBy ? `${invite.invitedBy} invited you` : 'You’re invited'} as <strong className="text-ink">{invite.role}</strong>.
        </p>
      </>
    );
    if (user && user.email.toLowerCase() === invite.email) {
      body = (
        <>
          {heading}
          <button type="button" onClick={accept} disabled={busy} className={primary}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Join {invite.org}
          </button>
        </>
      );
    } else if (user) {
      body = (
        <>
          {heading}
          <p role="alert" className="text-sm rounded-lg bg-warning-soft text-warning px-3.5 py-2.5 mb-4">
            You’re signed in as {user.email}, but this invite is for {invite.email}.
          </p>
          <button type="button" onClick={() => logout()} className={primary}>Sign out and continue</button>
        </>
      );
    } else if (invite.hasAccount) {
      body = (
        <>
          {heading}
          <button type="button" className={primary}
            onClick={() => navigate(`/login?next=${encodeURIComponent(here)}&email=${encodeURIComponent(invite.email)}`)}>
            Sign in as {invite.email} to join
          </button>
        </>
      );
    } else {
      body = (
        <>
          {heading}
          <form onSubmit={accept} className="space-y-4 text-left">
            <label className="block">
              <span className="block text-sm font-semibold text-ink-soft mb-1.5">Email</span>
              <input className={input} value={invite.email} readOnly />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-ink-soft mb-1.5">Your name</span>
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-ink-soft mb-1.5">Choose a password</span>
              <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" />
            </label>
            {error && <p role="alert" className="text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</p>}
            <button type="submit" disabled={busy || !name.trim() || password.length < 8} className={primary}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create account and join
            </button>
            <p className="text-center text-xs text-ink-faint">
              By joining you agree to the <Link to="/terms" className="font-semibold text-coral-ink">Terms of Service</Link> and
              the <Link to="/privacy" className="font-semibold text-coral-ink">Privacy Policy</Link>.
            </p>
          </form>
        </>
      );
    }
    if (error && (user || invite.hasAccount)) {
      body = <>{body}<p role="alert" className="mt-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</p></>;
    }
  }

  return (
    <div className="onboarding-page min-h-dvh bg-canvas text-ink font-sans grid place-items-center p-6">
      <div className="w-full max-w-sm text-center">
        <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-lg mb-8">
          <span className="grid place-items-center w-8 h-8 rounded-[9px] bg-coral text-white">✦</span> EffySocial
        </Link>
        {body}
      </div>
    </div>
  );
}
