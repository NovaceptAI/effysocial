import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown, Compass, Wand2, Send, Inbox, Target, FileInput, BarChart3, Settings,
} from 'lucide-react';
import { NAV } from '../nav';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppAuth } from '../context/AppAuth';
import { cn } from '../../lib/cn';

// Nav items that only make sense for agency orgs (multi-client management).
const AGENCY_ONLY = new Set(['/app/clients']);
const GROUP_HINTS = {
  Strategy: 'Plan the market',
  Content: 'Create the assets',
  Publish: 'Ship the calendar',
  Engage: 'Manage conversations',
  Advertise: 'Paid growth',
  Convert: 'Capture demand',
  Analytics: 'Read performance',
  Administration: 'Team and settings',
};
// One icon per group for the minimized rail — 8 icons instead of ~30.
const GROUP_ICONS = {
  Strategy: Compass, Content: Wand2, Publish: Send, Engage: Inbox,
  Advertise: Target, Convert: FileInput, Analytics: BarChart3, Administration: Settings,
};

// Accordion: exactly ONE group open at a time — keeps the rail on one screen.
const STORE_KEY = 'effy.nav.openGroup';
const loadOpenGroup = () => {
  try { return localStorage.getItem(STORE_KEY) || ''; } catch { return ''; }
};

