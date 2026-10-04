import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { reportResult } from '../lib/connectTab';

// Where a provider sends a connection opened in its own tab (lib/connectTab.js): tell the
// page that opened it, then close. Nobody listening means the sign-in ran in the original
// tab (the browser blocked the new one), so carry on to that page with the result.
const BACK = { onboarding: '/onboarding', integrations: '/app/integrations' };

export default function ConnectResult() {
  const { back } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [left, setLeft] = useState(false);
  const provider = params.get('connected') || '';
  const status = params.get('status') || '';
  const target = BACK[back] || BACK.integrations;

  useEffect(() => {
    let live = true;
    reportResult({ provider, status, reason: params.get('reason') || '' }).then((heard) => {
      if (!live) return;
      if (!heard) { navigate(`${target}?${params.toString()}`, { replace: true }); return; }
      window.close();
      setTimeout(() => { if (live) setLeft(true); }, 400);   // a browser that won't let it close
    });
    return () => { live = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-dvh grid place-items-center bg-canvas text-ink p-6">
      <p role="status" className="flex items-center gap-2 text-sm text-ink-soft">
        {left
          ? <><Check className="w-4 h-4 text-success" /> Done — you can close this tab and go back to EffySocial.</>
          : <><Loader2 className="w-4 h-4 animate-spin" /> Finishing the connection…</>}
      </p>
    </main>
  );
}
