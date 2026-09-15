import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Copy, Check, X, Loader2, Mail, Trash2, RotateCw } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';

// Team (G23): real members from effy_memberships, invites with a role, role changes
// and removal. Owners and admins manage; everyone else sees who's on the team.
export const ROLE_HELP = {
  'Agency owner': 'Owns the organisation.',
  'Agency admin': 'Everything, including the team, clients and settings.',
  'Workspace admin': 'Everything, including the team and settings.',
  'Account manager': 'Runs campaigns, content and leads; can’t manage the team.',
  Copywriter: 'Creates and edits content.',
  'Client approver': 'Reviews and approves content; can’t create it.',
  'View-only': 'Sees everything, changes nothing.',
};

function rolesFor(org, roles, current) {
  const admin = org?.type === 'agency' ? 'Agency admin' : 'Workspace admin';
  const list = roles.filter((r) => !r.endsWith(' admin') || r === admin);
  return current && !list.includes(current) ? [current, ...list] : list;
}

function Dialog({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-label={title} className="max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-ink">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="bg-transparent text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </Card>
    </div>
  );
}

// The link to share, shown after an invite is created or resent.
function InviteLink({ result, onDone }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(result.link); setCopied(true); } catch { setCopied(false); }
  };
  return (
    <div>
      <p className="text-sm text-ink-soft mb-3">
        {result.emailSent
          ? <>We emailed an invite to <strong className="text-ink">{result.invite.email}</strong>. You can also share the link yourself.</>
          : <>The invite for <strong className="text-ink">{result.invite.email}</strong> is ready, but the email couldn’t be sent. Copy the link and send it to them (WhatsApp works).</>}
      </p>
      <div className="flex gap-2">
        <input readOnly value={result.link} aria-label="Invite link" onFocus={(e) => e.target.select()}
          className="flex-1 min-w-0 rounded-lg bg-surface2 px-3 py-2 text-xs text-ink" />
        <Button size="sm" variant="secondary" onClick={copy}>{copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}</Button>
      </div>
      <p className="text-xs text-ink-faint mt-2">The link works once and expires in 7 days.</p>
      <div className="flex justify-end mt-5"><Button onClick={onDone}>Done</Button></div>
    </div>
  );
}

