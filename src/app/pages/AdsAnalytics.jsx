import React from 'react';
import { Link } from 'react-router-dom';
import { Plug, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// Ad analytics needs a connected Meta/Google ad account — no sample data.
export default function AdsAnalytics() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader title="Advertising Analytics" subtitle={`Paid performance for ${workspace.name}`} />
      <EmptyState
        icon="📈"
        title="Connect an ad account"
        body="Spend, CPM, CTR, CPL and ROAS charts appear here once Meta Ads or Google Ads is connected — real numbers only."
        action={<Link to="/app/integrations"><Button><Plug className="w-4 h-4" /> Connect ad accounts <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
      />
    </div>
  );
}
