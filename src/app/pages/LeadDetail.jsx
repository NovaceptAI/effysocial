// Lead detail — deep-dive on one lead: attribution (campaign/form/conversation
// + UTMs), duplicates, follow-up runs, notes, and §14.7 outcome marking that
// feeds offline-conversion signals back to ad platforms (mock until Phase 3).
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Flame, Phone, Mail, User, Megaphone, FileInput, MessageSquare, Copy, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { useWorkspace, inr } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { cn } from '../../lib/cn';

const STAGES = ['new', 'contacted', 'qualified', 'appointment', 'proposal', 'won', 'lost'];
const STAGE_LABEL = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', appointment: 'Appointment', proposal: 'Proposal', won: 'Won', lost: 'Lost' };
const HEAT = { hot: 'text-error', warm: 'text-warning', cold: 'text-ink-faint' };
const SOURCE_TONE = { whatsapp: 'success', form: 'info', dm: 'new', comment: 'new', ad: 'coral', manual: 'default' };
const OUTCOME_LABEL = {
  qualified: 'Qualified', appointment_completed: 'Appointment completed', purchase_completed: 'Purchase completed',
  invalid: 'Invalid lead', duplicate: 'Duplicate', unreachable: 'Unreachable',
};
const POSITIVE = ['qualified', 'appointment_completed', 'purchase_completed'];
const NEGATIVE = ['invalid', 'duplicate', 'unreachable'];

function Section({ icon: Icon, title, children, className }) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wide text-ink-faint">
        <Icon className="w-3.5 h-3.5" /> {title}
      </div>
      {children}
    </Card>
  );
}

