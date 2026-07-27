import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass, Wand2, Send, Inbox, Target, FileInput, BarChart3, Settings,
} from 'lucide-react';
import { NAV } from '../nav';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppAuth } from '../context/AppAuth';
import { cn } from '../../lib/cn';

// Runway-style rail: icons with a small label underneath — no full-text
// sidebar. Clicking a group opens a flyout panel to the right with that
// group's pages (portal-positioned so nothing clips).
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
const GROUP_ICONS = {
  Strategy: Compass, Content: Wand2, Publish: Send, Engage: Inbox,
  Advertise: Target, Convert: FileInput, Analytics: BarChart3, Administration: Settings,
};
// Short labels that fit under a 44px icon.
const GROUP_SHORT = { Administration: 'Admin' };

const RAIL_W = 92; // px — icon + label column

export default function NavRail({ mobileOpen = false, onNavigate }) {
  const { org } = useWorkspace();
  const { user: authUser } = useAppAuth();
  const { pathname } = useLocation();
  const isAgency = org?.type === 'agency';
  const home = NAV.find((grp) => grp.group === 'Overview')?.items[0];
  const groups = NAV.filter((grp) => grp.group !== 'Overview');
  const [flyout, setFlyout] = useState(null); // {group, top}

  return (
    <nav
      className={cn(
        'shrink-0 bg-[linear-gradient(180deg,#15161a_0%,#101114_60%,#0d0e11_100%)] text-rail-ink flex flex-col border-r border-white/10',
        'fixed inset-y-0 left-0 z-50 h-dvh transition-transform duration-300 ease-out',
        'md:sticky md:top-0 md:z-auto md:translate-x-0',
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      )}
      style={{ width: RAIL_W }}
    >
      {/* Brand mark — white star on a coral tile (crisp app-icon look) */}
      <div className="grid place-items-center h-16 border-b border-white/10">
        <span
          className="grid place-items-center w-11 h-11 rounded-[14px] overflow-hidden"
          style={{ background: 'linear-gradient(150deg, #FF6A5C 0%, #E5484D 100%)', boxShadow: '0 6px 18px -6px rgba(229,72,77,0.6)' }}
        >
          <img src="/brand/effysocial-mark-white.png" alt="EffySocial" className="w-[72%] h-[72%] object-contain" />
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-1">
        {/* Home */}
        {home && (
          <NavLink
            to={home.to}
            end={home.end}
            onClick={onNavigate}
            title="Home"
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 w-[76px] py-2 rounded-[14px] transition-all duration-200 group',
              isActive ? 'text-white' : 'text-rail-muted hover:text-white',
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'grid h-11 w-11 place-items-center rounded-[14px] transition',
                  isActive
                    ? 'bg-white text-black shadow-[0_10px_24px_-18px_rgba(255,255,255,0.85)]'
                    : 'bg-white/[0.06] text-coral-light group-hover:bg-white/[0.12]',
                )}>
                  <home.icon className="h-[19px] w-[19px]" strokeWidth={2} />
                </span>
                <span className="text-[0.66rem] font-bold leading-none">Home</span>
              </>
            )}
          </NavLink>
        )}

        {/* Groups: icon + label; click opens the flyout */}
        {groups.map((grp) => {
          const visibleItems = grp.items.filter((item) => (isAgency || !AGENCY_ONLY.has(item.to)) && (!item.adminOnly || authUser?.is_admin));
          if (!visibleItems.length) return null;
          const GIcon = GROUP_ICONS[grp.group] || Compass;
          const groupActive = visibleItems.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
          const isFly = flyout?.group === grp.group;
          return (
            <div key={grp.group} className="relative">
              <button
                onClick={(e) => {
                  if (isFly) { setFlyout(null); return; }
                  const r = e.currentTarget.getBoundingClientRect();
                  setFlyout({ group: grp.group, top: Math.max(8, Math.min(r.top, window.innerHeight - 340)) });
                }}
                title={`${grp.group} — ${GROUP_HINTS[grp.group] || ''}`}
                aria-label={grp.group}
                className={cn(
                  'flex flex-col items-center gap-1 w-[76px] py-2 rounded-[14px] transition-all duration-200 group bg-transparent',
                  groupActive || isFly ? 'text-white' : 'text-rail-muted hover:text-white',
                )}
              >
                <span className={cn(
                  'grid h-11 w-11 place-items-center rounded-[14px] transition',
                  groupActive
                    ? 'bg-white text-black shadow-[0_10px_24px_-18px_rgba(255,255,255,0.85)]'
                    : isFly ? 'bg-white/[0.15] text-white' : 'bg-transparent group-hover:bg-white/[0.08]',
                )}>
                  <GIcon className="w-[19px] h-[19px]" strokeWidth={2} />
                </span>
                <span className="text-[0.66rem] font-bold leading-none">{GROUP_SHORT[grp.group] || grp.group}</span>
              </button>
              {isFly && createPortal(
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFlyout(null)} />
                  <div className="fixed z-50 w-56 max-h-[70vh] overflow-y-auto rounded-2xl bg-[#16181D] border border-white/10 shadow-2xl p-1.5"
                    style={{ left: RAIL_W + 8, top: flyout.top }}>
                    <p className="px-3 pt-2 pb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.09em] text-rail-muted">{grp.group}</p>
                    {visibleItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => { setFlyout(null); onNavigate?.(); }}
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
                </>,
                document.body,
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
