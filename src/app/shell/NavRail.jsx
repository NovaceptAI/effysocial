import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { NAV } from '../nav';
import { useWorkspace } from '../context/WorkspaceContext';
import { cn } from '../../lib/cn';

// Nav items that only make sense for agency orgs (multi-client management).
const AGENCY_ONLY = new Set(['/app/clients']);

const STORE_KEY = 'effy.nav.open';
const loadOpen = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
};

export default function NavRail({ mobileOpen = false, onNavigate }) {
  const { org } = useWorkspace();
  const isAgency = org?.type === 'agency';
  // Default: Overview/Strategy/Content/Publish open; others collapsed.
  const [open, setOpen] = useState(() => {
    const saved = loadOpen();
    if (Object.keys(saved).length) return saved;
    return { Overview: true, Strategy: true, Content: true, Publish: true, Engage: true,
      Advertise: false, Convert: false, Analytics: true, Administration: false };
  });

  const toggle = (g) => setOpen((prev) => {
    const next = { ...prev, [g]: !prev[g] };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* noop */ }
    return next;
  });

  return (
    <nav className={cn(
      'w-[248px] shrink-0 bg-rail text-rail-ink flex flex-col border-r border-black/20',
      // Mobile: off-canvas drawer that slides in over a backdrop.
      'fixed inset-y-0 left-0 z-50 h-dvh transition-transform duration-300 ease-out',
      // Desktop (md+): a static sticky sidebar, always visible.
      'md:sticky md:top-0 md:z-auto md:translate-x-0 md:transition-none',
      mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
    )}>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-rail-line/70">
        <span className="grid place-items-center w-8 h-8 rounded-[10px] bg-aurora text-white text-base shadow-[0_4px_14px_-2px_rgba(232,74,51,0.55)]">✦</span>
        <span className="font-display font-semibold text-[1.2rem] tracking-tight text-white">EffySocial</span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {NAV.map((grp) => (
          <div key={grp.group} className="pb-1">
            <button
              onClick={() => toggle(grp.group)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-rail-muted hover:text-rail-ink transition"
            >
              {grp.group}
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', !open[grp.group] && '-rotate-90')} />
            </button>
            {open[grp.group] && (
              <ul className="mt-0.5 space-y-0.5">
                {grp.items.filter((item) => isAgency || !AGENCY_ONLY.has(item.to)).map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) => cn(
                        'group relative flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-coral text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[3px] before:rounded-full before:bg-white/70 before:-ml-3'
                          : 'text-rail-ink/75 hover:bg-rail-soft hover:text-white',
                      )}
                    >
                      <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.9} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[0.65rem] font-bold bg-coral-light/90 text-white rounded-full px-1.5 min-w-[18px] text-center">
                          {item.badge}
                        </span>
                      )}
                      {item.phase > 1 && (
                        <span className="text-[0.6rem] font-bold uppercase text-rail-muted">P{item.phase}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
