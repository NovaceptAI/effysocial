import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass, Wand2, Send, Inbox, Target, FileInput, BarChart3, Settings,
} from 'lucide-react';
import { NAV, HUB_NAV, isHubRoute } from '../nav';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAppAuth } from '../context/AppAuth';
import { cn } from '../../lib/cn';

// A flat rail entry (icon + wrapped label). Used for Home and the Hub menu.
function RailItem({ to, end, icon: Icon, label, onNavigate }) {
  return (
    <NavLink
      to={to} end={end} onClick={onNavigate} title={label}
      className={({ isActive }) => cn(
        'flex flex-col items-center gap-1 w-[60px] py-1.5 rounded-[14px] transition-all duration-200 group',
        isActive ? 'text-rail-ink' : 'text-rail-muted hover:text-rail-ink',
      )}
    >
      {({ isActive }) => (
        <>
          <span className={cn(
            'grid h-9 w-9 place-items-center rounded-[11px] transition',
            isActive
              ? 'bg-rail-active text-rail-active-ink shadow-[var(--ui-rail-active-shadow)]'
              : 'bg-transparent group-hover:bg-[color:var(--ui-rail-hover)]',
          )}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="text-[0.56rem] font-bold leading-[1.1] text-center">{label}</span>
        </>
      )}
    </NavLink>
  );
}

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

const RAIL_W = 74; // px — icon + label column

export default function NavRail({ mobileOpen = false, onNavigate }) {
  const { org } = useWorkspace();
  const { user: authUser } = useAppAuth();
  const { pathname } = useLocation();
  const isAgency = org?.type === 'agency';
  const home = NAV.find((grp) => grp.group === 'Overview')?.items[0];
  const groups = NAV.filter((grp) => grp.group !== 'Overview');
  const [flyout, setFlyout] = useState(null); // {group, top}
  const hub = isHubRoute(pathname); // hub (generic) menu vs deep PM menu

  // Logo easter-egg: a brief screen sparkle. Nothing renders until clicked,
  // then a handful of pure-CSS glints self-remove after ~2s — no libs, no idle cost.
  const [sparkles, setSparkles] = useState(null);
  const sparkTimer = useRef(null);
  useEffect(() => () => clearTimeout(sparkTimer.current), []);
  const burst = () => {
    setSparkles(Array.from({ length: 16 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100, top: Math.random() * 100,
      size: 10 + Math.random() * 18, delay: Math.random() * 0.5,
      color: Math.random() < 0.5 ? '#ffffff' : '#FF6A5C',
    })));
    clearTimeout(sparkTimer.current);
    sparkTimer.current = setTimeout(() => setSparkles(null), 2000);
  };

  return (
    <nav
      className={cn(
        'shrink-0 bg-[image:var(--ui-rail-grad)] text-rail-ink flex flex-col border-r border-rail-line/10',
        'fixed inset-y-0 left-0 z-50 h-dvh transition-transform duration-300 ease-out',
        'md:sticky md:top-0 md:z-auto md:translate-x-0',
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      )}
      style={{ width: RAIL_W }}
    >
      {/* Brand mark — muted monochrome; click for a little sparkle (not a nav link) */}
      <div className="grid place-items-center h-16">
        <button onClick={burst} title="EffySocial" aria-label="EffySocial"
          className="bg-transparent grid place-items-center transition active:scale-90">
          <img src="/brand/effysocial-mark-muted.png" alt="EffySocial" className="w-8 h-8 object-contain pointer-events-none" />
        </button>
      </div>

      {sparkles && createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden" aria-hidden="true">
          {sparkles.map((s) => (
            <span key={s.id} className="effy-sparkle"
              style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: `${s.size}px`, color: s.color, animationDelay: `${s.delay}s` }}>✦</span>
          ))}
        </div>,
        document.body,
      )}

      <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-1">
        {/* Hub (generic) menu — shown on the launcher + standalone apps */}
        {hub && HUB_NAV.map((it) => (
          <RailItem key={it.to} to={it.to} end={it.end} icon={it.icon} label={it.label} onNavigate={onNavigate} />
        ))}

        {/* Deep Performance-Marketing menu — Home + grouped flyouts */}
        {!hub && home && (
          <RailItem to={home.to} end={home.end} icon={home.icon} label="Home" onNavigate={onNavigate} />
        )}
        {!hub && groups.map((grp) => {
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
                  'flex flex-col items-center gap-1 w-[60px] py-1.5 rounded-[14px] transition-all duration-200 group bg-transparent',
                  groupActive || isFly ? 'text-rail-ink' : 'text-rail-muted hover:text-rail-ink',
                )}
              >
                <span className={cn(
                  'grid h-9 w-9 place-items-center rounded-[11px] transition',
                  groupActive
                    ? 'bg-rail-active text-rail-active-ink shadow-[var(--ui-rail-active-shadow)]'
                    : isFly ? 'bg-[color:var(--ui-rail-press)] text-rail-ink' : 'bg-transparent group-hover:bg-[color:var(--ui-rail-hover)]',
                )}>
                  <GIcon className="w-4 h-4" strokeWidth={2} />
                </span>
                <span className="text-[0.56rem] font-bold leading-none">{GROUP_SHORT[grp.group] || grp.group}</span>
              </button>
              {isFly && createPortal(
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFlyout(null)} />
                  <div className="fixed z-50 w-56 max-h-[70vh] overflow-y-auto rounded-2xl bg-rail-soft border border-rail-line/10 shadow-2xl p-1.5"
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
                          isActive ? 'bg-rail-active text-rail-active-ink' : 'text-rail-ink hover:bg-[color:var(--ui-rail-hover)]',
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                            <span style={isActive ? { color: 'rgb(var(--ui-rail-active-ink))' } : undefined}>{item.label}</span>
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
