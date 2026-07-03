import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Loader2 } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, StatusBadge, Badge, Pacing, EmptyState } from '../../ui';

export default function Campaigns() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  const { data: campaigns, isLoading, isError } = useQuery({
    queryKey: ['campaigns', workspace?.id],
    queryFn: () => effyApi.listCampaigns(workspace.id),
    enabled: !!workspace,
  });

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Every campaign holds its strategy, content, ads, leads and results."
        actions={<Button variant="spark"><Sparkles className="w-4 h-4" /> New campaign</Button>}
      />

      {isLoading ? (
        <Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading campaigns…</Card>
      ) : isError ? (
        <EmptyState icon="⚠️" title="Couldn't load campaigns" body="Please refresh or try again." />
      ) : !campaigns?.length ? (
        <EmptyState icon="📣" title="No campaigns yet for this client" body="Spin up a campaign and EffySocial will scaffold its plan, content, ads and funnel." action={<Button>Create campaign</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-faint border-b border-line">
                {['Campaign', 'Objective', 'Status', 'Pacing', 'Leads', 'CPL', 'ROAS', ''].map((h) => (
                  <th key={h} className="font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/app/campaigns/${c.id}`)} className="border-b border-line/70 last:border-0 hover:bg-surface2/60 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{c.name}</div>
                    <div className="text-xs text-ink-faint capitalize">{c.channels.join(' · ')} · {c.pillar}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.objective}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 w-40">
                    <Pacing value={c.spent} max={c.budget} tone={c.spent / c.budget > 0.9 ? 'warning' : 'coral'} />
                    <div className="text-xs text-ink-faint mt-1 tabular-nums">{inr(c.spent)} / {inr(c.budget)}</div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{num(c.kpis.leads)}</td>
                  <td className="px-4 py-3 tabular-nums">{c.kpis.cpl ? inr(c.kpis.cpl, { compact: false }) : '—'}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{c.kpis.roas ? `${c.kpis.roas}×` : '—'}</td>
                  <td className="px-4 py-3">{c.recommendations > 0 && <Badge tone="new">{c.recommendations} rec</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
