import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader, EmptyState, Button } from '../../ui';

// An address inside the app that isn't a page — shown inside the shell, never blank (SHELL-009).
export default function ModulePlaceholder() {
  const { pathname } = useLocation();
  return (
    <div>
      <PageHeader title="Page not found" subtitle={pathname} />
      <EmptyState
        icon="✦"
        title="We couldn’t find that page"
        body="The link may be old or mistyped. Everything EffySocial does is in the menu."
        action={<Link to="/app"><Button variant="secondary">Go to Home</Button></Link>}
      />
    </div>
  );
}
