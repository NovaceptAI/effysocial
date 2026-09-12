import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, MapPin, Clock, Globe, Phone, Pencil, Loader2, Plug, BadgeCheck, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const INPUT = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm';
const DAYS = [
  ['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'],
  ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday'],
];
const DEFAULT_HOURS = Object.fromEntries(DAYS.map(([d]) => [d, d === 'sun' ? { closed: true } : { open: '09:00', close: '18:00' }]));

const STATUS = {
  created: { tone: 'default', label: 'Created — not verified' },
  pending_verification: { tone: 'warning', label: 'Pending verification' },
  verified: { tone: 'success', label: 'Verified' },
};

const STEPS = ['Business details', 'Contact & location', 'Opening hours', 'Review & create'];

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-ink-soft">{label}{required && <span className="text-error"> *</span>}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function GoogleBusiness() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['gbp', workspace?.id],
    queryFn: () => effyApi.getGbpProfile(workspace.id),
    enabled: !!workspace,
  });
  const [editing, setEditing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [note, setNote] = useState('');

  const profile = data?.profile;
  const mode = data?.mode || 'mock';

  const verify = async () => {
    setVerifying(true);
    try {
      const r = await effyApi.verifyGbpProfile(workspace.id);
      setNote(r.note || '');
      qc.invalidateQueries({ queryKey: ['gbp', workspace?.id] });
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading) {
    return <Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</Card>;
  }

  return (
    <div>
      <PageHeader
        title="Google Business Profile"
        subtitle={profile ? 'Manage your business presence on Google Search & Maps' : 'Create your business presence on Google Search & Maps'}
        actions={profile && !editing && <Button variant="secondary" onClick={() => setEditing(true)}><Pencil className="w-3.5 h-3.5" /> Edit profile</Button>}
      />

      {mode === 'mock' && (
        <Card className="p-3.5 mb-5 flex items-center gap-2.5 bg-warning-soft border-warning/20">
          <Plug className="w-4 h-4 text-warning shrink-0" />
          <span className="text-sm text-ink-soft">
            <strong>Demo mode</strong> — the profile is saved to your workspace and will sync to Google automatically once the{' '}
            <Link to="/app/integrations" className="underline font-bold">Google Business integration</Link> is connected. The flow stays exactly the same.
          </span>
        </Card>
      )}
      {note && (
        <Card className="p-3.5 mb-5 flex items-center gap-2.5 bg-success-soft border-success/20">
          <Check className="w-4 h-4 text-success" /><span className="text-sm text-ink-soft">{note}</span>
        </Card>
      )}

      {profile && !editing ? (
        <ProfileSummary profile={profile} mode={mode} onVerify={verify} verifying={verifying} />
      ) : (
        <Wizard
          workspace={workspace}
          initial={profile}
          categories={data?.categories || []}
          onDone={() => { setEditing(false); qc.invalidateQueries({ queryKey: ['gbp', workspace?.id] }); }}
          onCancel={profile ? () => setEditing(false) : null}
        />
      )}
    </div>
  );
}

function ProfileSummary({ profile, mode, onVerify, verifying }) {
  const s = STATUS[profile.status] || STATUS.created;
  const a = profile.address || {};
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-surface2 text-ink-soft"><Building2 className="w-6 h-6" /></span>
            <div>
              <h2 className="text-lg font-extrabold text-ink">{profile.name}</h2>
              <div className="text-sm text-ink-faint">{profile.category}</div>
            </div>
          </div>
          <Badge tone={s.tone}>{s.label}</Badge>
        </div>
        {profile.description && <p className="text-sm text-ink-soft mb-4">{profile.description}</p>}
        <div className="space-y-2 text-sm text-ink-soft">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-ink-faint" /> {[a.line1, a.city, a.region, a.postal, a.country].filter(Boolean).join(', ')}</div>
          {profile.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-ink-faint" /> {profile.phone}</div>}
          {profile.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-ink-faint" /> {profile.website}</div>}
        </div>
        <div className="mt-5 pt-4 border-t border-line">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Opening hours</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            {DAYS.map(([d, label]) => {
              const h = (profile.hours || {})[d];
              return (
                <div key={d} className="flex justify-between">
                  <span className="text-ink-faint">{label}</span>
                  <span className="text-ink tabular-nums">{!h || h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h4 className="font-bold text-ink text-sm mb-2 flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-coral" /> Verification</h4>
          <p className="text-xs text-ink-faint mb-3">{profile.sync?.message || 'Verification makes the profile visible on Search & Maps.'}</p>
          {profile.status !== 'verified' ? (
            <Button size="sm" onClick={onVerify} disabled={verifying}>
              {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify business'}
            </Button>
          ) : (
            <Badge tone="success">Verified</Badge>
          )}
        </Card>
        {mode === 'mock' && (
          <Card className="p-5">
            <h4 className="font-bold text-ink text-sm mb-2 flex items-center gap-2"><Plug className="w-4 h-4 text-coral" /> Go live</h4>
            <p className="text-xs text-ink-faint mb-3">Connect the Google Business integration and this exact profile syncs to Google on the next save — nothing to re-enter.</p>
            <Link to="/app/integrations"><Button size="sm" variant="secondary">Open Integrations</Button></Link>
          </Card>
        )}
        {profile.sync?.state === 'error' && (
          <Card className="p-4 bg-error-soft border-error/20 text-sm text-ink-soft">{profile.sync.message}</Card>
        )}
      </div>
    </div>
  );
}

function Wizard({ workspace, initial, categories, onDone, onCancel }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    category: initial?.category || '',
    description: initial?.description || '',
    phone: initial?.phone || '',
    website: initial?.website || '',
    address: { line1: '', city: '', region: '', postal: '', country: 'IN', ...(initial?.address || {}) },
    hours: initial?.hours && Object.keys(initial.hours).length ? initial.hours : DEFAULT_HOURS,
  }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }));
  const setHours = (d, patch) => setForm((f) => ({ ...f, hours: { ...f.hours, [d]: { ...f.hours[d], ...patch } } }));

  const stepValid =
    step === 0 ? !!(form.name.trim() && form.category) :
    step === 1 ? !!(form.address.line1.trim() && form.address.city.trim()) : true;

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      await effyApi.saveGbpProfile({ workspace: workspace.id, ...form });
      onDone();
    } catch (e) {
      setErr(e.message || 'Could not save the profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="max-w-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className={cn('flex items-center gap-1.5 text-xs font-bold', i === step ? 'text-coral' : i < step ? 'text-success' : 'text-ink-faint')}>
              <span className={cn('grid place-items-center w-5 h-5 rounded-full border text-[10px]', i === step ? 'border-coral' : i < step ? 'border-success' : 'border-line')}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-line" />}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Field label="Business name" required>
            <input className={INPUT} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Effy Café" />
          </Field>
          <Field label="Business category" required>
            <select className={INPUT} value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Choose a category…</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Description">
            <textarea rows={3} className={INPUT} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="What does your business offer? Shown on your Google profile." />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone"><input className={INPUT} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 …" /></Field>
            <Field label="Website"><input className={INPUT} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" /></Field>
          </div>
          <Field label="Street address" required>
            <input className={INPUT} value={form.address.line1} onChange={(e) => setAddr('line1', e.target.value)} placeholder="Street and number" />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="City" required><input className={INPUT} value={form.address.city} onChange={(e) => setAddr('city', e.target.value)} /></Field>
            <Field label="State / region"><input className={INPUT} value={form.address.region} onChange={(e) => setAddr('region', e.target.value)} /></Field>
            <Field label="Postal code"><input className={INPUT} value={form.address.postal} onChange={(e) => setAddr('postal', e.target.value)} /></Field>
            <Field label="Country"><input className={INPUT} value={form.address.country} onChange={(e) => setAddr('country', e.target.value)} placeholder="IN" /></Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          {DAYS.map(([d, label]) => {
            const h = form.hours[d] || {};
            return (
              <div key={d} className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2 w-32 shrink-0">
                  <input type="checkbox" checked={!h.closed} onChange={(e) => setHours(d, e.target.checked ? { closed: false, open: h.open || '09:00', close: h.close || '18:00' } : { closed: true })} />
                  <span className="text-ink">{label}</span>
                </label>
                {h.closed ? (
                  <span className="text-ink-faint">Closed</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input type="time" className={cn(INPUT, 'w-32')} value={h.open || '09:00'} onChange={(e) => setHours(d, { open: e.target.value })} />
                    <span className="text-ink-faint">to</span>
                    <input type="time" className={cn(INPUT, 'w-32')} value={h.close || '18:00'} onChange={(e) => setHours(d, { close: e.target.value })} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 text-sm">
          <div className="rounded-lg border border-line bg-surface p-4 space-y-1.5">
            <div><span className="text-ink-faint">Name · </span><strong className="text-ink">{form.name}</strong></div>
            <div><span className="text-ink-faint">Category · </span><span className="text-ink">{form.category}</span></div>
            <div><span className="text-ink-faint">Address · </span><span className="text-ink">{[form.address.line1, form.address.city, form.address.region, form.address.postal, form.address.country].filter(Boolean).join(', ')}</span></div>
            {form.phone && <div><span className="text-ink-faint">Phone · </span><span className="text-ink">{form.phone}</span></div>}
            {form.website && <div><span className="text-ink-faint">Website · </span><span className="text-ink">{form.website}</span></div>}
          </div>
          <p className="text-xs text-ink-faint">You can edit everything later. When the Google Business integration is connected, saving pushes this profile straight to Google.</p>
        </div>
      )}

      {err && <div className="mt-4 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{err}</div>}
      <div className="mt-6 flex justify-between">
        <div>{onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}</div>
        <div className="flex gap-2">
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}><ArrowLeft className="w-3.5 h-3.5" /> Back</Button>}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!stepValid}>Next <ArrowRight className="w-3.5 h-3.5" /></Button>
          ) : (
            <Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : initial ? 'Save changes' : 'Create profile'}</Button>
          )}
        </div>
      </div>
    </Card>
  );
}