function InviteDialog({ org, roles, onClose, onSent }) {
  const options = rolesFor(org, roles);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Copywriter');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const send = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await effyApi.inviteTeammate(email.trim(), role);
      setResult(r);
      onSent();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <Dialog title={result ? 'Invite ready' : 'Invite a teammate'} onClose={onClose}>
      {result ? <InviteLink result={result} onDone={onClose} /> : (
        <form onSubmit={send} className="space-y-4" noValidate>
          <label className="block">
            <span className="block text-xs font-semibold text-ink-soft mb-1">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus placeholder="name@company.com"
              className="w-full rounded-lg bg-surface2 px-3 py-2 text-sm text-ink" />
          </label>
          <fieldset>
            <legend className="text-xs font-semibold text-ink-soft mb-1">Role</legend>
            <div className="space-y-1.5">
              {options.map((r) => (
                <label key={r} className={`flex items-start gap-2.5 rounded-lg px-3 py-2 cursor-pointer ${role === r ? 'bg-coral-tint' : 'hover:bg-surface2'}`}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="mt-1" />
                  <span><span className="block text-sm font-semibold text-ink">{r}</span><span className="block text-xs text-ink-faint">{ROLE_HELP[r]}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && <p role="alert" className="text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy || !email.trim()}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send invite</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

export default function Team() {
  const { org, canManageWorkspaces: canManage, planInfo } = useWorkspace();
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['team-full'], queryFn: effyApi.getTeam });
  const [inviting, setInviting] = useState(false);
  const [linkResult, setLinkResult] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [busy, setBusy] = useState('');
  const [problem, setProblem] = useState('');

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['team-full'] });
    qc.invalidateQueries({ queryKey: ['team'] });
  };
  const act = async (key, fn) => {
    setBusy(key); setProblem('');
    try { const r = await fn(); refresh(); return r; } catch (e) { setProblem(e.message); return null; } finally { setBusy(''); }
  };

  const members = data?.members || [];
  const invites = data?.invites || [];
  const roles = data?.roles || [];
  const seats = planInfo?.limits?.seats;
  const seatsUsed = members.length + invites.filter((i) => i.status === 'pending').length;
  const seatsFull = data && seats != null && seatsUsed >= seats
    ? `${seats === 1 ? 'The only seat' : `All ${seats} seats`} on your ${planInfo.plan === 'Trial' ? 'trial' : `${planInfo.plan} plan`} ${seats === 1 ? 'is' : 'are'} taken by members and pending invites. Upgrade in Billing, or remove someone.`
    : null;

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle={`People with access to ${org?.name || 'your organisation'}`}
        actions={(
          <Button onClick={() => setInviting(true)} disabled={!canManage || !!seatsFull} title={canManage ? (seatsFull || undefined) : 'Only owners and admins can invite teammates.'}>
            <UserPlus className="w-4 h-4" /> Invite member
          </Button>
        )}
      />
      {problem && <p role="alert" className="mb-3 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{problem}</p>}
      {canManage && seatsFull && <p role="status" className="mb-3 text-sm rounded-lg bg-warning-soft text-warning px-3.5 py-2.5">{seatsFull}</p>}

      <Card className="overflow-x-auto">
        {isLoading ? (
          <p className="p-6 text-sm text-ink-soft">Loading members…</p>
        ) : isError ? (
          <p role="alert" className="p-6 text-sm text-error">{error.message}</p>
        ) : (
          <table className="w-full text-sm" aria-label="Members">
            <thead><tr className="text-left text-ink-faint border-b border-line">{['Member', 'Role', 'Status', 'Joined', ''].map((h, i) => <th key={h || i} className="font-semibold px-5 py-3">{h || <span className="sr-only">Actions</span>}</th>)}</tr></thead>
            <tbody>
              {members.map((m) => {
                const editable = canManage && !m.isOwner && !m.isYou;
                return (
                  <tr key={m.id} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-ink">{m.name || m.email.split('@')[0]}</span>
                      {m.isYou && <Badge className="ml-2">You</Badge>}
                      <span className="block text-xs text-ink-faint">{m.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {editable ? (
                        <select aria-label={`Role for ${m.email}`} value={m.role} disabled={busy === `role${m.id}`}
                          onChange={(e) => act(`role${m.id}`, () => effyApi.changeMemberRole(m.id, e.target.value))}
                          className="rounded-lg bg-surface2 px-2.5 py-1.5 text-sm text-ink">
                          {rolesFor(org, roles, m.role).map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : <span className="text-ink" title={ROLE_HELP[m.role]}>{m.role}{m.isOwner && m.role !== 'Agency owner' ? ' · owner' : ''}</span>}
                    </td>
                    <td className="px-5 py-3.5"><Badge tone={m.verified ? 'success' : 'warning'}>{m.verified ? 'verified' : 'unverified'}</Badge></td>
                    <td className="px-5 py-3.5 text-ink-faint tabular-nums">{m.joined}</td>
                    <td className="px-3 py-3.5 text-right">
                      {editable && (confirmRemove === m.id ? (
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span className="text-ink-soft">Remove?</span>
                          <Button size="sm" variant="secondary" onClick={() => act(`del${m.id}`, () => effyApi.removeMember(m.id)).then(() => setConfirmRemove(null))}>Remove</Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmRemove(null)}>Keep</Button>
                        </span>
                      ) : (
                        <button type="button" aria-label={`Remove ${m.email}`} onClick={() => setConfirmRemove(m.id)}
                          className="bg-transparent text-ink-faint hover:text-error"><Trash2 className="w-4 h-4" /></button>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {canManage && invites.length > 0 && (
        <section aria-label="Pending invites" className="mt-6">
          <h2 className="text-sm font-bold text-ink mb-2">Pending invites</h2>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {invites.map((i) => (
                  <tr key={i.id} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3">
                      <span className="font-semibold text-ink">{i.email}</span>
                      <span className="block text-xs text-ink-faint">{i.role}{i.invitedBy ? ` · invited by ${i.invitedBy}` : ''}</span>
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {i.status === 'expired'
                        ? <Badge tone="warning">expired</Badge>
                        : <span className="text-ink-faint">expires {new Date(i.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <Button size="sm" variant="secondary" disabled={!!busy} aria-label={`Resend invite to ${i.email}`}
                        onClick={async () => { const r = await act(`resend${i.id}`, () => effyApi.resendInvite(i.id)); if (r) setLinkResult(r); }}>
                        {busy === `resend${i.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />} Resend
                      </Button>
                      <Button size="sm" variant="ghost" disabled={!!busy} aria-label={`Cancel invite to ${i.email}`} className="ml-1"
                        onClick={() => act(`revoke${i.id}`, () => effyApi.revokeInvite(i.id))}>Cancel</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}

      {inviting && <InviteDialog org={org} roles={roles} onClose={() => setInviting(false)} onSent={refresh} />}
      {linkResult && <Dialog title="Invite resent" onClose={() => setLinkResult(null)}><InviteLink result={linkResult} onDone={() => setLinkResult(null)} /></Dialog>}
    </div>
  );
}
