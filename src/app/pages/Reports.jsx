import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BarChart3, Download, Link2, Loader2, Wand2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { downloadReportPdf } from '../reportPdf';
import ReportView from '../components/ReportView';
import ShareReport from '../components/ShareReport';
import { Card, PageHeader, EmptyState, Button } from '../../ui';

// Campaign reports built from real data (launch plan 5.10, G42): the same numbers as the
// campaign's workspace, downloadable as a PDF and shareable as a read-only link.
const ACTION_LINKS = {
  landing: ['/app/landing', 'Add landing page'],
  form: ['/app/forms', 'Attach form'],
  content: (c) => [`/app/studio?campaign=${c.id}&topic=${encodeURIComponent(c.name)}`, 'Create in Studio'],
  spend: ['/app/workflows', 'Open workflow'],
  tracking: ['/app/tracking', 'Check tracking'],
  roas: ['/app/ads', 'Review ads'],
  ok: ['/app/calendar', 'Open calendar'],
};

export default function Reports() {
  const { workspace } = useWorkspace();
  const [sel, setSel] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [pdf, setPdf] = useState({ busy: false, error: '' });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', workspace?.id],
    queryFn: () => effyApi.listCampaigns(workspace.id),
    enabled: !!workspace,
  });
  useEffect(() => { if (!sel && campaigns.length) setSel(campaigns[0].id); }, [campaigns, sel]);
  const campaign = campaigns.find((c) => c.id === sel);
  const { data: report, isLoading: loadingReport, isError, error } = useQuery({
    queryKey: ['campaign-report', sel],
    queryFn: () => effyApi.campaignReport(sel),
    enabled: !!sel,
  });

  const savePdf = async () => {
    setPdf({ busy: true, error: '' });
    try {
      await downloadReportPdf(report);
      setPdf({ busy: false, error: '' });
    } catch (e) {
      setPdf({ busy: false, error: e.message || 'Could not make the PDF.' });
    }
  };

  if (!isLoading && campaigns.length === 0) {
    return (
      <div>
        <PageHeader title="Performance review" subtitle="Campaign-by-campaign review built from your real data." />
        <EmptyState
          icon="📄"
          title="Nothing to review yet"
          body="Start a campaign (or a Lead Gen workflow) and this page reviews its real spend, leads, cost per lead and what to do next. No sample numbers — ever."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/app/workflows"><Button><Wand2 className="w-4 h-4" /> Start a workflow</Button></Link>
              <Link to="/app/analytics/organic"><Button variant="secondary"><BarChart3 className="w-4 h-4" /> View analytics</Button></Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Performance review"
        subtitle="Campaign-by-campaign review built from your real data — spend, leads, efficiency and the next move."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select value={sel || ''} onChange={(e) => setSel(Number(e.target.value))} aria-label="Campaign"
              className="rounded-xl bg-surface2 px-3 py-2 text-sm font-semibold">
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button variant="secondary" onClick={savePdf} disabled={!report || pdf.busy}>
              {pdf.busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
            </Button>
            <Button variant="secondary" onClick={() => setSharing(true)} disabled={!campaign}><Link2 className="w-4 h-4" /> Share link</Button>
          </div>
        }
      />
      {pdf.error && <p role="alert" className="text-sm text-error mb-3">{pdf.error}</p>}
      {sharing && campaign && <ShareReport campaign={campaign} onClose={() => setSharing(false)} />}

      {isError ? <p role="alert" className="text-sm text-error">{error.message}</p>
        : loadingReport || !report ? <Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Building the report…</Card>
          : (
            <ReportView
              report={report}
              actionLinks={(a) => {
                const link = ACTION_LINKS[a.key];
                if (!link) return null;
                const [to, label] = typeof link === 'function' ? link(report.campaign) : link;
                return <Link to={to}><Button size="sm" variant="secondary">{label} <ArrowRight className="w-3.5 h-3.5" /></Button></Link>;
              }}
            />
          )}
    </div>
  );
}