export default function NavRail({ mobileOpen = false, onNavigate, desktopCollapsed = false }) {
  const { org, workspace } = useWorkspace();
  const { user: authUser } = useAppAuth();
  const { pathname } = useLocation();
  const isAgency = org?.type === 'agency';
  const home = NAV.find((grp) => grp.group === 'Overview')?.items[0];
  const groups = NAV.filter((grp) => grp.group !== 'Overview');
  const [flyout, setFlyout] = useState('');   // minimized-rail group flyout
  // One open group (accordion). The group holding the current page auto-opens
  // on navigation so you always see where you are.
  const groupOfPath = groups.find((grp) =>
    grp.items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`)))?.group;
  const [openGroup, setOpenGroup] = useState(() => loadOpenGroup() || groupOfPath || 'Strategy');
  React.useEffect(() => {
    if (groupOfPath) setOpenGroup(groupOfPath);
  }, [groupOfPath]);

  const toggle = (g) => setOpenGroup((prev) => {
    const next = prev === g ? '' : g;
    try { localStorage.setItem(STORE_KEY, next); } catch { /* noop */ }
    return next;
  });

  return (
    <nav className={cn(
      'w-[268px] shrink-0 bg-[linear-gradient(180deg,#2b2522_0%,#211c1a_58%,#1d1917_100%)] text-rail-ink flex flex-col border-r border-white/10',
      desktopCollapsed ? 'md:w-[76px]' : 'md:w-[268px]',
      // Mobile: off-canvas drawer that slides in over a backdrop.
      'fixed inset-y-0 left-0 z-50 h-dvh transition-transform duration-300 ease-out',
      // Desktop (md+): a static sticky sidebar.
      'md:sticky md:top-0 md:z-auto md:translate-x-0',
      mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
    )}>
      <div className={cn(
        'flex items-center gap-3 px-5 h-16 border-b border-white/10',
        desktopCollapsed && 'md:justify-center md:px-0',
      )}>
        <span className="grid place-items-center w-9 h-9 rounded-[14px] bg-aurora text-white text-base shadow-[0_8px_22px_-8px_rgba(232,74,51,0.75)]">✦</span>
        <span className={cn('min-w-0', desktopCollapsed && 'md:hidden')}>
          <span className="block font-display font-semibold text-[1.2rem] tracking-tight text-white leading-tight">EffySocial</span>
          <span className="block text-[0.68rem] font-semibold text-rail-muted truncate">{org?.name || 'Marketing workspace'}</span>
        </span>
      </div>

      <div className={cn('px-3 pt-3 pb-2', desktopCollapsed && 'md:px-2')}>
        {home && (
          <NavLink
            to={home.to}
            end={home.end}
            onClick={onNavigate}
            title="Home"
            aria-label="Home"
            className={({ isActive }) => cn(
              'group flex items-center gap-3 rounded-[16px] px-3 py-3 transition-all duration-200',
              desktopCollapsed && 'md:justify-center md:px-2',
              isActive
                ? 'bg-white text-black shadow-[0_12px_32px_-22px_rgba(255,255,255,0.7)]'
                : 'bg-white/[0.055] text-white hover:bg-white/[0.09]',
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-[13px] transition',
                  isActive ? 'bg-surface2 text-black' : 'bg-white/10 text-coral-light group-hover:bg-white/15',
                )}>
                  <home.icon className="h-[19px] w-[19px]" strokeWidth={2} />
                </span>
                <span className={cn('min-w-0 flex-1', desktopCollapsed && 'md:hidden')}>
                  <span className="block text-sm font-bold leading-tight" style={isActive ? { color: '#000' } : undefined}>Home</span>
                  <span className={cn('block truncate text-[0.72rem] leading-5', isActive ? 'text-black' : 'text-rail-muted')}>
                    {workspace?.name || 'Overview and priorities'}
                  </span>
                </span>
              </>
            )}
          </NavLink>
        )}
      </div>

      {/* Minimized rail: ONE icon per group (8 total — fits any screen).
          Clicking opens a flyout with that group's pages. */}
      <div className={cn('flex-1 overflow-y-auto px-2 pb-4 pt-1 space-y-1.5', desktopCollapsed ? 'hidden md:block' : 'hidden')}>
        {groups.map((grp) => {
          const visibleItems = grp.items.filter((item) => (isAgency || !AGENCY_ONLY.has(item.to)) && (!item.adminOnly || authUser?.is_admin));
          if (!visibleItems.length) return null;
          const GIcon = GROUP_ICONS[grp.group] || Compass;
          const groupActive = visibleItems.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
          const isFly = flyout === grp.group;
          return (
            <div key={grp.group} className="relative">
              <button
                onClick={() => setFlyout(isFly ? '' : grp.group)}
                title={`${grp.group} — ${GROUP_HINTS[grp.group] || ''}`}
                aria-label={grp.group}
                className={cn(
                  'mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] transition-all duration-200',
                  groupActive
                    ? 'bg-white text-black shadow-[0_10px_24px_-18px_rgba(255,255,255,0.85)]'
                    : isFly ? 'bg-white/15 text-white' : 'bg-transparent text-rail-ink hover:bg-white/[0.07] hover:text-white',
                )}
              >
                <GIcon className="w-[19px] h-[19px]" strokeWidth={2} />
              </button>
              {isFly && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFlyout('')} />
                  <div className="absolute left-full top-0 z-50 ml-2 w-56 rounded-2xl bg-[#241f1d] border border-white/10 shadow-2xl p-1.5">
                    <p className="px-3 pt-2 pb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.09em] text-rail-muted">{grp.group}</p>
                    {visibleItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => { setFlyout(''); onNavigate?.(); }}
                        className={({ isActive }) => cn(
                          'flex items-center gap-2.5 rounded-[11px] px-3 py-2 text-sm font-semibold transition',
                          isActive ? 'bg-white text-black' : 'text-rail-ink hover:bg-white/[0.07] hover:text-white',
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                            <span style={isActive ? { color: '#000' } : undefined}>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className={cn('flex-1 overflow-y-auto px-3 pb-4 space-y-0.5', desktopCollapsed && 'md:hidden')}>
        {groups.map((grp) => {
          const visibleItems = grp.items.filter((item) => (isAgency || !AGENCY_ONLY.has(item.to)) && (!item.adminOnly || authUser?.is_admin));
          if (!visibleItems.length) return null;
          const groupActive = visibleItems.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
          const isOpen = openGroup === grp.group;
          return (
            <div key={grp.group}>
              {/* Slim section header — small caps row, coral dot marks the
                  section holding the current page when it's closed. */}
              <button
                onClick={() => toggle(grp.group)}
                title={GROUP_HINTS[grp.group] || grp.group}
                className={cn(
                  'w-full flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-left transition bg-transparent',
                  'text-[0.68rem] font-bold uppercase tracking-[0.09em]',
                  isOpen || groupActive ? 'text-white' : 'text-rail-muted hover:text-rail-ink hover:bg-white/[0.04]',
                )}
              >
                <span className="flex-1">{grp.group}</span>
                {groupActive && !isOpen && <span className="w-1.5 h-1.5 rounded-full bg-coral-light" />}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform text-rail-muted', !isOpen && '-rotate-90')} />
              </button>
              {isOpen && (
                <ul className="mb-2 space-y-0.5">
                  {visibleItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onNavigate}
                        className={({ isActive }) => cn(
                          'group relative flex items-center gap-2.5 rounded-[11px] px-2.5 py-[7px] text-sm font-semibold transition-all duration-200',
                          isActive
                            ? 'bg-white text-black shadow-[0_10px_24px_-18px_rgba(255,255,255,0.85)]'
                            : 'text-rail-ink hover:bg-white/[0.055] hover:text-white',
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <span className={cn(
                              'grid h-7 w-7 shrink-0 place-items-center rounded-[9px] transition',
                              isActive ? 'bg-surface2 text-black' : 'bg-white/[0.055] text-rail-muted group-hover:bg-white/10 group-hover:text-coral-light',
                            )}>
                              <item.icon className="w-4 h-4" strokeWidth={2} />
                            </span>
                            <span className="flex-1 truncate" style={isActive ? { color: '#000' } : undefined}>{item.label}</span>
                            {item.badge && (
                              <span className="text-[0.65rem] font-bold bg-coral-light/90 text-white rounded-full px-1.5 min-w-[18px] text-center">
                                {item.badge}
                              </span>
                            )}
                            {item.phase > 1 && (
                              <span className={cn('text-[0.6rem] font-bold uppercase', isActive ? 'text-black' : 'text-rail-muted')}>P{item.phase}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
