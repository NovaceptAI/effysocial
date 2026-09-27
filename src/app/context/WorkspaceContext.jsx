import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useAppAuth } from './AppAuth';

// Workspaces come from the real backend bootstrap (org → workspaces). Figures
// about a workspace (spend, leads, health) come from /workspaces/summary via
// useClientSummary, never from defaults here.

// Roles that may create and edit workspaces — mirrors tenancy.ORG_ADMIN_ROLES.
export const WORKSPACE_ADMIN_ROLES = new Set(['Agency owner', 'Agency admin', 'Workspace admin']);
// Roles that can't create or edit content — mirrors tenancy._NO_WRITE and _APPROVAL_ONLY.
export const READ_ONLY_ROLES = new Set(['View-only', 'Client approver']);

const STORAGE_KEY = 'effy.workspace';
// Settings → Roles & client approval (engine profiles.SWITCHES), each off until turned on.
const SWITCHES_OFF = { clientsPage: false, clientApprover: false, clientReview: false, requireApproval: false };

function initials(name = '') {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
}

// The chosen workspace survives a reload, remembered for each profile on the login
// (6.15); storage can be unavailable (private mode).
function readSaved(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return saved && saved.user === userId ? saved : null;
  } catch {
    return null;
  }
}

export function savedChoice(userId, orgId) {
  const saved = readSaved(userId);
  // `workspace` is how the choice was kept before profiles; it is checked against the
  // profile's own workspaces before use, so it can't open another profile's.
  return saved ? saved.byOrg?.[orgId] ?? saved.workspace ?? null : null;
}

export function saveChoice(userId, orgId, workspaceId) {
  const byOrg = { ...(readSaved(userId)?.byOrg || {}), [orgId]: workspaceId };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userId, byOrg })); } catch { /* private mode */ }
}

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { bootstrap, refresh } = useAppAuth();
  const userId = bootstrap?.user?.id;
  const orgId = bootstrap?.org?.id;

  const workspaces = useMemo(() => bootstrap?.workspaces || [], [bootstrap]);

  // Resolved during render, not in an effect, so the first page to mount after a
  // reload already asks for the remembered workspace rather than the first one.
  const [chosen, setChosen] = useState(null);
  const workspaceId = useMemo(() => {
    const has = (id) => id != null && workspaces.some((w) => w.id === id);
    if (has(chosen)) return chosen;
    const saved = savedChoice(userId, orgId);
    return has(saved) ? saved : workspaces[0]?.id ?? null;
  }, [workspaces, chosen, userId, orgId]);

  const setWorkspaceId = useCallback((id) => {
    setChosen(id);
    if (userId != null) saveChoice(userId, orgId, id);
  }, [userId, orgId]);

  const workspace = workspaces.find((w) => w.id === workspaceId) || null;
  const user = bootstrap?.user ? { ...bootstrap.user, avatar: initials(bootstrap.user.name) } : { name: 'User', avatar: 'U' };
  const org = bootstrap?.org || { name: 'EffySocial' };
  const role = bootstrap?.role || null;
  const canManageWorkspaces = WORKSPACE_ADMIN_ROLES.has(role);
  const canWrite = !!role && !READ_ONLY_ROLES.has(role);
  const planInfo = bootstrap?.org?.planInfo || null;
  // Every profile on this login, for the switcher (engine profiles.profiles_of).
  const profiles = useMemo(() => bootstrap?.profiles || [], [bootstrap]);
  const switches = useMemo(() => ({ ...SWITCHES_OFF, ...(bootstrap?.org?.profile?.settings || {}) }), [bootstrap]);
  // Why a new workspace can't be added on this plan, or null when it can.
  const cap = planInfo?.limits?.workspaces;
  const workspaceLimit = cap != null && workspaces.length >= cap
    ? `Your ${planInfo.plan === 'Trial' ? 'trial' : `${planInfo.plan} plan`} includes ${cap} workspace${cap === 1 ? '' : 's'}. Upgrade in Billing for more.`
    : null;

  const value = useMemo(
    () => ({
      org, user, role, canManageWorkspaces, canWrite, planInfo, workspaceLimit, workspaces, workspace, workspaceId: workspace?.id, setWorkspaceId,
      refreshWorkspaces: refresh, profiles, switches,
    }),
    [org, user, role, canManageWorkspaces, canWrite, planInfo, workspaceLimit, workspaces, workspace, setWorkspaceId, refresh, profiles, switches],
  );
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}

export function inr(n, { compact = true } = {}) {
  if (n == null) return '—';
  if (compact) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  }
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function num(n) {
  return (n ?? 0).toLocaleString('en-IN');
}
