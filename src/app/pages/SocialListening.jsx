import React from 'react';
import { Link } from 'react-router-dom';
import { Plug, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// Social listening needs a connected channel + a listening data source (Meta/
// X/Google). No mock — honest "connect to see mentions" state until wired.
export default function SocialListening() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader title="Social Listening" subtitle={`Mentions, sentiment and intent for ${workspace.name}`} />
      <EmptyState
        icon="📡"
        title="Connect a channel to start listening"
        body="Social Listening surfaces brand mentions, sentiment and buying-intent from your connected platforms — then turns high-intent mentions into leads. It activates once you connect Instagram, Facebook or other channels."
        action={<Link to="/app/integrations"><Button><Plug className="w-4 h-4" /> Connect channels <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
      />
    </div>
  );
}
