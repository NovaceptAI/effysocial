import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// A curated, brand-locked template gallery is a future slice — no mock data.
export default function Templates() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader title="Templates" subtitle={`Reusable, brand-locked content templates for ${workspace.name}`} />
      <EmptyState
        icon="🎨"
        title="Templates are coming"
        body="Brand-locked templates with dynamic fields will let you spin up on-brand posts in seconds. Until then, AI Studio generates on-brand content from a brief."
        action={<Link to="/app/studio"><Button><Wand2 className="w-4 h-4" /> Create in AI Studio <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
      />
    </div>
  );
}
