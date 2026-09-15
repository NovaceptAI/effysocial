import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { useAppAuth } from '../context/AppAuth';

// A signed-in account with no organisation — someone removed from their team (G23).
export default function NoOrganisation() {
  const { user, logout } = useAppAuth();
  const navigate = useNavigate();
  return (
    <div className="onboarding-page min-h-dvh grid place-items-center bg-canvas text-ink p-6 text-center font-sans">
      <div className="max-w-sm">
        <span className="grid place-items-center w-12 h-12 rounded-2xl bg-coral-tint text-coral-ink mb-4 mx-auto"><UserX className="w-6 h-6" /></span>
        <h1 className="text-2xl font-extrabold tracking-tight">You’re not part of a team</h1>
        <p className="text-ink-soft mt-2 mb-6">
          {user?.email} isn’t a member of any organisation on EffySocial right now. Ask your admin for a new invite, then open its link.
        </p>
        <button type="button" onClick={async () => { await logout(); navigate('/login'); }}
          className="px-5 py-2.5 rounded-lg bg-coral text-white font-bold">Sign out</button>
      </div>
    </div>
  );
}
