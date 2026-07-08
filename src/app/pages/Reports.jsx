import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// Report builder + saved reports (persisted, built from real analytics) is a
// future slice — no mock data / no fabricated metrics.
export default function Reports() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader title="Reports" subtitle={`White-label performance reports for ${workspace.name}`} />
      <EmptyState
        icon="📄"
        title="No reports yet"
        body="Build white-label client reports from your real organic, ads, leads and revenue data — with AI-written summaries. Reports populate once you have connected channels and campaign activity."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/app/analytics/organic"><Button><BarChart3 className="w-4 h-4" /> View analytics</Button></Link>
            <Link to="/app/integrations"><Button variant="secondary">Connect channels <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        }
      />
    </div>
  );
}
