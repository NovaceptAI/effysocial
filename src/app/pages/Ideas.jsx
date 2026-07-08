import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowRight, Flame } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// Idea board persistence (effy_ideas) is a future slice — no mock data.
export default function Ideas() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader title="Ideas" subtitle={`Capture and develop content ideas for ${workspace.name}`} />
      <EmptyState
        icon="💡"
        title="No ideas captured yet"
        body="Save content ideas here from trends and mentions, then send them to AI Studio to draft. For now, jump straight into Studio or browse what's trending."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/app/studio"><Button><Wand2 className="w-4 h-4" /> Open AI Studio</Button></Link>
            <Link to="/app/trends"><Button variant="secondary"><Flame className="w-4 h-4" /> See trends <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        }
      />
    </div>
  );
}
