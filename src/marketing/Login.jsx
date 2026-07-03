import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppAuth } from '../app/context/AppAuth';
import FluidBackground from '../components/FluidBackground';

export default function Login() {
  const { login, register } = useAppAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const r = await login(email, password);
    setBusy(false);
    if (r.ok) navigate('/app');
    else setError(r.message);
  };

  const getStarted = async () => {
    setError('');
    if (!email || password.length < 6) { setError('Enter an email and a 6+ character password to sign up.'); return; }
    setBusy(true);
    const r = await register({ email, password, name: email.split('@')[0] });
    setBusy(false);
    if (r.ok) navigate('/onboarding');
    else setError(r.message);
  };

  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans grid lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-rail text-white overflow-hidden">
        <FluidBackground className="absolute inset-0 w-full h-full opacity-40" />
        <Link to="/" className="relative flex items-center gap-2.5 font-extrabold text-lg">
          <span className="grid place-items-center w-8 h-8 rounded-[9px] bg-coral text-white">✦</span> EffySocial
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight max-w-sm">Plan, create, publish, advertise and convert — in one place.</h2>
          <p className="mt-3 text-white/70 max-w-sm">Your AI-powered social growth operating system.</p>
        </div>
        <span className="relative text-sm text-white/50">Powered by EffyBiz</span>
      </div>

      {/* form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-extrabold text-lg mb-8">
            <span className="grid place-items-center w-8 h-8 rounded-[9px] bg-coral text-white">✦</span> EffySocial
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="text-ink-soft text-sm mt-1 mb-7">Log in to continue to your workspace.</p>

          {error && <div className="mb-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-ink-soft">Password</label>
                <Link to="/forgot" className="text-xs font-semibold text-coral-ink">Forgot password?</Link>
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none" />
            </div>
            <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-lg bg-coral text-white font-bold py-3 shadow-[0_8px_20px_rgba(232,74,51,0.24)] hover:-translate-y-0.5 transition disabled:opacity-60">
              {busy ? 'Please wait…' : <>Log in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-xs text-ink-faint">
            <span className="flex-1 h-px bg-line" /> or <span className="flex-1 h-px bg-line" />
          </div>
          <button type="button" onClick={() => setError('Google sign-in is coming soon — use email and password for now.')} className="w-full rounded-lg border border-line bg-surface font-semibold py-3 text-sm hover:border-coral transition">
            Continue with Google
          </button>

          <p className="text-center text-sm text-ink-soft mt-6">
            New to EffySocial? <button type="button" onClick={getStarted} className="text-coral-ink font-bold">Get started free</button>
          </p>
          <p className="text-center text-xs text-ink-faint mt-3">Demo login: demo@effybiz.in / effysocial</p>
        </div>
      </div>
    </div>
  );
}
