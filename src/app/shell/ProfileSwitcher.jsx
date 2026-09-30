import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppAuth } from '../context/AppAuth';
import AddProfileDialog from '../components/AddProfileDialog';
import Dropdown from './Dropdown';

// The profile switcher (launch plan 6.15): every profile on this login — its own
// organisation, plan and billing — and "Add account type". Switching opens Home in the
// other profile; the app remounts for it (AppRoot), so nothing from this one lingers.
export default function ProfileSwitcher() {
  const { org, profiles } = useWorkspace();
  const { switchProfile } = useAppAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const current = profiles.find((p) => p.current) || { name: org?.name, label: org?.profile?.label };

  const choose = async (p) => {
    if (p.current) { setOpen(false); return; }
    setBusy(p.id); setError('');
    const r = await switchProfile(p.id, () => navigate('/app'));
    if (!r.ok) { setError(r.message); setBusy(null); }
  };

  return (
    <div className="relative min-w-0 max-w-[10rem] sm:max-w-xs">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={`Profile: ${current.name}. Switch profile`}
        className="flex items-center gap-2 max-w-full px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-surface2 transition text-left">
        <span className="min-w-0">
          <span className="block text-[0.62rem] font-bold uppercase tracking-wide text-ink-faint truncate">{current.label || 'Profile'}</span>
          <span className="block text-sm font-bold text-ink truncate">{current.name}</span>
        </span>
        <ChevronsUpDown className="w-4 h-4 text-ink-faint shrink-0" />
      </button>
      <Dropdown open={open} onClose={() => { setOpen(false); setError(''); }} className="left-0 w-72">
        <div className="px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint border-b border-line">Your profiles</div>
        <ul aria-label="Your profiles">
          {profiles.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => choose(p)} disabled={busy != null} aria-current={p.current ? 'true' : undefined}
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent hover:bg-surface2 transition text-left disabled:opacity-60">
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{p.name}</span>
                  <span className="block text-xs text-ink-faint truncate">{p.label} · {p.role} · {p.plan}</span>
                </span>
                {p.current && <Check className="w-4 h-4 text-coral shrink-0" aria-label="Current profile" />}
                {busy === p.id && <Loader2 className="w-4 h-4 animate-spin text-ink-faint shrink-0" aria-label="Switching" />}
              </button>
            </li>
          ))}
        </ul>
        {error && <p role="alert" className="px-3 py-2 text-xs text-error">{error}</p>}
        <button type="button" onClick={() => { setOpen(false); setAdding(true); }}
          className="w-full flex items-center gap-2 mt-1 px-3 py-2 border-t border-line text-sm font-semibold text-coral-ink bg-transparent hover:bg-surface2 transition">
          <Plus className="w-4 h-4" /> Add account type
        </button>
      </Dropdown>
      <AddProfileDialog open={adding} onClose={() => setAdding(false)} onCreated={() => navigate('/onboarding')} />
    </div>
  );
}
