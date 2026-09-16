import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Loader2 } from 'lucide-react';
import { effyApi } from '../app/api/effyApi';
import { downloadReportPdf } from '../app/reportPdf';
import ReportView from '../app/components/ReportView';

// A shared campaign report (/report/:token) — no sign-in, read-only (launch plan 5.10).
// It shows the report as it was when shared, with the business's name only.
const day = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PublicReport() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    effyApi.publicReport(token)
      .then((d) => setState({ data: d }))
      .catch((e) => setState({ error: e.status === 410 ? e.message : 'This report link isn’t valid.' }));
  }, [token]);

  if (state.loading) {
    return <div className="min-h-dvh bg-canvas grid place-items-center text-ink-soft text-sm"><span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading report…</span></div>;
  }
  if (state.error) {
    return <div className="min-h-dvh bg-canvas grid place-items-center p-6"><p className="text-ink-soft text-sm" role="alert">{state.error}</p></div>;
  }

  const { report, sharedAt, expiresAt } = state.data;
  const save = async () => {
    setBusy(true);
    try { await downloadReportPdf(report, { sharedAt }); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-xl text-xl text-white" style={{ background: report.business.accent || '#e84a33' }}>{report.business.logo || '✦'}</span>
            <div>
              <p className="text-sm text-ink-soft">{report.business.name}</p>
              <h1 className="font-display text-2xl font-semibold tracking-tight">{report.campaign.name}</h1>
            </div>
          </div>
          <button type="button" onClick={save} disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface2 disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
          </button>
        </header>
        <p className="text-xs text-ink-faint mb-5">
          Figures as of {day(report.generatedAt)}, shared {day(sharedAt)}. This link ends {day(expiresAt)}.
        </p>
        <ReportView report={report} />
        <p className="text-xs text-ink-faint mt-8">Prepared by {report.business.preparedBy}</p>
      </div>
    </div>
  );
}
