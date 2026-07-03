import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { Card, PageHeader, Button } from '../../ui';
import { cn } from '../../lib/cn';

const HDOT = { good: 'bg-success', attention: 'bg-warning', poor: 'bg-error' };

export default function WorkspaceSelect() {
  const { org, workspaces, workspaceId, setWorkspaceId } = useWorkspace();
  const navigate = useNavigate();

  const pick = (id) => { setWorkspaceId(id); navigate('/app'); };

  return (
    <div>
      <PageHeader title="Choose a workspace" subtitle={org.name} actions={<Button variant="secondary"><Plus className="w-4 h-4" /> New workspace</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((w) => (
          <Card key={w.id} onClick={() => pick(w.id)}
            className={cn('p-5 cursor-pointer hover:-translate-y-1 hover:border-coral transition', w.id === workspaceId && 'border-coral')}>
            <div className="flex items-center gap-3 mb-3">
              <span className="grid place-items-center w-11 h-11 rounded-xl text-xl" style={{ background: w.accent + '22' }}>{w.logo}</span>
              <div className="min-w-0">
                <div className="font-bold text-ink truncate">{w.name}</div>
                <div className="text-xs text-ink-faint">{w.industry} · {w.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-soft">
              <span className="tabular-nums">{inr(w.monthlySpend)}/mo</span>
              <span className="tabular-nums">{num(w.leads)} leads</span>
              <span className={cn('w-2 h-2 rounded-full ml-auto', HDOT[w.organicHealth])} />
              <ArrowRight className="w-4 h-4 text-ink-faint" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