export default function LeadDetail() {
  const { id } = useParams();
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const { data: lead, isLoading, isError } = useQuery({ queryKey: ['lead', id], queryFn: () => effyApi.getLead(id) });
  const patch = useMutation({
    mutationFn: (payload) => effyApi.updateLead(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] });
      qc.invalidateQueries({ queryKey: ['leads', workspace?.id] });
    },
  });

  if (isLoading) return <Card className="p-10 text-center text-ink-soft">Loading lead…</Card>;
  if (isError || !lead) return <EmptyState icon="🔍" title="Lead not found" body="It may have been deleted, or belongs to another workspace." action={<Link to="/app/pipeline"><Button>Back to pipeline</Button></Link>} />;

  const a = lead.attribution || {};
  const addNote = () => { if (note.trim()) { patch.mutate({ note: note.trim() }); setNote(''); } };

  return (
    <div>
      <Link to="/app/pipeline" className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink mb-3"><ArrowLeft className="w-4 h-4" /> Pipeline</Link>
      <PageHeader
        title={<span className="inline-flex items-center gap-2"><Flame className={cn('w-5 h-5', HEAT[lead.quality])} />{lead.name}</span>}
        subtitle={`${lead.interest || 'No interest recorded'} · added ${lead.created}`}
        actions={
          <select value={lead.stage} onChange={(e) => patch.mutate({ stage: e.target.value })} disabled={patch.isPending}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold">
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </select>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-4">
          <Section icon={Zap} title="Follow-up runs">
            {!lead.followupRuns?.length ? (
              <div className="text-sm text-ink-faint">No automated follow-ups have run for this lead. <Link to="/app/followups" className="text-coral-ink font-semibold">Build a workflow →</Link></div>
            ) : lead.followupRuns.map((r) => (
              <div key={r.id} className="mb-3 last:mb-0 rounded-lg border border-line p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-ink">{r.workflow}</span>
                  <span className="text-[0.7rem] text-ink-faint tabular-nums">{new Date(r.when).toLocaleString()}</span>
                </div>
                <ol className="space-y-1">
                  {(r.log || []).map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-ink-soft"><Badge tone="default">{step.step}</Badge><span className="pt-0.5">{step.text}</span></li>
                  ))}
                </ol>
              </div>
            ))}
          </Section>

          <Section icon={MessageSquare} title="Notes & activity">
            <div className="flex gap-2 mb-3">
              <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()}
                placeholder="Add a note…" className="flex-1 rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
              <Button onClick={addNote} disabled={patch.isPending || !note.trim()}>Add</Button>
            </div>
            {!lead.notes?.length ? <div className="text-sm text-ink-faint">No notes yet.</div> : (
              <ul className="space-y-2">
                {[...lead.notes].reverse().map((n, i) => (
                  <li key={i} className="text-sm text-ink-soft rounded-lg bg-surface2/60 px-3 py-2">{n.text}</li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="space-y-4">
          <Section icon={User} title="Contact">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-ink-soft"><Phone className="w-3.5 h-3.5 text-ink-faint" />{lead.phone || '—'}</div>
              <div className="flex items-center gap-2 text-ink-soft"><Mail className="w-3.5 h-3.5 text-ink-faint" />{lead.email || '—'}</div>
              <div className="flex items-center gap-2 text-ink-soft"><User className="w-3.5 h-3.5 text-ink-faint" />{lead.owner || 'Unassigned'}</div>
              {lead.value > 0 && <div className="pt-2 border-t border-line font-bold text-ink tabular-nums">{inr(lead.value)} <span className="font-normal text-xs text-ink-faint">expected value</span></div>}
            </div>
          </Section>

          <Section icon={Megaphone} title="Attribution">
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <Badge tone={SOURCE_TONE[lead.source] || 'default'}>{lead.source}</Badge>
              {lead.channel && <ChannelIcon channel={lead.channel} className="w-4 h-4" />}
              {Object.entries(a.utm || {}).map(([k, v]) => <Badge key={k} tone="info">utm_{k}: {v}</Badge>)}
            </div>
            <div className="space-y-2 text-sm text-ink-soft">
              {a.campaign && <div><Link to={`/app/campaigns/${a.campaign.id}`} className="font-semibold text-coral-ink">{a.campaign.name}</Link> <span className="text-xs text-ink-faint">campaign · {a.campaign.status}</span></div>}
              {a.form && (
                <div className="rounded-lg border border-line p-2.5">
                  <div className="flex items-center gap-1.5 font-semibold text-ink text-xs"><FileInput className="w-3.5 h-3.5" />{a.form.name}</div>
                  <div className="text-[0.7rem] text-ink-faint mb-1">submitted {new Date(a.form.submitted).toLocaleString()}</div>
                  {Object.entries(a.form.data || {}).map(([k, v]) => <div key={k} className="text-xs"><span className="text-ink-faint">{k}:</span> {v}</div>)}
                </div>
              )}
              {a.conversation && (
                <div className="rounded-lg border border-line p-2.5">
                  <div className="flex items-center gap-1.5 font-semibold text-ink text-xs"><MessageSquare className="w-3.5 h-3.5" />{a.conversation.kind} from {a.conversation.person} <Badge tone="new">{a.conversation.intent}</Badge></div>
                  {(a.conversation.messages || []).slice(0, 4).map((m, i) => (
                    <div key={i} className="text-xs mt-1"><span className="text-ink-faint">{m.from}:</span> {m.text}</div>
                  ))}
                </div>
              )}
              {!a.campaign && !a.form && !a.conversation && <div className="text-xs text-ink-faint">Added manually — no campaign, form or conversation linked.</div>}
            </div>
          </Section>

          {lead.duplicates?.length > 0 && (
            <Section icon={Copy} title={`Possible duplicates (${lead.duplicates.length})`}>
              <ul className="space-y-2">
                {lead.duplicates.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm">
                    <Link to={`/app/pipeline/${d.id}`} className="font-semibold text-coral-ink truncate">{d.name}</Link>
                    <span className="text-[0.7rem] text-ink-faint shrink-0 ml-2">same {d.match} · {STAGE_LABEL[d.stage]} · {d.created}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section icon={CheckCircle2} title="Sales outcome">
            <p className="text-xs text-ink-faint mb-3">Mark what actually happened. Positive outcomes are sent back to ad platforms as offline-conversion signals so they optimise for buyers, not just clicks (mock until Phase 3).</p>
            <div className="space-y-1.5">
              {POSITIVE.map((o) => (
                <button key={o} onClick={() => patch.mutate({ outcome: o })} disabled={patch.isPending}
                  className={cn('w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left',
                    lead.outcome === o ? 'border-success bg-success/10 font-semibold text-ink' : 'border-line text-ink-soft hover:bg-surface2')}>
                  <CheckCircle2 className="w-4 h-4 text-success" />{OUTCOME_LABEL[o]}
                </button>
              ))}
              {NEGATIVE.map((o) => (
                <button key={o} onClick={() => patch.mutate({ outcome: o })} disabled={patch.isPending}
                  className={cn('w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left',
                    lead.outcome === o ? 'border-error bg-error/10 font-semibold text-ink' : 'border-line text-ink-soft hover:bg-surface2')}>
                  <XCircle className="w-4 h-4 text-error" />{OUTCOME_LABEL[o]}
                </button>
              ))}
            </div>
            {lead.offlineSignals?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-line space-y-1">
                {lead.offlineSignals.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-ink-faint">
                    <Badge tone={s.signal === 'positive' ? 'success' : 'error'}>{s.signal}</Badge>
                    {OUTCOME_LABEL[s.outcome] || s.outcome} · {s.provider} · {new Date(s.when).toLocaleString()}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
