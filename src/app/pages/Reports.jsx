import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, ArrowRight, ClipboardCheck, AlertTriangle, CheckCircle2, Wand2,
} from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, EmptyState, Button, Badge, MetricCard, Pacing } from '../../ui';

// Rule-based next actions — every rule reads REAL fields only (assembly counts,
// budget/spend, kpis when present). No fabricated metrics, no sample data.
function nextActions(c, asm) {
  const counts = asm?.counts || {};
  const k = c.kpis || {};
  const out = [];
  if (!counts.landing) out.push({ sev: 'warn', text: 'No landing page attached — ad clicks have nowhere to convert.', to: '/app/landing', cta: 'Add landing page' });
  if (!counts.forms) out.push({ sev: 'warn', text: 'No lead form attached — enquiries can’t reach the pipeline.', to: '/app/forms', cta: 'Attach form' });
  if (!counts.content) out.push({ sev: 'info', text: 'No creative attached yet — draft on-brand content in AI Studio.', to: `/app/studio?campaign=${c.id}&topic=${encodeURIComponent(c.name)}`, cta: 'Create in Studio' });
  if (c.budget > 0 && !c.spent) out.push({ sev: 'info', text: 'Budget allocated but nothing spent — ads aren’t running yet. Prepare the ad draft in the workflow.', to: '/app/workflows', cta: 'Open workflow' });
  if ((counts.content > 0 || c.spent > 0) && !counts.leads) out.push({ sev: 'warn', text: 'Activity but zero leads captured — verify tracking, UTM and the form path.', to: '/app/tracking', cta: 'Check tracking' });
  if (k.roas != null && Number(k.roas) < 1) out.push({ sev: 'warn', text: `ROAS is ${k.roas}× (below break-even) — shift budget toward retargeting / high-intent audiences.`, to: '/app/ads', cta: 'Review ads' });
  if (!out.length) out.push({ sev: 'ok', text: 'All stages wired — keep publishing and review weekly.', to: '/app/calendar', cta: 'Open calendar' });
  return out;
}

const SEV = {
  warn: { icon: AlertTriangle, cls: 'text-warning', bg: 'bg-warning-soft' },
  info: { icon: ClipboardCheck, cls: 'text-info', bg: 'bg-info-soft' },
  ok: { icon: CheckCircle2, cls: 'text-success', bg: 'bg-success-soft' },
};

export default function Reports() {
  const { workspace } = useWorkspace();
  const [sel, setSel] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', workspace?.id],
    queryFn: () => effyApi.listCampaigns(workspace.id),
    enabled: !!workspace,
  });
  useEffect(() => { if (!sel && campaigns.length) setSel(campaigns[0].id); }, [campaigns, sel]);

  const campaign = campaigns.find((c) => c.id === sel);
  const { data: asm } = useQuery({
    queryKey: ['assembly', sel],
    queryFn: () => effyApi.campaignAssembly(sel),
    enabled: !!sel,
  });

  if (!isLoading && campaigns.length === 0) {
    return (
      <div>
        <PageHeader title="Performance review" subtitle="Campaign-by-campaign review built from your real data." />
        <EmptyState
          icon="📄"
          title="Nothing to review yet"
          body="Start a campaign (or a Lead Gen workflow) and this page reviews its real spend, leads, CPL and what to do next. No sample numbers — ever."
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

  const k = campaign?.kpis || {};
  const counts = asm?.counts || {};
  const actions = campaign ? nextActions(campaign, asm) : [];

  return (
    <div>
      <PageHeader
        title="Performance review"
        subtitle="Campaign-by-campaign review built from your real data — spend, leads, efficiency and the next move."
        actions={
          <select value={sel || ''} onChange={(e) => setSel(Number(e.target.value))}
            className="rounded-xl bg-surface2 px-3 py-2 text-sm font-semibold">
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        }
      />

      {campaign && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <MetricCard label="Spend" value={inr(campaign.spent || 0)} hint={`of ${inr(campaign.budget || 0)} budget`} />
            <MetricCard label="Leads" value={num(counts.leads ?? k.leads ?? 0)} hint={k.qualified != null ? `${num(k.qualified)} qualified` : 'from this campaign'} />
            <MetricCard label="CPL" value={k.cpl != null ? inr(k.cpl, { compact: false }) : '—'} hint={k.cpl != null ? 'cost per lead' : 'needs spend + leads'} />
            <MetricCard label="ROAS" value={k.roas != null ? `${k.roas}×` : '—'} hint={k.roas != null ? 'blended' : 'needs revenue data'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5">
              <h3 className="font-bold text-ink mb-3">Budget pacing</h3>
              <Pacing value={campaign.spent || 0} max={campaign.budget || 1} tone={(campaign.spent / (campaign.budget || 1)) > 0.9 ? 'warning' : 'coral'} />
              <div className="flex justify-between text-sm mt-2 tabular-nums">
                <span className="text-ink-soft">{inr(campaign.spent || 0)} spent</span>
                <span className="text-ink-faint">of {inr(campaign.budget || 0)}</span>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-ink-soft">
                <div className="flex justify-between"><span>Content items</span><span className="tabular-nums font-semibold text-ink">{counts.content ?? '—'}</span></div>
                <div className="flex justify-between"><span>Landing pages</span><span className="tabular-nums font-semibold text-ink">{counts.landing ?? '—'}</span></div>
                <div className="flex justify-between"><span>Lead forms</span><span className="tabular-nums font-semibold text-ink">{counts.forms ?? '—'}</span></div>
              </div>
            </Card>

            <Card className="lg:col-span-2 p-5">
              <h3 className="font-bold text-ink mb-3">Recommended next actions</h3>
              <div className="space-y-2.5">
                {actions.map((a, i) => {
                  const S = SEV[a.sev];
                  return (
                    <div key={i} className={`flex items-center gap-3 rounded-xl p-3 ${S.bg}`}>
                      <S.icon className={`w-4 h-4 shrink-0 ${S.cls}`} />
                      <p className="flex-1 text-sm text-ink leading-snug">{a.text}</p>
                      <Link to={a.to}><Button size="sm" variant="secondary">{a.cta} <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-ink-faint mt-4">Every recommendation is derived from this campaign’s real attachments, budget and KPIs — nothing is simulated. White-label exportable reports arrive with channel sync.</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
