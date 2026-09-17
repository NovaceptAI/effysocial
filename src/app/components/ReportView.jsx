import React from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, ExternalLink } from 'lucide-react';
import { reportFigures, count } from '../reportPdf';

// A campaign report, read-only (launch plan 5.10). The same view the business sees and
// the one a share link opens — so a client sees exactly what the business saw.
const SEV = {
  warn: { icon: AlertTriangle, cls: 'text-warning', bg: 'bg-warning-soft' },
  info: { icon: ClipboardCheck, cls: 'text-info', bg: 'bg-info-soft' },
  ok: { icon: CheckCircle2, cls: 'text-success', bg: 'bg-success-soft' },
};

export default function ReportView({ report, actionLinks }) {
  const figures = reportFigures(report).map(([label, value, note]) => ({ label, value: value.replace(/^INR /, '₹'), note: note.replace(/INR /g, '₹') }));
  const top = Math.max(1, ...report.funnel.map((f) => f.value));
  return (
    <div className="space-y-4">
      {report.business.sample && (
        <p role="note" className="rounded-xl bg-info-soft text-ink text-sm px-4 py-2.5">
          <strong>Sample data.</strong> This report is from a sample business; its numbers are invented for a demo.
        </p>
      )}
      <section aria-label="Results" className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {figures.map((f) => (
          <div key={f.label} className="rounded-2xl bg-surface shadow-e1 p-4">
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-ink-faint">{f.label}</div>
            <div className="text-2xl font-extrabold tabular-nums text-ink mt-1">{f.value}</div>
            <div className="text-xs text-ink-faint mt-1">{f.note}</div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section aria-label="From content to revenue" className="rounded-2xl bg-surface shadow-e1 p-5">
          <h3 className="font-bold text-ink mb-3">From content to revenue</h3>
          <ul className="space-y-2.5">
            {report.funnel.map((f) => (
              <li key={f.key}>
                <div className="flex justify-between text-sm"><span className="text-ink-soft">{f.label}</span><span className="font-semibold tabular-nums">{count(f.value)}</span></div>
                <div className="mt-1 h-2 rounded-full bg-surface2 overflow-hidden"><div className="h-full bg-coral rounded-full" style={{ width: `${Math.max(f.value ? 2 : 0, (f.value / top) * 100)}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Top content" className="rounded-2xl bg-surface shadow-e1 p-5">
          <h3 className="font-bold text-ink mb-3">Top content</h3>
          {report.topContent.length ? (
            <ul className="divide-y divide-line">
              {report.topContent.map((p) => (
                <li key={p.title} className="py-2 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold text-ink block truncate">{p.title}</span>
                    <span className="text-xs text-ink-faint capitalize">{p.type || 'post'} · {p.channel}</span>
                  </span>
                  <span className="text-right shrink-0 tabular-nums">
                    {count(p.reach)} reach<span className="block text-xs text-ink-faint">{p.engagement}% engagement</span>
                  </span>
                  {p.permalink && <a href={p.permalink} target="_blank" rel="noreferrer" aria-label={`Open ${p.title}`} className="text-ink-faint hover:text-ink"><ExternalLink className="w-4 h-4" /></a>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-soft">No published post in this campaign has numbers yet.</p>}
        </section>
      </div>

      <section aria-label="What to do next" className="rounded-2xl bg-surface shadow-e1 p-5">
        <h3 className="font-bold text-ink mb-3">What to do next</h3>
        <div className="space-y-2">
          {report.actions.map((a) => {
            const S = SEV[a.severity] || SEV.info;
            return (
              <div key={a.text} className={`flex items-center gap-3 rounded-xl p-3 ${S.bg}`}>
                <S.icon className={`w-4 h-4 shrink-0 ${S.cls}`} />
                <p className="flex-1 text-sm text-ink leading-snug">{a.text}</p>
                {actionLinks?.(a)}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
