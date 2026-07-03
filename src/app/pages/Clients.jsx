import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Table2, AlertTriangle, CheckSquare } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { Card, PageHeader, Button, StatusBadge, Badge } from '../../ui';
import { cn } from '../../lib/cn';

function HealthDot({ level }) {
  const c = { good: 'bg-success', attention: 'bg-warning', poor: 'bg-error' }[level];
  return <span className={cn('inline-block w-2 h-2 rounded-full', c)} title={level} />;
}

export default function Clients() {
  const { workspaces, setWorkspaceId } = useWorkspace();
  const [view, setView] = useState('table');
  const navigate = useNavigate();

  const open = (id) => { setWorkspaceId(id); navigate('/app'); };

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${workspaces.length} workspaces under management`}
        actions={
          <>
            <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
              <button onClick={() => setView('table')} className={cn('grid place-items-center w-8 h-8 rounded-md', view === 'table' ? 'bg-surface2 text-coral-ink' : 'text-ink-faint')}><Table2 className="w-4 h-4" /></button>
              <button onClick={() => setView('cards')} className={cn('grid place-items-center w-8 h-8 rounded-md', view === 'cards' ? 'bg-surface2 text-coral-ink' : 'text-ink-faint')}><LayoutGrid className="w-4 h-4" /></button>
            </div>
            <Button>+ Add client</Button>
          </>
        }
      />

      {view === 'table' ? (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-faint border-b border-line">
                {['Client', 'Manager', 'Channels', 'Organic', 'Paid', 'Spend / mo', 'Leads', 'Approvals', 'Alerts', 'Last report'].map((h) => (
                  <th key={h} className="font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workspaces.map((w) => (
                <tr key={w.id} onClick={() => open(w.id)} className="border-b border-line/70 last:border-0 hover:bg-surface2/60 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid place-items-center w-8 h-8 rounded-lg text-base" style={{ background: w.accent + '22' }}>{w.logo}</span>
                      <div>
                        <div className="font-semibold text-ink">{w.name}</div>
                        <div className="text-xs text-ink-faint">{w.industry} · {w.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{w.manager}</td>
                  <td className="px-4 py-3 text-ink-soft capitalize">{w.channels.length}</td>
                  <td className="px-4 py-3"><HealthDot level={w.organicHealth} /></td>
                  <td className="px-4 py-3"><HealthDot level={w.paidHealth} /></td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{inr(w.monthlySpend)}</td>
                  <td className="px-4 py-3 tabular-nums">{num(w.leads)}</td>
                  <td className="px-4 py-3">{w.approvals > 0 ? <Badge tone="warning">{w.approvals}</Badge> : <span className="text-ink-faint">0</span>}</td>
                  <td className="px-4 py-3">{w.alerts > 0 ? <Badge tone="error">{w.alerts}</Badge> : <span className="text-ink-faint">0</span>}</td>
                  <td className="px-4 py-3 text-ink-faint whitespace-nowrap">{w.lastReport}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((w) => (
            <Card key={w.id} onClick={() => open(w.id)} className="p-5 cursor-pointer hover:-translate-y-1 hover:border-coral transition">
              <div className="flex items-center gap-3 mb-3">
                <span className="grid place-items-center w-11 h-11 rounded-xl text-xl" style={{ background: w.accent + '22' }}>{w.logo}</span>
                <div className="min-w-0">
                  <div className="font-bold text-ink truncate">{w.name}</div>
                  <div className="text-xs text-ink-faint">{w.industry}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-ink-faint text-xs">Spend / mo</div><div className="font-semibold tabular-nums">{inr(w.monthlySpend)}</div></div>
                <div><div className="text-ink-faint text-xs">Leads</div><div className="font-semibold tabular-nums">{num(w.leads)}</div></div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line text-xs text-ink-soft">
                <span className="flex items-center gap-1"><HealthDot level={w.organicHealth} /> Organic</span>
                <span className="flex items-center gap-1"><HealthDot level={w.paidHealth} /> Paid</span>
                {w.approvals > 0 && <span className="flex items-center gap-1 ml-auto text-warning"><CheckSquare className="w-3.5 h-3.5" /> {w.approvals}</span>}
                {w.alerts > 0 && <span className="flex items-center gap-1 text-error"><AlertTriangle className="w-3.5 h-3.5" /> {w.alerts}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
