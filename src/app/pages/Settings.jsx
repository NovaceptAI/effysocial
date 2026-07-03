import React, { useState } from 'react';
import { Palette, Shield, Bell, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppAuth } from '../context/AppAuth';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

function Toggle({ on, onChange }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className={cn('w-11 h-6 rounded-full relative transition shrink-0', on ? 'bg-coral' : 'bg-line')}>
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-e1 transition', on && 'translate-x-5')} />
    </button>
  );
}

function Row({ title, desc, children }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-line last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink">{title}</div>
        {desc && <div className="text-xs text-ink-faint mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { org, workspace } = useWorkspace();
  const { user } = useAppAuth();
  const [notif, setNotif] = useState({ approvals: true, failures: true, leads: true, reportsEmail: false, whatsapp: false });
  const [density, setDensity] = useState('comfortable');

  return (
    <div>
      <PageHeader title="Settings" subtitle={`${org.name} · ${workspace?.name || ''}`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Bell className="w-4 h-4 text-coral-ink" /> Notifications</h3>
          <Row title="Approval requests" desc="When content needs your review."><Toggle on={notif.approvals} onChange={(v) => setNotif({ ...notif, approvals: v })} /></Row>
          <Row title="Publishing failures" desc="Failed posts and expired tokens."><Toggle on={notif.failures} onChange={(v) => setNotif({ ...notif, failures: v })} /></Row>
          <Row title="New leads" desc="Lead captured or needs follow-up."><Toggle on={notif.leads} onChange={(v) => setNotif({ ...notif, leads: v })} /></Row>
          <Row title="Email reports" desc="Monthly report ready notifications."><Toggle on={notif.reportsEmail} onChange={(v) => setNotif({ ...notif, reportsEmail: v })} /></Row>
          <Row title="WhatsApp alerts" desc="Critical alerts via WhatsApp."><span className="flex items-center gap-2"><Badge tone="new">Soon</Badge><Toggle on={notif.whatsapp} onChange={(v) => setNotif({ ...notif, whatsapp: v })} /></span></Row>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Palette className="w-4 h-4 text-coral-ink" /> Appearance & locale</h3>
            <Row title="Density" desc="Comfortable or compact layouts.">
              <div className="flex rounded-lg border border-line p-0.5">
                {['comfortable', 'compact'].map((d) => (
                  <button key={d} onClick={() => setDensity(d)}
                    className={cn('px-3 py-1 rounded-md text-xs font-bold capitalize', density === d ? 'bg-coral text-white' : 'text-ink-soft')}>{d}</button>
                ))}
              </div>
            </Row>
            <Row title="Time zone" desc="Used for scheduling and reports."><span className="text-sm text-ink-soft flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Asia/Kolkata (IST)</span></Row>
            <Row title="Currency"><span className="text-sm font-semibold">INR (₹)</span></Row>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-coral-ink" /> Security</h3>
            <Row title="Account" desc={user?.email}><Badge tone={user?.email_verified ? 'success' : 'warning'}>{user?.email_verified ? 'Verified' : 'Unverified'}</Badge></Row>
            <Row title="Two-factor authentication" desc="Extra login protection."><span className="flex items-center gap-2"><Badge tone="new">Soon</Badge><Button size="sm" variant="secondary" disabled>Enable</Button></span></Row>
            <Row title="Change password"><Button size="sm" variant="secondary" onClick={() => window.location.assign('/forgot')}>Send reset link</Button></Row>
          </Card>
        </div>
      </div>
    </div>
  );
}
