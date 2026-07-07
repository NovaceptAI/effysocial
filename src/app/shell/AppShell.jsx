import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MailWarning, Check } from 'lucide-react';
import NavRail from './NavRail';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import AssistantPanel from '../components/AssistantPanel';
import { useAppAuth } from '../context/AppAuth';

function VerifyBanner() {
  const { user, resendVerification } = useAppAuth();
  const [sent, setSent] = useState(false);
  if (!user || user.email_verified) return null;
  return (
    <div className="flex items-center gap-2.5 px-6 py-2.5 bg-warning-soft border-b border-warning/20 text-sm text-ink">
      <MailWarning className="w-4 h-4 text-warning shrink-0" />
      <span className="flex-1">Please verify your email (<strong>{user.email}</strong>) to secure your account.</span>
      {sent ? (
        <span className="flex items-center gap-1 text-success font-semibold text-xs"><Check className="w-3.5 h-3.5" /> Sent</span>
      ) : (
        <button onClick={async () => { await resendVerification(); setSent(true); }} className="text-xs font-bold text-coral-ink hover:underline">
          Resend email
        </button>
      )}
    </div>
  );
}

export default function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="app-root flex min-h-dvh bg-canvas text-ink">
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
        <main className="flex-1 min-w-0 p-5 sm:p-8 max-w-[1360px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
