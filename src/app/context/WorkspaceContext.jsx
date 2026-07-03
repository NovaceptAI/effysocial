import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAppAuth } from './AppAuth';
import { WORKSPACES as MOCK_WS } from '../data/sampleData';

// Workspaces now come from the real backend bootstrap (org → workspaces).
// Until each module has its own API, we enrich each real workspace with the
// mock "operational" fields (channels, leads, spend, health…) keyed by
// industry, so the not-yet-migrated modules keep rendering.
const ENRICH = Object.fromEntries(MOCK_WS.map((w) => [w.industry, w]));
const DEFAULTS = {
  channels: ['instagram', 'facebook'], monthlySpend: 30000, leads: 60,
  organicHealth: 'good', paidHealth: 'good', manager: 'You', approvals: 0, alerts: 0, lastReport: '—',
};

function initials(name = '') {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
}

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { bootstrap } = useAppAuth();

  const workspaces = useMemo(() => {
    const list = bootstrap?.workspaces || [];
    return list.map((w) => ({ ...DEFAULTS, ...(ENRICH[w.industry] || {}), ...w }));
  }, [bootstrap]);

  const [workspaceId, setWorkspaceId] = useState(null);
  useEffect(() => {
    if (workspaces.length && !workspaces.some((w) => w.id === workspaceId)) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, workspaceId]);

  const workspace = workspaces.find((w) => w.id === workspaceId) || workspaces[0] || null;
  const user = bootstrap?.user ? { ...bootstrap.user, avatar: initials(bootstrap.user.name) } : { name: 'User', avatar: 'U' };
  const org = bootstrap?.org || { name: 'EffySocial' };

  const value = useMemo(
    () => ({ org, user, workspaces, workspace, workspaceId: workspace?.id, setWorkspaceId }),
    [org, user, workspaces, workspace],
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
