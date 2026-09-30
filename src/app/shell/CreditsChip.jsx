import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi, CHANGED_EVENT } from '../api/effyApi';
import { cn } from '../../lib/cn';

// Credits left this month, always in view (launch plan 6.20). They are the organisation's,
// across all its workspaces, and reset at the start of each month (UTC, aiusage.py). Amber
// from 80% used, red once all are used — work isn't blocked (plans.py). The chip sits in the
// top bar from tablet width; on phones the same line opens the avatar menu, and a dot on the
// avatar warns. Read again shortly after any change the app makes, and every minute.
const whole = (n) => Math.floor(n).toLocaleString('en-IN');
const TONE = {
  ok: 'bg-surface2 text-ink-soft hover:text-ink',
  near: 'bg-warning-soft text-warning',
  over: 'bg-error-soft text-error',
};

export function nextReset(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function useCredits() {
  const { workspace } = useWorkspace();
  const { data } = useQuery({
    queryKey: ['billing-credits', workspace?.id],
    queryFn: () => effyApi.billingCredits(workspace.id),
    enabled: !!workspace,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  if (!data) return null;
  const state = data.warning || 'ok';
  const left = Math.max(0, data.remaining ?? data.allowance - data.used);
  const said = state === 'over'
    ? `All ${whole(data.allowance)} of this month’s credits are used. Work isn’t blocked yet. They reset on ${nextReset()}.`
    : `${whole(left)} of ${whole(data.allowance)} credits left this month. They reset on ${nextReset()}.`;
  return { state, left, said };
}

// The top bar's chip, from tablet width (the number alone until there's room for words). It is always mounted (only hidden on phones), so
// it is the one that listens for changes and reads the credits again.
export default function CreditsChip() {
  const qc = useQueryClient();
  useEffect(() => {
    let timer;
    const reread = () => {
      clearTimeout(timer);
      timer = setTimeout(() => qc.invalidateQueries({ queryKey: ['billing-credits'] }), 800);
    };
    window.addEventListener(CHANGED_EVENT, reread);
    return () => { clearTimeout(timer); window.removeEventListener(CHANGED_EVENT, reread); };
  }, [qc]);
  const c = useCredits();
  if (!c) return null;
  return (
    <Link to="/app/billing" title={c.said} aria-label={`Credits: ${c.said} Open Billing.`} data-state={c.state}
      className={cn('hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold tabular-nums whitespace-nowrap shrink-0 transition', TONE[c.state])}>
      <Zap className="w-3.5 h-3.5" aria-hidden="true" />
      {whole(c.left)}<span className="hidden md:inline font-semibold">&nbsp;credits left</span>
    </Link>
  );
}

// The same, as the first line of the avatar menu on phones.
export function CreditsMenuItem({ onOpen }) {
  const c = useCredits();
  if (!c) return null;
  return (
    <Link to="/app/billing" onClick={onOpen} aria-label={`Credits: ${c.said} Open Billing.`} data-state={c.state}
      className={cn('sm:hidden flex items-center gap-2 mx-2 my-1.5 px-2.5 py-2 rounded-lg text-sm font-semibold tabular-nums', TONE[c.state])}>
      <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{whole(c.left)} credits left</span>
      <span className="text-xs font-normal opacity-80">resets {nextReset()}</span>
    </Link>
  );
}

// A dot on the avatar on phones, once credits run low.
export function CreditsDot() {
  const c = useCredits();
  if (!c || c.state === 'ok') return null;
  return (
    <span role="img" aria-label={c.state === 'over' ? 'Credits used up' : 'Credits running low'}
      className={cn('sm:hidden absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-canvas', c.state === 'over' ? 'bg-error' : 'bg-warning')} />
  );
}
