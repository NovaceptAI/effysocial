import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Sparkles, Bell, HelpCircle, ChevronDown, Calendar, Check, LogOut, AlertTriangle, Info, ShieldAlert, CheckSquare, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppAuth } from '../context/AppAuth';
import { usePosts } from '../api/hooks';
import { effyApi } from '../api/effyApi';
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

const HEALTH_DOT = { good: 'bg-success', attention: 'bg-warning', poor: 'bg-error' };
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
      <button title="Notifications" onClick={() => setOpen((v) => !v)} className="relative grid place-items-center w-9 h-9 rounded-lg hover:bg-surface2 transition text-ink-soft">
        <Bell className="w-[18px] h-[18px]" />
        {items.length > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-coral text-white text-[0.6rem] font-bold grid place-items-center">{items.length}</span>}
      </button>
      <Dropdown open={open} onClose={() => setOpen(false)} className="right-0 w-80">
        <div className="px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint border-b border-line">Notifications</div>
        {items.length ? items.map((n) => {
          const Icon = n.icon || SEV_ICON[n.severity] || Info;
          return (
            <button key={n.id} onClick={() => { setOpen(false); navigate(n.route); }}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-surface2 text-left border-b border-line/60 last:border-0">
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

export default function TopBar({ onOpenPalette, onOpenAssistant, onOpenNav, onToggleRail, railHidden }) {
  const { org, user, workspaces, workspace, setWorkspaceId } = useWorkspace();
  const { user: authUser, logout } = useAppAuth();
  const [wsOpen, setWsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const createItems = ['Campaign', 'Social post', 'Ad creative', 'Landing page', 'Form', 'Report', 'Automation rule', 'Client workspace'];

  return (
    <header className="h-16 shrink-0 sticky top-0 z-20 bg-canvas/70 backdrop-blur-xl border-b border-hair flex items-center gap-2 sm:gap-3 px-3 sm:px-6">
      {/* Mobile menu (opens nav drawer) */}
      <button onClick={onOpenNav} className="md:hidden grid place-items-center w-9 h-9 rounded-lg hover:bg-surface2 transition text-ink-soft shrink-0" title="Menu">
        <Menu className="w-5 h-5" />
      </button>
      {/* Desktop: collapse / expand the nav rail. */}
      <button onClick={onToggleRail} className="hidden md:grid place-items-center w-9 h-9 rounded-lg hover:bg-surface2 transition text-ink-soft shrink-0" title={railHidden ? 'Expand menu' : 'Minimize menu'}>
        {railHidden ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
      </button>

      {/* Workspace switcher */}
      <div className="relative shrink-0">
        <button
          onClick={() => setWsOpen((v) => !v)}
          className="flex items-center gap-2.5 pl-1.5 pr-2 sm:pr-2.5 py-1.5 rounded-lg hover:bg-surface2 transition"
        >
          <span className="grid place-items-center w-8 h-8 rounded-lg text-lg" style={{ background: workspace.accent + '22' }}>{workspace.logo}</span>
          <span className="hidden sm:block text-left leading-tight max-w-[10rem]">
            <span className="block text-sm font-bold text-ink truncate">{workspace.name}</span>
            <span className="block text-[0.7rem] text-ink-faint truncate">{org.name}</span>
          </span>
          <ChevronDown className="w-4 h-4 text-ink-faint" />
        </button>
        <Dropdown open={wsOpen} onClose={() => setWsOpen(false)} className="left-0 w-72">
          <div className="px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">{org.name} · Workspaces</div>
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => { setWorkspaceId(w.id); setWsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface2 transition text-left"
            >
              <span className="grid place-items-center w-7 h-7 rounded-md text-base" style={{ background: w.accent + '22' }}>{w.logo}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-ink truncate">{w.name}</span>
                <span className="block text-[0.7rem] text-ink-faint">{w.industry}</span>
              </span>
              <span className={cn('w-2 h-2 rounded-full', HEALTH_DOT[w.organicHealth])} />
              {w.id === workspace.id && <Check className="w-4 h-4 text-coral" />}
            </button>
          ))}
        </Dropdown>
      </div>

      {/* Command / search — full bar on sm+, icon-only on mobile */}
      <button
        onClick={onOpenPalette}
        className="hidden sm:flex flex-1 max-w-md items-center gap-2 px-3 py-2 rounded-lg bg-surface2 border border-line text-ink-faint text-sm hover:border-coral transition"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="text-[0.68rem] font-semibold bg-surface border border-line rounded px-1.5 py-0.5">⌘K</kbd>
      </button>
      <button onClick={onOpenPalette} title="Search" className="sm:hidden grid place-items-center w-9 h-9 rounded-lg hover:bg-surface2 transition text-ink-soft">
        <Search className="w-[18px] h-[18px]" />
      </button>

      <div className="flex-1" />

      {/* Date range (stub) */}
      <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-line bg-surface text-sm font-medium text-ink-soft hover:border-coral transition">
        <Calendar className="w-4 h-4" /> Last 30 days
      </button>

      {/* Create */}
      <div className="relative">
        <button onClick={() => setCreateOpen((v) => !v)} className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg bg-coral-btn text-white text-sm font-bold shadow-coral hover:shadow-coral-lg hover:brightness-105 transition-all">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create</span>
        </button>
        <Dropdown open={createOpen} onClose={() => setCreateOpen(false)} className="right-0 w-52">
          {createItems.map((c) => (
            <button key={c} onClick={() => setCreateOpen(false)} className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface2 transition">{c}</button>
          ))}
        </Dropdown>
      </div>

      <button title="Effy AI" onClick={onOpenAssistant} className="grid place-items-center w-9 h-9 rounded-lg bg-coral-soft text-coral-ink hover:bg-coral hover:text-white transition">
        <Sparkles className="w-[18px] h-[18px]" />
      </button>
      <Notifications />
      <button title="Help" className="hidden sm:grid place-items-center w-9 h-9 rounded-lg hover:bg-surface2 transition text-ink-soft">
        <HelpCircle className="w-[18px] h-[18px]" />
      </button>
      <div className="relative">
        <button onClick={() => setProfileOpen((v) => !v)} title={user.name} className="grid place-items-center w-9 h-9 rounded-full bg-ink text-white text-xs font-bold">
          {user.avatar}
        </button>
        <Dropdown open={profileOpen} onClose={() => setProfileOpen(false)} className="right-0 w-56">
          <div className="px-3 py-2 border-b border-line">
            <div className="text-sm font-bold text-ink">{user.name}</div>
            <div className="text-xs text-ink-faint truncate">{authUser?.email || user.email}</div>
          </div>
          <button className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface2">Profile &amp; settings</button>
          <button
            onClick={() => { setProfileOpen(false); logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-error hover:bg-error-soft"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
