import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button, Card } from '../../ui';

const INPUT = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink';

// Create or edit a workspace (G21). For an agency every workspace is a client, so
// the same form backs "New workspace", "+ Add client" and a client's Edit.
export default function WorkspaceDialog({ open, onClose, onSaved, workspace = null }) {
  const { org, user, refreshWorkspaces } = useWorkspace();
  const qc = useQueryClient();
  const editing = !!workspace;
  const client = org?.type === 'agency';
  const noun = client ? 'client' : 'workspace';
  const nameRef = useRef(null);

  const [form, setForm] = useState({ name: '', industry: '', location: '', managerId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: members = [] } = useQuery({ queryKey: ['team'], queryFn: effyApi.listTeam, enabled: open });

  useEffect(() => {
    if (!open) return;
    setForm(editing
      ? { name: workspace.name, industry: workspace.industry || '', location: workspace.location || '', managerId: workspace.managerId ?? '' }
      : { name: '', industry: '', location: '', managerId: user?.id ?? '' });
    setError('');
    setBusy(false);
    setTimeout(() => nameRef.current?.focus(), 0);
  }, [open, editing, workspace, user?.id]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError(`Give the ${noun} a name.`); return; }
    setBusy(true);
    setError('');
    const payload = {
      name: form.name.trim(), industry: form.industry.trim(), location: form.location.trim(),
      managerId: form.managerId === '' ? null : Number(form.managerId),
    };
    try {
      const saved = editing ? await effyApi.updateWorkspace(workspace.id, payload) : await effyApi.createWorkspace(payload);
      await refreshWorkspaces();
      qc.invalidateQueries({ queryKey: ['workspace-summary'] });
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const title = editing ? `Edit ${workspace.name}` : client ? 'Add a client' : 'New workspace';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-labelledby="workspace-dialog-title" className="max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="workspace-dialog-title" className="font-extrabold text-ink">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <label className="block">
            <span className="block text-xs font-semibold text-ink-soft mb-1">{client ? 'Client name' : 'Workspace name'}</span>
            <input ref={nameRef} className={INPUT} value={form.name} onChange={set('name')} maxLength={160}
              placeholder={client ? 'e.g. Sunrise Motors' : 'e.g. Rao Dental Mumbai'} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold text-ink-soft mb-1">Industry</span>
              <input className={INPUT} value={form.industry} onChange={set('industry')} maxLength={80} placeholder="e.g. Automotive" />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-ink-soft mb-1">Location</span>
              <input className={INPUT} value={form.location} onChange={set('location')} maxLength={80} placeholder="e.g. Pune" />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-semibold text-ink-soft mb-1">Manager</span>
            <select className={INPUT} value={form.managerId} onChange={set('managerId')}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.userId} value={m.userId}>{m.name || m.email}</option>)}
            </select>
          </label>
          {error && <div role="alert" className="text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{error}</div>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : client ? 'Add client' : 'Create workspace'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
