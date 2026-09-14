import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Sparkles, Bell, ChevronRight, LogOut, AlertTriangle, Info, ShieldAlert, CheckSquare, Menu, Sun, Moon } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppAuth } from '../context/AppAuth';
import { useTheme } from '../context/ThemeContext';
import { usePosts } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import WorkspaceDialog from '../components/WorkspaceDialog';
import { cn } from '../../lib/cn';

function Dropdown({ open, onClose, children, className }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className={cn('absolute z-40 mt-2 rounded-lg border border-line bg-surface shadow-e3 py-1.5', className)}>
        {children}
      </div>
    </>
  );
}

const WORKSPACE_ITEM = 'Client workspace';
const SEV_ICON = { error: ShieldAlert, warning: AlertTriangle, info: Info };
const SEV_CLS = { error: 'text-error', warning: 'text-warning', info: 'text-info' };

// Notification centre (spec §18) — real signals: Effy recommendations for the
// active workspace + pending approvals count.
function Notifications() {
  const { workspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: recs = [] } = useQuery({
    queryKey: ['recs', workspace?.id],
    queryFn: () => effyApi.assistantRecommendations(workspace.id),
    enabled: !!workspace,
  });
  const { data: posts = [] } = usePosts(workspace);
  const approvals = posts.filter((p) => p.status === 'internal_review' || p.status === 'client_review').length;

  const items = [
    ...(approvals ? [{ id: 'approvals', severity: 'info', title: `${approvals} item(s) awaiting approval`, detected: 'Content is waiting for review.', route: '/app/approvals', icon: CheckSquare }] : []),
    ...recs,
  ];

  return (
    <div className="relative">
      <button title="Notifications" onClick={() => setOpen((v) => !v)} className="relative grid place-items-center w-9 h-9 rounded-lg bg-transparent hover:bg-surface2 transition text-ink-soft">
        <Bell className="w-[18px] h-[18px]" />
        {items.length > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-coral text-white text-[0.6rem] font-bold grid place-items-center">{items.length}</span>}
      </button>
      <Dropdown open={open} onClose={() => setOpen(false)} className="right-0 w-80">
        <div className="px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint border-b border-line">Notifications</div>
        {items.length ? items.map((n) => {
          const Icon = n.icon || SEV_ICON[n.severity] || Info;
          return (
            <button key={n.id} onClick={() => { setOpen(false); navigate(n.route); }}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 bg-transparent hover:bg-surface2 text-left border-b border-line/60 last:border-0">
              <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', SEV_CLS[n.severity] || 'text-info')} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink leading-snug">{n.title}</span>
                <span className="block text-xs text-ink-faint truncate">{n.detected}</span>
              </span>
            </button>
          );
        }) : <div className="px-3 py-6 text-center text-sm text-ink-faint">All caught up 🎉</div>}
      </Dropdown>
    </div>
  );
}

export default function TopBar({ onOpenPalette, onOpenAssistant, onOpenNav }) {
  const { user, org, workspaces, workspace, setWorkspaceId, canManageWorkspaces } = useWorkspace();
  const { user: authUser, logout } = useAppAuth();
  const { theme, toggleTheme } = useTheme();
  const [wsExpanded, setWsExpanded] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState(false);
  const otherWorkspaces = (workspaces || []).filter((w) => w.id !== workspace?.id);
  const navigate = useNavigate();

  const createItems = ['Campaign', 'Social post', 'Ad creative', 'Landing page', 'Form', 'Report', 'Automation rule', 'Client workspace'];

  return (
    <header className="h-16 shrink-0 sticky top-0 z-20 bg-canvas flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
      {/* Mobile menu (opens nav drawer) */}
      <button onClick={onOpenNav} className="md:hidden grid place-items-center w-9 h-9 rounded-lg bg-transparent hover:bg-surface2 transition text-ink-soft shrink-0" title="Menu">
        <Menu className="w-5 h-5" />
      </button>



      <div className="flex-1" />

      {/* Create */}
      <div className="relative">
        <button onClick={() => setCreateOpen((v) => !v)} className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg bg-coral-btn text-white text-sm font-bold shadow-coral hover:shadow-coral-lg hover:brightness-105 transition-all">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create</span>
        </button>
        <Dropdown open={createOpen} onClose={() => setCreateOpen(false)} className="right-0 w-52">
          {createItems.map((c) => (
            <button key={c} onClick={() => { setCreateOpen(false); if (c === WORKSPACE_ITEM && canManageWorkspaces) setNewWorkspace(true); }}
              disabled={c === WORKSPACE_ITEM && !canManageWorkspaces}
              title={c === WORKSPACE_ITEM && !canManageWorkspaces ? 'Only owners and admins can create workspaces.' : undefined}
              className="w-full text-left px-3 py-2 text-sm text-ink bg-transparent hover:bg-surface2 transition disabled:opacity-50">
              {c === WORKSPACE_ITEM && org?.type !== 'agency' ? 'Workspace' : c}
            </button>
          ))}
        </Dropdown>
      </div>

      <button title="Effy AI" onClick={onOpenAssistant} className="grid place-items-center w-9 h-9 rounded-lg bg-coral-soft text-coral-ink hover:bg-coral hover:text-white transition">
        <Sparkles className="w-[18px] h-[18px]" />
      </button>
      <button title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}
        className="grid place-items-center w-9 h-9 rounded-lg bg-transparent hover:bg-surface2 transition text-ink-soft">
        {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
      </button>
      <Notifications />
      <div className="relative">
        <button onClick={() => setProfileOpen((v) => !v)} title={user.name} className="grid place-items-center w-9 h-9 rounded-full bg-coral text-white text-xs font-bold shadow-coral">
          {user.avatar}
        </button>
        <Dropdown open={profileOpen} onClose={() => { setProfileOpen(false); setWsExpanded(false); }} className="right-0 w-64">
          <div className="px-3 py-2 border-b border-line">
            <div className="text-sm font-bold text-ink">{user.name}</div>
            <div className="text-xs text-ink-faint truncate">{authUser?.email || user.email}</div>
          </div>

          {/* Workspace — current shown; left chevron reveals other workspaces */}
          <div className="border-b border-line py-1">
            <button
              onClick={() => otherWorkspaces.length && setWsExpanded((v) => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-transparent hover:bg-surface2 transition text-left"
            >
              {otherWorkspaces.length > 0 && (
                <ChevronRight className={cn('w-4 h-4 text-ink-faint shrink-0 transition-transform', wsExpanded && 'rotate-90')} />
              )}
              <span className="grid place-items-center w-7 h-7 rounded-md text-base shrink-0" style={{ background: (workspace.accent || '#E5484D') + '22' }}>{workspace.logo}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[0.62rem] font-bold uppercase tracking-wide text-ink-faint">Workspace</span>
                <span className="block text-sm font-semibold text-ink truncate">{workspace.name}</span>
              </span>
            </button>
            {wsExpanded && otherWorkspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => { setWorkspaceId(w.id); setWsExpanded(false); setProfileOpen(false); }}
                className="w-full flex items-center gap-2 pl-9 pr-3 py-2 bg-transparent hover:bg-surface2 transition text-left"
              >
                <span className="grid place-items-center w-6 h-6 rounded-md text-sm shrink-0" style={{ background: (w.accent || '#E5484D') + '22' }}>{w.logo}</span>
                <span className="flex-1 text-sm text-ink truncate">{w.name}</span>
              </button>
            ))}
          </div>

          <button className="w-full text-left px-3 py-2 text-sm text-ink bg-transparent hover:bg-surface2">Profile &amp; settings</button>
          <button
            onClick={() => { setProfileOpen(false); logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-error bg-transparent hover:bg-error-soft"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </Dropdown>
      </div>
      <WorkspaceDialog open={newWorkspace} onClose={() => setNewWorkspace(false)}
        onSaved={(ws) => { setWorkspaceId(ws.id); navigate('/app'); }} />
    </header>
  );
}
