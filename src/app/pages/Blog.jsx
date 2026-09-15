import React from 'react';
import { BookOpen } from 'lucide-react';
import { PageHeader, EmptyState } from '../../ui';
import NotifyMe from '../components/NotifyMe';

// The marketing and education blog lands here later; people can ask to hear when it does (G49).
export default function Blog() {
  return (
    <div>
      <PageHeader title="Blog" subtitle="Playbooks, growth guides and product stories for Indian SMBs." />
      <EmptyState
        icon={<BookOpen className="w-6 h-6" />}
        title="Coming soon"
        body="We're putting together practical guides on content, ads and growth."
        action={<NotifyMe feature="blog" />}
      />
    </div>
  );
}
