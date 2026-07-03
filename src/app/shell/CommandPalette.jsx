import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { NAV_ITEMS } from '../nav';
import './command-palette.css';

export default function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
  const { workspaces, setWorkspaceId } = useWorkspace();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  if (!open) return null;
  const go = (to) => { navigate(to); setOpen(false); };

  return (
    <div className="cmdk-overlay" onClick={() => setOpen(false)}>
      <div className="cmdk-box" onClick={(e) => e.stopPropagation()}>
        <Command label="Command palette">
          <Command.Input autoFocus placeholder="Search pages, switch workspace, or run a command…" />
          <Command.List>
            <Command.Empty>No results.</Command.Empty>

            <Command.Group heading="Quick actions">
              <Command.Item onSelect={() => go('/app/studio')}>✨ Create a post</Command.Item>
              <Command.Item onSelect={() => go('/app/campaigns')}>📣 Create a campaign</Command.Item>
              <Command.Item onSelect={() => go('/app/calendar')}>📅 Open calendar</Command.Item>
              <Command.Item onSelect={() => go('/app/approvals')}>✅ Review approvals</Command.Item>
              <Command.Item onSelect={() => go('/app/integrations')}>🔌 Connect an account</Command.Item>
              <Command.Item onSelect={() => go('/app/reports')}>📊 Generate a report</Command.Item>
            </Command.Group>

            <Command.Group heading="Switch workspace">
              {workspaces.map((w) => (
                <Command.Item key={w.id} value={`workspace ${w.name}`} onSelect={() => { setWorkspaceId(w.id); setOpen(false); }}>
                  <span className="mr-2">{w.logo}</span> {w.name}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Go to">
              {NAV_ITEMS.map((i) => (
                <Command.Item key={i.to} value={`${i.group} ${i.label}`} onSelect={() => go(i.to)}>
                  {i.label} <span className="cmdk-hint">{i.group}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
