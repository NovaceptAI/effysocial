import React from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../nav';
import { PageHeader, EmptyState, Button } from '../../ui';

// Temporary scaffold for routes not yet built — keeps the whole nav navigable
// inside the shell and labels phase availability honestly.
export default function ModulePlaceholder() {
  const { pathname } = useLocation();
  const item = NAV_ITEMS.find((i) => i.to === pathname) || { label: 'Module', group: '', phase: 1 };
  const soon = item.phase > 1;

  return (
    <div>
      <PageHeader title={item.label} subtitle={item.group} />
      <EmptyState
        icon="✦"
        title={soon ? `${item.label} arrives in Phase ${item.phase}` : `${item.label} — coming up in this build`}
        body={
          soon
            ? 'This module is part of the performance-marketing / advanced phases. The screen and data model are planned; the shell is ready for it.'
            : 'This Phase 1 screen is next in the build queue. The navigation, theme and data layer are all wired — content lands here shortly.'
        }
        action={!soon && <Button variant="secondary">Notify me when ready</Button>}
      />
    </div>
  );
}
