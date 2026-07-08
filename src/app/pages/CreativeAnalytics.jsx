import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// Creative performance compares your REAL published posts/ads — no sample data.
export default function CreativeAnalytics() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader title="Creative Performance" subtitle={`Which formats, hooks and visuals work for ${workspace.name}`} />
      <EmptyState
        icon="🎬"
        title="No creatives to analyse yet"
        body="Once you publish posts (and later, ads), EffySocial compares formats, hooks and visuals to show what actually performs. Create and publish your first piece to begin."
        action={<Link to="/app/studio"><Button><Wand2 className="w-4 h-4" /> Create in AI Studio <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
      />
    </div>
  );
}
