import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { useClientSummary } from '../api/hooks';
import WorkspaceDialog from '../components/WorkspaceDialog';
import { HealthDot } from '../components/ClientFigures';
import { Card, PageHeader, Button } from '../../ui';
import { cn } from '../../lib/cn';

export default function WorkspaceSelect() {
  const { org, workspaces, workspaceId, setWorkspaceId, canManageWorkspaces } = useWorkspace();
  const { data: figures } = useClientSummary();
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const pick = (id) => { setWorkspaceId(id); navigate('/app'); };

  return (
    <div>
      <PageHeader
        title="Choose a workspace"
        subtitle={org.name}
        actions={(
          <Button variant="secondary" onClick={() => setCreating(true)} disabled={!canManageWorkspaces}
            title={canManageWorkspaces ? undefined : 'Only owners and admins can create workspaces.'}>
            <Plus className="w-4 h-4" /> New workspace
          </Button>
        )}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((w) => {
          const f = figures?.[w.id];
          return (
            <Card key={w.id} role="button" tabIndex={0} aria-label={`Open ${w.name}`} onClick={() => pick(w.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(w.id); } }}
              className={cn('p-5 cursor-pointer hover:-translate-y-1 hover:border-coral transition', w.id === workspaceId && 'border-coral')}>
              <div className="flex items-center gap-3 mb-3">
                <span className="grid place-items-center w-11 h-11 rounded-xl text-xl" style={{ background: w.accent + '22' }}>{w.logo}</span>
                <div className="min-w-0">
                  <div className="font-bold text-ink truncate">{w.name}</div>
                  <div className="text-xs text-ink-faint">{[w.industry, w.location].filter(Boolean).join(' · ') || '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-soft">
                {f ? (
                  <>
                    <span className="tabular-nums">{inr(f.spend)} spend</span>
                    <span className="tabular-nums">{num(f.leads30d)} leads in 30 days</span>
                    <span className="ml-auto"><HealthDot health={f.organic} kind="Organic" /></span>
                  </>
                ) : <span className="text-ink-faint">…</span>}
                <ArrowRight className={cn('w-4 h-4 text-ink-faint', !f && 'ml-auto')} />
              </div>
            </Card>
          );
        })}
      </div>
      <WorkspaceDialog open={creating} onClose={() => setCreating(false)} onSaved={(ws) => pick(ws.id)} />
    </div>
  );
}
