import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { NAV } from '../nav';
import { useWorkspace } from '../context/WorkspaceContext';
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

const STORE_KEY = 'effy.nav.open';
const loadOpen = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
};

export default function NavRail({ mobileOpen = false, onNavigate, desktopCollapsed = false }) {
  const { org, workspace } = useWorkspace();
  const { pathname } = useLocation();
  const isAgency = org?.type === 'agency';
  const home = NAV.find((grp) => grp.group === 'Overview')?.items[0];
  const groups = NAV.filter((grp) => grp.group !== 'Overview');
  const flatItems = groups.flatMap((grp) => grp.items.filter((item) => isAgency || !AGENCY_ONLY.has(item.to)));
  // Default: the most common daily areas open; deeper admin/revenue areas collapsed.
  const [open, setOpen] = useState(() => {
    const saved = loadOpen();
    if (Object.keys(saved).length) return saved;
    return { Strategy: true, Content: true, Publish: true, Engage: true,
      Advertise: false, Convert: false, Analytics: true, Administration: false };
  });

  const toggle = (g) => setOpen((prev) => {
    const next = { ...prev, [g]: !prev[g] };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* noop */ }
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
                  <span className="block text-sm font-bold leading-tight">Home</span>
                  <span className={cn('block truncate text-[0.72rem] leading-5', isActive ? 'text-black' : 'text-rail-muted')}>
                    {workspace?.name || 'Overview and priorities'}
                  </span>
                </span>
              </>
            )}
          </NavLink>
        )}
      </div>

      <div className={cn('flex-1 overflow-y-auto px-2 pb-4 space-y-1', desktopCollapsed ? 'hidden md:block' : 'hidden')}>
        {flatItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={item.label}
            aria-label={item.label}
            className={({ isActive }) => cn(
              'group mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] transition-all duration-200',
              isActive
                ? 'bg-white text-black shadow-[0_10px_24px_-18px_rgba(255,255,255,0.85)]'
                : 'text-rail-ink/70 hover:bg-white/[0.07] hover:text-white',
            )}
          >
            <item.icon className="w-[19px] h-[19px]" strokeWidth={2} />
          </NavLink>
        ))}
      </div>

      <div className={cn('flex-1 overflow-y-auto px-3 pb-4 space-y-3', desktopCollapsed && 'md:hidden')}>
        {groups.map((grp) => {
          const visibleItems = grp.items.filter((item) => isAgency || !AGENCY_ONLY.has(item.to));
          if (!visibleItems.length) return null;
          const groupActive = visibleItems.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
          return (
            <div key={grp.group} className="rounded-[16px]">
              <button
                onClick={() => toggle(grp.group)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-left transition',
                  groupActive || open[grp.group]
                    ? 'bg-white/[0.07] text-white'
                    : 'text-rail-muted hover:bg-white/[0.045] hover:text-rail-ink',
                )}
              >
                <span className="flex-1">
                  <span className="block text-[0.92rem] font-bold leading-tight">{grp.group}</span>
                  <span className="block text-[0.66rem] font-semibold text-rail-muted leading-4">
                    {GROUP_HINTS[grp.group] || `${visibleItems.length} ${visibleItems.length === 1 ? 'tool' : 'tools'}`}
                  </span>
                </span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-black/10 text-rail-muted">
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', !open[grp.group] && '-rotate-90')} />
                </span>
              </button>
              {open[grp.group] && (
                <ul className="mt-1.5 space-y-1">
                  {visibleItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onNavigate}
                        className={({ isActive }) => cn(
                          'group relative flex items-center gap-2.5 rounded-[13px] px-2.5 py-2.5 text-sm font-semibold transition-all duration-200',
                          isActive
                            ? 'bg-white text-black shadow-[0_10px_24px_-18px_rgba(255,255,255,0.85)]'
                            : 'text-rail-ink/78 hover:bg-white/[0.055] hover:text-white',
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <span className={cn(
                              'grid h-8 w-8 shrink-0 place-items-center rounded-[11px] transition',
                              isActive ? 'bg-surface2 text-black' : 'bg-white/[0.055] text-rail-muted group-hover:bg-white/10 group-hover:text-coral-light',
                            )}>
                              <item.icon className="w-[17px] h-[17px]" strokeWidth={2} />
                            </span>
                            <span className="flex-1 truncate">{item.label}</span>
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
