import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MailWarning, Check } from 'lucide-react';
import NavRail from './NavRail';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import AssistantPanel from '../components/AssistantPanel';
import { useAppAuth } from '../context/AppAuth';
import { useWorkspace } from '../context/WorkspaceContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../../lib/cn';

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

export default function AppShell() {
  const { pathname } = useLocation();
  const { loading } = useAppAuth();
  const { theme } = useTheme();
  const { workspaceId } = useWorkspace();
  const fullBleed = FULL_BLEED.has(pathname);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  if (loading) return <div style={{ minHeight: '100dvh', background: '#0B0C0E', color: 'rgba(236,237,239,0.6)', display: 'grid', placeItems: 'center', fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 13 }}>Loading…</div>;
  return (
    <div className={cn('app-root flex min-h-dvh bg-canvas text-ink', theme === 'light' && 'theme-light')}>
      <NavRail mobileOpen={navOpen} onNavigate={() => setNavOpen(false)} />
      {/* Mobile drawer backdrop */}
      {navOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden" onClick={() => setNavOpen(false)} />
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenAssistant={() => setAssistantOpen(true)}
          onOpenNav={() => setNavOpen(true)}
        />
        <VerifyBanner />
        <main className={fullBleed
          ? 'flex-1 min-w-0 w-full px-4 sm:px-6 py-5'
          : 'flex-1 min-w-0 p-5 sm:p-8 max-w-[1360px] w-full mx-auto'}>
          {/* Keyed by workspace: switching remounts the page, so no list or form keeps the last workspace's rows. */}
          <Outlet key={workspaceId || 'none'} />
        </main>
      </div>
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
