import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { formatInZone, orgZone } from '../timezone';
import { Badge, Button } from '../../ui';

// Every submission a form has received: what was typed in, where it came from, and
// where its lead is now (launch plan 5.7, G38).
const STAGE_TONE = { won: 'success', lost: 'error', new: 'info' };
const CLICK = { fbclid: 'Meta ad', gclid: 'Google ad' };

// Columns: the form's fields, then answers to fields that have since been removed.
export function columnsFor(form, submissions) {
  const known = new Set(form.fields.map((f) => f.id));
  const extra = [...new Set(submissions.flatMap((s) => Object.keys(s.data || {})).filter((k) => !known.has(k)))];
  return [...form.fields.map((f) => ({ id: f.id, label: f.label })), ...extra.map((id) => ({ id, label: id, removed: true }))];
}

// A cell a spreadsheet won't run as a formula: these answers come from the public.
const safe = (v) => {
  const text = String(v ?? '');
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
};

export function toCsv(form, submissions, zone) {
  const cols = columnsFor(form, submissions);
  const header = ['Submitted', ...cols.map((c) => (c.removed ? `${c.label} (removed field)` : c.label)),
    'UTM source', 'UTM medium', 'UTM campaign', 'Meta click id', 'Google click id', 'Lead', 'Stage', 'Outcome'];
  const rows = submissions.map((s) => [
    formatInZone(s.created, zone, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
    ...cols.map((c) => s.data?.[c.id] ?? ''),
    s.utm?.source ?? '', s.utm?.medium ?? '', s.utm?.campaign ?? '', s.utm?.fbclid ?? '', s.utm?.gclid ?? '',
    s.lead ? s.lead.name : 'Deleted', s.lead?.stage ?? '', s.lead?.outcome ?? '',
  ]);
  return [header, ...rows].map((r) => r.map(safe).join(',')).join('\r\n');
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([`﻿${text}`], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function FormSubmissions({ form }) {
  const { org } = useWorkspace();
  const zone = orgZone(org);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['form-submissions', form.id],
    queryFn: () => effyApi.formSubmissions(form.id),
  });

  if (isLoading) return <p className="px-4 py-3 text-sm text-ink-faint flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading submissions…</p>;
  if (isError) return <p role="alert" className="px-4 py-3 text-sm text-error">{error.message}</p>;

  const { submissions, total, shown } = data;
  if (!total) {
    return (
      <p className="px-4 py-3 text-sm text-ink-faint">
        {form.status === 'published'
          ? 'No submissions yet — share the form’s link and every enquiry will be listed here.'
          : 'No submissions yet. Publish the form and share its link to start receiving them.'}
      </p>
    );
  }

  const cols = columnsFor(form, submissions);
  const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'form';
  return (
    <section className="px-4 py-3" aria-label={`Submissions to ${form.name}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-xs text-ink-faint">
          {shown < total ? `Showing the latest ${shown} of ${total} submissions.` : `${total} submission${total === 1 ? '' : 's'}.`}
        </p>
        <Button size="sm" variant="secondary" onClick={() => download(`${slug}-submissions.csv`, toCsv(form, submissions, zone))}>
          <Download className="w-3.5 h-3.5" /> Export CSV{shown < total ? ` (latest ${shown})` : ''}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-faint border-b border-line">
              <th className="font-semibold px-3 py-2 whitespace-nowrap">Submitted</th>
              {cols.map((c) => (
                <th key={c.id} className="font-semibold px-3 py-2 whitespace-nowrap">
                  {c.label}{c.removed && <span className="font-normal text-ink-faint"> (removed field)</span>}
                </th>
              ))}
              <th className="font-semibold px-3 py-2">Came from</th>
              <th className="font-semibold px-3 py-2">Lead</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-line/70 last:border-0 align-top">
                <td className="px-3 py-2 whitespace-nowrap text-ink-soft">{formatInZone(s.created, zone)}</td>
                {cols.map((c) => <td key={c.id} className="px-3 py-2 text-ink">{String(s.data?.[c.id] ?? '')}</td>)}
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {s.utm?.source ? <Badge tone="info">{s.utm.source}{s.utm.campaign ? ` · ${s.utm.campaign}` : ''}</Badge> : <span className="text-ink-faint">Direct</span>}
                    {Object.entries(CLICK).filter(([k]) => s.utm?.[k]).map(([k, label]) => <Badge key={k}>{label}</Badge>)}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {s.lead ? (
                    <Link to={`/app/pipeline/${s.lead.id}`} className="inline-flex items-center gap-1.5 font-semibold text-coral-ink hover:underline">
                      {s.lead.name} <Badge tone={STAGE_TONE[s.lead.stage] || 'default'}>{s.lead.stage}</Badge>
                    </Link>
                  ) : <span className="text-ink-faint">Lead deleted</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
