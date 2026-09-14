import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, MetricCard, EmptyState } from '../../ui';
import AcceptanceCard, { RESULT_LABELS, fmtHours, resultTone } from '../components/AcceptanceCard';

// Acceptance records for creation work (commercial strategy: approval rate,
// revision rounds, turnaround, generation cost, retries and delivery hours).
const KIND = { film: 'Ad Film', product_shot: 'Product Shot', studio: 'AI Studio' };
const DELIVERED = { film: 'brief to exports', product_shot: 'start to build', studio: 'first draft to approval' };
const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—');
const pct = (v) => (v == null ? '—' : `${Math.round(v * 100)}%`);

export default function Acceptance() {
  const { workspace } = useWorkspace();
  const [openKey, setOpenKey] = useState(null);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['acceptance', workspace?.id],
    queryFn: () => effyApi.listAcceptance(workspace.id),
    enabled: !!workspace,
  });
  const rows = data?.rows || [];
  const t = data?.totals;

  return (
    <div>
      <PageHeader title="Creation Acceptance"
        subtitle="What each film, product shot and AI Studio job cost, how many tries it took, how long it took, and whether the customer accepted it." />
      {isLoading && <p className="flex items-center gap-2 text-sm text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>}
      {error && <p role="alert" className="text-sm text-error">{error.message || 'Could not load acceptance records.'}</p>}
      {data && rows.length === 0 && (
        <EmptyState icon="✅" title="Nothing to review yet"
          body="Films, product shots and AI Studio drafts appear here as they are made, with their cost, retries and turnaround. Record the customer’s verdict once each is delivered." />
      )}
      {t && rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Acceptance rate" value={pct(t.acceptanceRate)} hint={`${t.withVerdict} of ${t.projects} with a verdict · ${t.firstTimeRight} accepted without fixes`} />
            <MetricCard label="Generation cost" value={`$${t.costUsd.toFixed(2)}`} hint="list-price estimate, failed renders refunded" />
            <MetricCard label="Retries · failures" value={`${t.retries} · ${t.failures}`} hint="attempts beyond one per deliverable" />
            <MetricCard label="Median turnaround" value={fmtHours(t.medianTurnaroundHours)} hint={`${t.deliveryHours} human delivery hours recorded`} />
          </div>
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-faint border-b border-line">
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Started</th>
                  <th className="px-4 py-3 font-semibold text-right">Cost</th>
                  <th className="px-4 py-3 font-semibold text-right">Retries</th>
                  <th className="px-4 py-3 font-semibold text-right">Failures</th>
                  <th className="px-4 py-3 font-semibold">Turnaround</th>
                  <th className="px-4 py-3 font-semibold">Verdict</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const key = `${r.kind}:${r.ref}`;
                  const s = r.summary;
                  const open = openKey === key;
                  return (
                    <React.Fragment key={key}>
                      <tr className="border-b border-hair align-top">
                        <td className="px-4 py-3">
                          <div className="text-xs text-ink-faint">{KIND[r.kind]}</div>
                          {r.kind === 'film'
                            ? <Link to={`/app/films/${r.ref}`} className="font-semibold text-ink hover:text-coral-ink">{r.title}</Link>
                            : <span className="font-semibold text-ink">{r.title}</span>}
                        </td>
                        <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{day(r.createdAt)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">${s.costUsd.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{s.retries}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{s.failures}</td>
                        <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{s.deliveredAt ? fmtHours(s.turnaroundHours) : 'In progress'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {s.verdict
                            ? <span className="font-semibold" style={{ color: resultTone(s.verdict.result) }}>{RESULT_LABELS[s.verdict.result]}</span>
                            : <span className="text-ink-faint">Not recorded</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" aria-expanded={open} onClick={() => setOpenKey(open ? null : key)}
                            className="bg-transparent text-xs font-semibold text-coral-ink whitespace-nowrap">
                            {open ? 'Close' : 'Details'}
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-hair">
                          <td colSpan={8} className="px-4 py-3">
                            <AcceptanceCard kind={r.kind} refId={r.ref} workspaceId={workspace.id} summary={s}
                              deliveredLabel={DELIVERED[r.kind]} title={`${KIND[r.kind]} acceptance`} onSaved={() => refetch()} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
