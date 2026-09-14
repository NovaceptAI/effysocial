import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppAuthProvider, useAppAuth } from '../app/context/AppAuth';
import { WorkspaceProvider, useWorkspace } from '../app/context/WorkspaceContext';

// Like the app's RequireAuth: pages only mount once the session has loaded and
// a workspace is selected, so they can rely on `workspace` being set.
function SignedIn({ children }) {
  const { loading } = useAppAuth();
  const { workspace } = useWorkspace();
  return loading || !workspace ? null : children;
}

// Render a page inside the real app providers (auth → workspace → query →
// router). Pair with mockApi() — GET /bootstrap must be handled — and wait for
// the page with findBy* before interacting.
export function renderApp(ui, { route = '/', path = '*' } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <AppAuthProvider>
      <WorkspaceProvider>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={[route]}>
            <Routes><Route path={path} element={<SignedIn>{ui}</SignedIn>} /></Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </WorkspaceProvider>
    </AppAuthProvider>,
  );
}
