import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader, EmptyState, Button } from '../../ui';

// A persisted asset library (S3-backed) is a future slice — no mock data.
export default function MediaLibrary() {
  const { workspace } = useWorkspace();
  return (
    <div>
      <PageHeader title="Media Library" subtitle={`Brand assets and generated visuals for ${workspace.name}`} />
      <EmptyState
        icon="🖼️"
        title="Your media library is empty"
        body="Visuals you generate in AI Studio — and assets you upload — will be organised here with tags, usage and rights tracking. Generate your first image to get started."
        action={<Link to="/app/studio"><Button><Wand2 className="w-4 h-4" /> Create in AI Studio <ArrowRight className="w-3.5 h-3.5" /></Button></Link>}
      />
    </div>
  );
}
