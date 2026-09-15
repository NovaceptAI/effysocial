import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Palette, Shield, Bell, Sun, Moon, User, Building2, X, Copy, Check, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppAuth } from '../context/AppAuth';
import { useTheme } from '../context/ThemeContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

// Settings (G44): your profile and preferences, the organisation's time zone and
// currency, two-factor sign-in with an authenticator app, and a password reset link.
const NOTIFICATIONS = [
  ['approvals', 'Approval requests', 'When content needs your review.'],
  ['failures', 'Publishing failures', 'Failed posts and expired connections.'],
  ['leads', 'New leads', 'A lead is captured or needs a follow-up.'],
  ['reportsEmail', 'Email reports', 'When a monthly report is ready.'],
];
const TZ_LABELS = { 'Asia/Kolkata': 'Asia/Kolkata (IST)' };
const CURRENCY_LABELS = { INR: 'INR (₹)', USD: 'USD ($)', GBP: 'GBP (£)', EUR: 'EUR (€)' };
const field = 'rounded-lg bg-surface2 px-3 py-2 text-sm text-ink';

function Toggle({ on, onChange, label, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={cn('w-11 h-6 rounded-full relative transition shrink-0 disabled:opacity-50', on ? 'bg-coral' : 'bg-line')}>
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-e1 transition', on && 'translate-x-5')} />
    </button>
  );
}

function Row({ title, desc, children }) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3.5 border-b border-line last:border-0">
      <div className="flex-1 min-w-[160px]">
        <div className="text-sm font-semibold text-ink">{title}</div>
        {desc && <div className="text-xs text-ink-faint mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Dialog({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-label={title} className="max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-ink">{title}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="bg-transparent text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </Card>
    </div>
  );
}

function RecoveryCodes({ codes, onDone }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-sm text-ink-soft mb-3">Save these recovery codes somewhere safe. Each one signs you in once if you lose your phone. They won’t be shown again.</p>
      <ul aria-label="Recovery codes" className="grid grid-cols-2 gap-2 font-mono text-sm mb-3">
        {codes.map((c) => <li key={c} className="rounded-lg bg-surface2 px-3 py-2 text-center text-ink">{c}</li>)}
      </ul>
      <div className="flex justify-between gap-2">
        <Button variant="secondary" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(codes.join('\n')); setCopied(true); } catch { setCopied(false); } }}>
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy codes</>}
        </Button>
        <Button size="sm" onClick={onDone}>I’ve saved them</Button>
      </div>
    </div>
  );
}

function EnableTwoFactor({ onClose, onChanged }) {
  const [step, setStep] = useState('password'); // password | scan | codes
  const [password, setPassword] = useState('');
  const [setup, setSetup] = useState(null);
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (setup) QRCode.toString(setup.otpauthUrl, { type: 'svg', margin: 1, width: 180 }).then(setQr).catch(() => setQr(''));
  }, [setup]);

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(e.message); }
    setBusy(false);
  };

  return (
    <Dialog title="Turn on two-factor sign-in" onClose={onClose}>
      {step === 'password' && (
        <form onSubmit={(e) => { e.preventDefault(); run(async () => { setSetup(await effyApi.twoFactorSetup(password)); setStep('scan'); }); }} className="space-y-4">
          <p className="text-sm text-ink-soft">Signing in will ask for a code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password or Authy) as well as your password.</p>
          <label className="block">
            <span className="block text-xs font-semibold text-ink-soft mb-1">Your password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus autoComplete="current-password" className={`${field} w-full`} />
          </label>
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
          <div className="flex justify-end"><Button type="submit" disabled={busy || !password}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Continue</Button></div>
        </form>
      )}
      {step === 'scan' && setup && (
        <form onSubmit={(e) => { e.preventDefault(); run(async () => { const r = await effyApi.twoFactorEnable(code); setCodes(r.recoveryCodes); setStep('codes'); onChanged(); }); }} className="space-y-4">
          <p className="text-sm text-ink-soft">Scan this with your authenticator app, then enter the 6-digit code it shows.</p>
          {qr
            ? <div role="img" aria-label="QR code for your authenticator app" className="mx-auto w-[180px] rounded-lg bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} />
            : <p className="text-xs text-ink-faint">Preparing the QR code…</p>}
          <details className="text-xs text-ink-soft">
            <summary className="cursor-pointer font-semibold">Can’t scan? Enter this key instead</summary>
            <code aria-label="Setup key" className="block mt-2 rounded-lg bg-surface2 px-3 py-2 font-mono text-sm text-ink break-all">{setup.secret.match(/.{1,4}/g).join(' ')}</code>
          </details>
          <label className="block">
            <span className="block text-xs font-semibold text-ink-soft mb-1">Code from the app</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" className={`${field} w-full tracking-widest`} />
          </label>
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
          <div className="flex justify-end"><Button type="submit" disabled={busy || code.replace(/\D/g, '').length !== 6}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Turn on</Button></div>
        </form>
      )}
      {step === 'codes' && <RecoveryCodes codes={codes} onDone={onClose} />}
    </Dialog>
  );
}

