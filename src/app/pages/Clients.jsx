import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Table2, AlertTriangle, CheckSquare, Pencil, Plus } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { useClientSummary } from '../api/hooks';
import WorkspaceDialog from '../components/WorkspaceDialog';
import { HealthDot, channelList, sinceLabel } from '../components/ClientFigures';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const COLUMNS = [
  ['Client'], ['Manager'], ['Channels', 'Connected channels'], ['Organic'], ['Paid'],
  ['Spend', 'Spend recorded on the client’s campaigns'], ['Leads (30d)', 'Leads captured in the last 30 days'],
  ['Approvals', 'Posts waiting for internal or client review'], ['Alerts', 'Warnings and errors from the notification centre'],
  ['Last activity'], [''],
];

export default function Clients() {
  const { workspaces, setWorkspaceId, canManageWorkspaces, workspaceLimit } = useWorkspace();
  const { data: figures, isLoading, isError } = useClientSummary();
  const [view, setView] = useState('table');
  const [dialog, setDialog] = useState(null); // null | 'new' | workspace being edited
  const navigate = useNavigate();

  const open = (id) => { setWorkspaceId(id); navigate('/app'); };
  const fig = (w) => figures?.[w.id];
  const value = (w, render) => (fig(w) ? render(fig(w)) : <span className="text-ink-faint">{isError ? '—' : '…'}</span>);
  const manageTitle = canManageWorkspaces ? undefined : 'Only owners and admins can add or edit clients.';
  const addTitle = manageTitle || workspaceLimit || undefined;

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'} under management`}
        actions={
          <>
            <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
              <button aria-label="Table view" aria-pressed={view === 'table'} onClick={() => setView('table')} className={cn('grid place-items-center w-8 h-8 rounded-md', view === 'table' ? 'bg-surface2 text-coral-ink' : 'text-ink-faint')}><Table2 className="w-4 h-4" /></button>
              <button aria-label="Card view" aria-pressed={view === 'cards'} onClick={() => setView('cards')} className={cn('grid place-items-center w-8 h-8 rounded-md', view === 'cards' ? 'bg-surface2 text-coral-ink' : 'text-ink-faint')}><LayoutGrid className="w-4 h-4" /></button>
            </div>
            <Button onClick={() => setDialog('new')} disabled={!canManageWorkspaces || !!workspaceLimit} title={addTitle}><Plus className="w-4 h-4" /> Add client</Button>
          </>
        }
      />
      {isError && <p role="alert" className="mb-3 text-sm text-error">Client figures couldn’t load. Refresh to try again.</p>}

      {view === 'table' ? (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-faint border-b border-line">
                {COLUMNS.map(([h, hint], i) => (
                  <th key={h || i} title={hint} className="font-semibold px-4 py-3 whitespace-nowrap">{h || <span className="sr-only">Actions</span>}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workspaces.map((w) => (
                <tr key={w.id} data-testid={`client-${w.id}`} onClick={() => open(w.id)} className="border-b border-line/70 last:border-0 hover:bg-surface2/60 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid place-items-center w-8 h-8 rounded-lg text-base" style={{ background: w.accent + '22' }}>{w.logo}</span>
                      <div>
                        <div className="font-semibold text-ink">{w.name}</div>
                        <div className="text-xs text-ink-faint">{[w.industry, w.location].filter(Boolean).join(' · ') || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{value(w, (f) => f.manager?.name || <span className="text-ink-faint">Unassigned</span>)}</td>
                  <td className="px-4 py-3 text-ink-soft tabular-nums">{value(w, (f) => <span title={channelList(f.channels) || 'None connected'}>{f.channels.length}</span>)}</td>
                  <td className="px-4 py-3">{value(w, (f) => <HealthDot health={f.organic} kind="Organic" />)}</td>
                  <td className="px-4 py-3">{value(w, (f) => <HealthDot health={f.paid} kind="Paid" />)}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{value(w, (f) => inr(f.spend))}</td>
                  <td className="px-4 py-3 tabular-nums">{value(w, (f) => <span title={`${num(f.leads)} all time`}>{num(f.leads30d)}</span>)}</td>
                  <td className="px-4 py-3">{value(w, (f) => (f.approvals > 0 ? <Badge tone="warning">{f.approvals}</Badge> : <span className="text-ink-faint">0</span>))}</td>
                  <td className="px-4 py-3">{value(w, (f) => (f.alerts > 0 ? <Badge tone="error">{f.alerts}</Badge> : <span className="text-ink-faint">0</span>))}</td>
                  <td className="px-4 py-3 text-ink-faint whitespace-nowrap">{value(w, (f) => sinceLabel(f.lastActivity))}</td>
                  <td className="px-2 py-3">
                    {canManageWorkspaces && (
                      <button aria-label={`Edit ${w.name}`} onClick={(e) => { e.stopPropagation(); setDialog(w); }}
                        className="grid place-items-center w-8 h-8 rounded-md text-ink-faint hover:text-ink hover:bg-surface2">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <p className="sr-only" role="status">Loading client figures…</p>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((w) => (
            <Card key={w.id} onClick={() => open(w.id)} className="p-5 cursor-pointer hover:-translate-y-1 hover:border-coral transition">
              <div className="flex items-center gap-3 mb-3">
                <span className="grid place-items-center w-11 h-11 rounded-xl text-xl" style={{ background: w.accent + '22' }}>{w.logo}</span>
                <div className="min-w-0">
                  <div className="font-bold text-ink truncate">{w.name}</div>
                  <div className="text-xs text-ink-faint">{w.industry || '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-ink-faint text-xs">Spend</div><div className="font-semibold tabular-nums">{value(w, (f) => inr(f.spend))}</div></div>
                <div><div className="text-ink-faint text-xs">Leads (30d)</div><div className="font-semibold tabular-nums">{value(w, (f) => num(f.leads30d))}</div></div>
              </div>
              {fig(w) && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line text-xs text-ink-soft">
                  <span className="flex items-center gap-1"><HealthDot health={fig(w).organic} kind="Organic" /> Organic</span>
                  <span className="flex items-center gap-1"><HealthDot health={fig(w).paid} kind="Paid" /> Paid</span>
                  {fig(w).approvals > 0 && <span className="flex items-center gap-1 ml-auto text-warning"><CheckSquare className="w-3.5 h-3.5" /> {fig(w).approvals}</span>}
                  {fig(w).alerts > 0 && <span className="flex items-center gap-1 text-error"><AlertTriangle className="w-3.5 h-3.5" /> {fig(w).alerts}</span>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <WorkspaceDialog
        open={dialog !== null}
        workspace={dialog && dialog !== 'new' ? dialog : null}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
