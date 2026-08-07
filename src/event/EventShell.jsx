import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from '../app/context/WorkspaceContext';
import EventKiosk from './EventKiosk';

// Disposable event kiosk root. Mirrors AppRoot's providers so the reused studio
// components work, but renders full-screen with no product shell. Sits inside
// AppAuthProvider (App.jsx) behind RequireAuth. Delete this folder + the /event
// route to remove the feature entirely.
const queryClient = new QueryClient();

export default function EventShell() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <EventKiosk />
      </WorkspaceProvider>
    </QueryClientProvider>
  );
}
