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

export default function NavRail() {
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
    <nav className="w-[248px] shrink-0 h-dvh sticky top-0 bg-rail text-rail-ink flex flex-col">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-rail-line">
        <span className="grid place-items-center w-8 h-8 rounded-[9px] bg-coral text-white text-base shadow-[0_6px_16px_rgba(232,74,51,0.4)]">✦</span>
        <span className="font-extrabold text-[1.05rem] tracking-tight text-white">EffySocial</span>
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
                      className={({ isActive }) => cn(
                        'group flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition',
                        isActive
                          ? 'bg-coral text-white shadow-[0_6px_16px_rgba(232,74,51,0.35)]'
                          : 'text-rail-ink/80 hover:bg-rail-soft hover:text-white',
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
