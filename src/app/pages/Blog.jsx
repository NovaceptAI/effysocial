import React from 'react';
import { BookOpen } from 'lucide-react';
import { PageHeader, EmptyState } from '../../ui';

// Placeholder — the marketing/education blog lands here later.
export default function Blog() {
  return (
    <div>
      <PageHeader title="Blog" subtitle="Playbooks, growth guides and product stories for Indian SMBs." />
      <EmptyState
        icon={<BookOpen className="w-6 h-6" />}
        title="Coming soon"
        body="We're putting together practical guides on content, ads and growth. Check back shortly."
      />
    </div>
  );
}
