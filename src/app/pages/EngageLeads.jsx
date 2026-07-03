import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Flame, ArrowRight, MessageSquare } from 'lucide-react';
import { useWorkspace, inr } from '../context/WorkspaceContext';
import { useConversations, useInvalidatingMutation } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Badge, Button } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { cn } from '../../lib/cn';

const HEAT = { hot: 'text-error', warm: 'text-warning', cold: 'text-ink-faint' };

export default function EngageLeads() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const { data: convos = [] } = useConversations(workspace);
  const { data: leads = [] } = useQuery({
    queryKey: ['leads', workspace?.id],
    queryFn: () => effyApi.listLeads(workspace.id),
    enabled: !!workspace,
  });
  const convert = useInvalidatingMutation((id) => effyApi.convertLead(id), () => ['leads', workspace?.id]);

  const salesConvos = convos.filter((c) => c.intent === 'sales');
  const fresh = leads.filter((l) => l.stage === 'new').slice(0, 5);

  const toPipeline = async (id) => {
    await convert.mutateAsync(id);
    navigate('/app/pipeline');
  };

  return (
    <div>
      <PageHeader title="Leads from conversations" subtitle="Sales-intent DMs, comments and mentions — hand off to the pipeline"
        actions={<Button variant="secondary" onClick={() => navigate('/app/pipeline')}>Open pipeline <ArrowRight className="w-3.5 h-3.5" /></Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-coral-ink" /> Sales-intent conversations</h3>
          <div className="space-y-2.5">
            {salesConvos.length ? salesConvos.map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border border-line">
                <ChannelIcon channel={c.channel} className="w-7 h-7 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink text-sm">{c.person}</span>
                    <Badge tone="info">sales intent</Badge>
                  </div>
                  <p className="text-sm text-ink-soft mt-0.5 line-clamp-2">{c.messages[0]?.text}</p>
                </div>
                <Button size="sm" disabled={convert.isPending} onClick={() => toPipeline(c.id)}>
                  To pipeline <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )) : <p className="text-sm text-ink-faint">No sales-intent conversations right now.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-error" /> New leads to work</h3>
          <div className="space-y-2.5">
            {fresh.length ? fresh.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg border border-line">
                <Flame className={cn('w-4 h-4 shrink-0', HEAT[l.quality])} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink text-sm">{l.name}</div>
                  <div className="text-xs text-ink-faint">{l.interest || l.source}{l.value ? ` · ${inr(l.value)}` : ''}</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate('/app/pipeline')}>Work lead</Button>
              </div>
            )) : <p className="text-sm text-ink-faint">No new leads waiting — nice.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
