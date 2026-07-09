import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MailWarning, Check, Plug, ArrowRight } from 'lucide-react';
import NavRail from './NavRail';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import AssistantPanel from '../components/AssistantPanel';
import { useAppAuth } from '../context/AppAuth';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';

function VerifyBanner() {
  const { user, resendVerification } = useAppAuth();
  const [sent, setSent] = useState(false);
  if (!user || user.email_verified) return null;
  return (
    <div className="flex items-center gap-2.5 px-5 sm:px-8 py-2.5 bg-warning-soft/70 text-sm text-ink">
      <MailWarning className="w-4 h-4 text-warning shrink-0" />
      <span className="flex-1">Please verify your email (<strong>{user.email}</strong>) to secure your account.</span>
      {sent ? (
        <span className="flex items-center gap-1 text-success font-semibold text-xs"><Check className="w-3.5 h-3.5" /> Sent</span>
      ) : (
        <button onClick={async () => { await resendVerification(); setSent(true); }}
          className="text-xs font-semibold text-warning bg-warning/10 hover:bg-warning/20 rounded-full px-3 py-1 transition">
          Resend email
        </button>
      )}
    </div>
  );
}

// Routes that want the full viewport width (editor-style, no page gutter/cap).
const FULL_BLEED = new Set(['/app/studio']);

// Shown until the workspace has at least one connected channel — the product
// runs on real integrations, so connecting is step one for a fresh account.
function ConnectBanner() {
  const { workspace } = useWorkspace();
  const { pathname } = useLocation();
  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations', workspace?.id],
    queryFn: () => effyApi.listIntegrations(workspace.id),
    enabled: !!workspace,
    staleTime: 60_000,
  });
  const connected = integrations.filter((i) => i.state === 'connected').length;
  if (!workspace || connected > 0 || pathname === '/app/integrations') return null;
  return (
    <Link to="/app/integrations"
      className="flex items-center gap-2.5 px-5 sm:px-8 py-2.5 bg-coral-tint text-sm text-ink hover:bg-coral-soft transition">
      <Plug className="w-4 h-4 text-coral-ink shrink-0" />
      <span className="flex-1"><strong>Connect your channels</strong> — link Instagram, Facebook or LinkedIn to publish, sync data and unlock real analytics.</span>
      <span className="inline-flex items-center gap-1 text-xs font-bold text-coral-ink">Connect <ArrowRight className="w-3.5 h-3.5" /></span>
    </Link>
  );
}

export default function AppShell() {
  const { pathname } = useLocation();
  const fullBleed = FULL_BLEED.has(pathname);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [railHidden, setRailHidden] = useState(() => {
    try {
      const saved = localStorage.getItem('effy.rail.collapsed');
      return saved == null ? true : saved === '1';
    } catch { return true; }
  });
  const toggleRail = () => setRailHidden((v) => {
    const next = !v;
    try { localStorage.setItem('effy.rail.collapsed', next ? '1' : '0'); } catch { /* noop */ }
    return next;
  });
  return (
    <div className="app-root flex min-h-dvh bg-canvas text-ink">
      <NavRail mobileOpen={navOpen} onNavigate={() => setNavOpen(false)} desktopCollapsed={railHidden} />
      {/* Mobile drawer backdrop */}
      {navOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden" onClick={() => setNavOpen(false)} />
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenAssistant={() => setAssistantOpen(true)}
          onOpenNav={() => setNavOpen(true)}
          onToggleRail={toggleRail}
          railHidden={railHidden}
        />
        <VerifyBanner />
        <ConnectBanner />
        <main className={fullBleed
          ? 'flex-1 min-w-0 w-full px-4 sm:px-6 py-5'
          : 'flex-1 min-w-0 p-5 sm:p-8 max-w-[1360px] w-full mx-auto'}>
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
