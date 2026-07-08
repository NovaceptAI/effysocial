import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// Marketing Plan will generate from real campaigns + Brand Brain (backend TBD).
// No mock data — honest empty state until that lands.
export default function MarketingPlan() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader
        title="Marketing Plan"
        subtitle={`AI-guided monthly strategy for ${workspace.name}`}
      />
      <EmptyState
        icon="🧭"
        title="No plan yet"
        body="Your AI marketing plan — content pillars, organic/paid split, budget and KPIs — will be generated from your Brand Brain and live campaigns. Start by launching a campaign; plan generation lands with it."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/app/launch"><Button><Rocket className="w-4 h-4" /> Launch a campaign</Button></Link>
            <Link to="/app/brand"><Button variant="secondary"><Sparkles className="w-4 h-4" /> Build Brand Brain <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        }
      />
    </div>
  );
}