function ConfirmWithCode({ title, intro, needsPassword, action, onClose, onDone }) {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [codes, setCodes] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await action({ password, code });
      if (r.recoveryCodes) setCodes(r.recoveryCodes); else { onDone(); onClose(); }
    } catch (err) { setError(err.message); }
    setBusy(false);
  };
  return (
    <Dialog title={title} onClose={onClose}>
      {codes ? <RecoveryCodes codes={codes} onDone={() => { onDone(); onClose(); }} /> : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-ink-soft">{intro}</p>
          {needsPassword && (
            <label className="block">
              <span className="block text-xs font-semibold text-ink-soft mb-1">Your password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={`${field} w-full`} />
            </label>
          )}
          <label className="block">
            <span className="block text-xs font-semibold text-ink-soft mb-1">Authenticator or recovery code</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" className={`${field} w-full tracking-widest`} />
          </label>
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
          <div className="flex justify-end"><Button type="submit" disabled={busy || !code.trim() || (needsPassword && !password)}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Confirm</Button></div>
        </form>
      )}
    </Dialog>
  );
}

export default function Settings() {
  const { org, workspace, canManageWorkspaces } = useWorkspace();
  const { user, refresh } = useAppAuth();
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();
  const prefs = user?.preferences || { notifications: {}, density: 'comfortable' };

  const [name, setName] = useState(user?.name || '');
  const [notice, setNotice] = useState(null); // { ok, text }
  const [dialog, setDialog] = useState(null); // enable | disable | codes
  const [resetNote, setResetNote] = useState('');
  const [busy, setBusy] = useState('');

  const { data: twoFactor } = useQuery({ queryKey: ['two-factor'], queryFn: effyApi.twoFactorStatus });
  const { data: orgSettings } = useQuery({ queryKey: ['onboarding'], queryFn: effyApi.getOnboarding });
  const details = orgSettings?.onboarding?.details || {};

  const act = async (key, fn, done) => {
    setBusy(key); setNotice(null);
    try { await fn(); await refresh(); if (done) setNotice({ ok: true, text: done }); } catch (e) { setNotice({ ok: false, text: e.message }); }
    setBusy('');
  };
  const savePrefs = (patch) => act('prefs', () => effyApi.savePreferences(patch));
  const twoFactorChanged = () => { qc.invalidateQueries({ queryKey: ['two-factor'] }); refresh(); };

  return (
    <div>
      <PageHeader title="Settings" subtitle={`${org.name} · ${workspace?.name || ''}`} />
      {notice && <p role={notice.ok ? 'status' : 'alert'} className={cn('mb-4 text-sm rounded-lg px-3.5 py-2.5', notice.ok ? 'bg-success-soft text-success' : 'bg-error-soft text-error')}>{notice.text}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="p-5">
            <section aria-label="Profile">
              <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><User className="w-4 h-4 text-coral-ink" /> Profile</h3>
              <Row title="Name">
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); act('name', () => effyApi.updateMe({ name }), 'Name saved.'); }}>
                  <input aria-label="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={field} />
                  <Button size="sm" type="submit" disabled={busy === 'name' || !name.trim() || name.trim() === user?.name}>Save</Button>
                </form>
              </Row>
              <Row title="Email" desc="Used to sign in."><span className="text-sm text-ink-soft">{user?.email}</span></Row>
            </section>
          </Card>

          <Card className="p-5">
            <section aria-label="Notifications">
              <h3 className="font-bold text-ink mb-1 flex items-center gap-2"><Bell className="w-4 h-4 text-coral-ink" /> Notifications</h3>
              <p className="text-xs text-ink-faint mb-1">Saved to your account. Email alerts follow these choices as they go live.</p>
              {NOTIFICATIONS.map(([key, title, desc]) => (
                <Row key={key} title={title} desc={desc}>
                  <Toggle label={title} on={!!prefs.notifications[key]} disabled={busy === 'prefs'} onChange={(v) => savePrefs({ notifications: { [key]: v } })} />
                </Row>
              ))}
              <Row title="WhatsApp alerts" desc="Critical alerts on WhatsApp."><Badge tone="new">Coming soon</Badge></Row>
            </section>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <section aria-label="Appearance">
              <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Palette className="w-4 h-4 text-coral-ink" /> Appearance</h3>
              <Row title="Theme" desc="Dark or light. Saved in this browser.">
                <div className="flex rounded-lg border border-line p-0.5">
                  {[['dark', Moon], ['light', Sun]].map(([t, Icon]) => (
                    <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}
                      className={cn('flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold capitalize', theme === t ? 'bg-coral text-white' : 'text-ink-soft bg-transparent')}>
                      <Icon className="w-3.5 h-3.5" /> {t}
                    </button>
                  ))}
                </div>
              </Row>
              <Row title="Density" desc="Compact fits more on screen. Saved to your account.">
                <div className="flex rounded-lg border border-line p-0.5">
                  {['comfortable', 'compact'].map((d) => (
                    <button key={d} type="button" aria-pressed={prefs.density === d} disabled={busy === 'prefs'} onClick={() => savePrefs({ density: d })}
                      className={cn('px-3 py-1 rounded-md text-xs font-bold capitalize', prefs.density === d ? 'bg-coral text-white' : 'text-ink-soft bg-transparent')}>{d}</button>
                  ))}
                </div>
              </Row>
            </section>
          </Card>

          <Card className="p-5">
            <section aria-label="Organisation">
              <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Building2 className="w-4 h-4 text-coral-ink" /> Organisation</h3>
              {orgSettings ? (
                <>
                  <Row title="Time zone" desc={canManageWorkspaces ? 'Your organisation’s time zone.' : 'Set by your organisation’s admins.'}>
                    <select aria-label="Time zone" value={details.timezone || 'Asia/Kolkata'} disabled={!canManageWorkspaces || busy === 'org'} className={field}
                      onChange={(e) => act('org', async () => { await effyApi.saveOnboarding({ details: { timezone: e.target.value } }); qc.invalidateQueries({ queryKey: ['onboarding'] }); }, 'Time zone saved.')}>
                      {orgSettings.options.timezones.map((t) => <option key={t} value={t}>{TZ_LABELS[t] || t}</option>)}
                    </select>
                  </Row>
                  <Row title="Currency" desc="Used when EffySocial writes plans and budgets for you.">
                    <select aria-label="Currency" value={details.currency || 'INR'} disabled={!canManageWorkspaces || busy === 'org'} className={field}
                      onChange={(e) => act('org', async () => { await effyApi.saveOnboarding({ details: { currency: e.target.value } }); qc.invalidateQueries({ queryKey: ['onboarding'] }); }, 'Currency saved.')}>
                      {orgSettings.options.currencies.map((c) => <option key={c} value={c}>{CURRENCY_LABELS[c] || c}</option>)}
                    </select>
                  </Row>
                </>
              ) : <p className="text-sm text-ink-faint py-2">Loading…</p>}
            </section>
          </Card>

          <Card className="p-5">
            <section aria-label="Security">
              <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-coral-ink" /> Security</h3>
              <Row title="Email" desc={user?.email}><Badge tone={user?.email_verified ? 'success' : 'warning'}>{user?.email_verified ? 'Verified' : 'Unverified'}</Badge></Row>
              <Row title="Two-factor sign-in"
                desc={twoFactor?.enabled ? `On · ${twoFactor.recoveryCodesLeft} recovery code${twoFactor.recoveryCodesLeft === 1 ? '' : 's'} left` : 'Ask for a code from an authenticator app when signing in.'}>
                {twoFactor?.enabled ? (
                  <span className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setDialog('codes')}>New recovery codes</Button>
                    <Button size="sm" variant="secondary" onClick={() => setDialog('disable')}>Turn off</Button>
                  </span>
                ) : <Button size="sm" onClick={() => setDialog('enable')} disabled={!twoFactor}>Turn on</Button>}
              </Row>
              <Row title="Password" desc={resetNote || 'We’ll email you a link to choose a new password.'}>
                <Button size="sm" variant="secondary" disabled={busy === 'reset'}
                  onClick={async () => {
                    setBusy('reset'); setResetNote('');
                    try {
                      const r = await effyApi.sendMyResetLink();
                      setResetNote(r.emailSent ? `Reset link sent to ${r.email}.` : 'The email couldn’t be sent right now. Try again later.');
                    } catch (e) { setResetNote(e.message); }
                    setBusy('');
                  }}>Send reset link</Button>
              </Row>
            </section>
          </Card>
        </div>
      </div>

      {dialog === 'enable' && <EnableTwoFactor onClose={() => setDialog(null)} onChanged={twoFactorChanged} />}
      {dialog === 'disable' && (
        <ConfirmWithCode title="Turn off two-factor sign-in" needsPassword onClose={() => setDialog(null)} onDone={twoFactorChanged}
          intro="Signing in will only need your password again."
          action={({ password, code }) => effyApi.twoFactorDisable(password, code)} />
      )}
      {dialog === 'codes' && (
        <ConfirmWithCode title="New recovery codes" onClose={() => setDialog(null)} onDone={twoFactorChanged}
          intro="Your current recovery codes will stop working."
          action={({ code }) => effyApi.twoFactorRecoveryCodes(code)} />
      )}
    </div>
  );
}
