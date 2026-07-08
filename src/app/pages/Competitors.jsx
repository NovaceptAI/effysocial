import React from 'react';
import { Link } from 'react-router-dom';
import { Plug, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// Competitor tracking needs connected channels / user-added competitors —
// the earlier sample rows are gone. Honest empty state until that lands.
export default function Competitors() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader title="Competitors" subtitle={`Benchmark posting, engagement and share of voice for ${workspace.name}`} />
      <EmptyState
        icon="⚔️"
        title="No competitors tracked yet"
        body="Competitor benchmarking — posting frequency, engagement and share of voice — activates once channels are connected and competitors are added. Coming with channel sync."
        action={<Link to="/app/integrations"><Button><Plug className="w-4 h-4" /> Connect channels <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
      />
    </div>
  );
}
