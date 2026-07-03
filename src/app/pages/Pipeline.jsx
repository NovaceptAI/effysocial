import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, Plus, ChevronRight, LayoutGrid, Table2 } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { cn } from '../../lib/cn';

const STAGES = ['new', 'contacted', 'qualified', 'appointment', 'proposal', 'won', 'lost'];
const STAGE_LABEL = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', appointment: 'Appointment', proposal: 'Proposal', won: 'Won', lost: 'Lost' };
const HEAT = { hot: 'text-error', warm: 'text-warning', cold: 'text-ink-faint' };
const SOURCE_TONE = { whatsapp: 'success', form: 'info', dm: 'new', comment: 'new', ad: 'coral', manual: 'default' };

export default function Pipeline() {
  const { workspace } = useWorkspace();
  const [view, setView] = useState('kanban');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', workspace?.id],
    queryFn: () => effyApi.listLeads(workspace.id),
    enabled: !!workspace,
  });
  const move = useInvalidatingMutation(({ id, stage }) => effyApi.updateLead(id, { stage }), () => ['leads', workspace?.id]);
  const create = useInvalidatingMutation((payload) => effyApi.createLead(payload), () => ['leads', workspace?.id]);

  const shift = (lead, dir) => {
    const idx = STAGES.indexOf(lead.stage) + dir;
    if (idx < 0 || idx >= STAGES.length) return;
    move.mutate({ id: lead.id, stage: STAGES[idx] });
  };
  const add = () => {
    if (!name.trim()) return;
    create.mutate({ workspace: workspace.id, name: name.trim(), source: 'manual' });
    setName(''); setAdding(false);
  };

  const pipelineValue = leads.filter((l) => !['won', 'lost'].includes(l.stage)).reduce((s, l) => s + (l.value || 0), 0);
  const wonValue = leads.filter((l) => l.stage === 'won').reduce((s, l) => s + (l.value || 0), 0);

  return (
    <div>
      <PageHeader
        title="Lead Pipeline"
        subtitle={`${num(leads.length)} leads · ${inr(pipelineValue)} in pipeline · ${inr(wonValue)} won`}
        actions={
          <>
            <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
              <button onClick={() => setView('kanban')} className={cn('grid place-items-center w-8 h-8 rounded-md', view === 'kanban' ? 'bg-surface2 text-coral-ink' : 'text-ink-faint')}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView('table')} className={cn('grid place-items-center w-8 h-8 rounded-md', view === 'table' ? 'bg-surface2 text-coral-ink' : 'text-ink-faint')}><Table2 className="w-4 h-4" /></button>
            </div>
            <Button onClick={() => setAdding((v) => !v)}><Plus className="w-4 h-4" /> Add lead</Button>
          </>
        }
      />

      {adding && (
        <Card className="p-3 mb-4 flex gap-2">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Lead name…" className="flex-1 rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
          <Button onClick={add} disabled={create.isPending}>Add</Button>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-10 text-center text-ink-soft">Loading pipeline…</Card>
      ) : !leads.length ? (
        <EmptyState icon="🎯" title="No leads yet" body="Convert a sales-intent conversation from the Inbox, or add a lead manually." action={<Button onClick={() => setAdding(true)}>Add lead</Button>} />
      ) : view === 'kanban' ? (
        <div className="grid gap-3 overflow-x-auto pb-2" style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(200px, 1fr))` }}>
          {STAGES.map((stage) => {
            const items = leads.filter((l) => l.stage === stage);
            const colValue = items.reduce((s, l) => s + (l.value || 0), 0);
            return (
              <div key={stage} className="min-w-0">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className={cn('text-xs font-bold uppercase tracking-wide', stage === 'won' ? 'text-success' : stage === 'lost' ? 'text-error' : 'text-ink-faint')}>{STAGE_LABEL[stage]}</span>
                  <span className="text-[0.65rem] text-ink-faint tabular-nums">{items.length}{colValue ? ` · ${inr(colValue)}` : ''}</span>
                </div>
                <div className="space-y-2.5 min-h-[70px] rounded-xl bg-surface2/50 p-2">
                  {items.map((l) => (
                    <Card key={l.id} className="p-3 shadow-e1">
                      <div className="flex items-start gap-2">
                        <Flame className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', HEAT[l.quality])} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-ink truncate">{l.name}</div>
                          {l.interest && <div className="text-xs text-ink-faint truncate">{l.interest}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Badge tone={SOURCE_TONE[l.source] || 'default'}>{l.source}</Badge>
                        {l.channel && <ChannelIcon channel={l.channel} className="w-4 h-4" />}
                        {l.value > 0 && <span className="text-[0.7rem] font-bold tabular-nums text-ink-soft ml-auto">{inr(l.value)}</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-line">
                        <button onClick={() => shift(l, -1)} disabled={l.stage === STAGES[0] || move.isPending}
                          className="text-ink-faint hover:text-ink disabled:opacity-30 rotate-180"><ChevronRight className="w-4 h-4" /></button>
                        <button onClick={() => shift(l, 1)} disabled={l.stage === STAGES.at(-1) || move.isPending}
                          className="text-ink-faint hover:text-ink disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                        <span className="ml-auto text-[0.65rem] text-ink-faint">{l.created}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">{['Lead', 'Source', 'Interest', 'Stage', 'Quality', 'Value', 'Created'].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                  <td className="px-4 py-3"><span className="font-semibold text-ink">{l.name}</span><span className="block text-xs text-ink-faint">{l.phone || l.email || '—'}</span></td>
                  <td className="px-4 py-3"><Badge tone={SOURCE_TONE[l.source] || 'default'}>{l.source}</Badge></td>
                  <td className="px-4 py-3 text-ink-soft">{l.interest || '—'}</td>
                  <td className="px-4 py-3">
                    <select value={l.stage} onChange={(e) => move.mutate({ id: l.id, stage: e.target.value })}
                      className="rounded-md border border-line bg-surface px-2 py-1 text-sm">
                      {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><span className={cn('font-semibold capitalize', HEAT[l.quality])}>{l.quality}</span></td>
                  <td className="px-4 py-3 tabular-nums">{l.value ? inr(l.value) : '—'}</td>
                  <td className="px-4 py-3 text-ink-faint tabular-nums">{l.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
