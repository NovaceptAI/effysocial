import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppAuthProvider } from '../app/context/AppAuth';
import { WorkspaceProvider } from '../app/context/WorkspaceContext';

// Render a page inside the real app providers (auth → workspace → query →
// router). Pair with mockApi(): AppAuthProvider loads GET /bootstrap on mount, so
// wait for the page with findBy* before interacting.
export function renderApp(ui, { route = '/', path = '*' } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <AppAuthProvider>
      <WorkspaceProvider>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={[route]}>
            <Routes><Route path={path} element={ui} /></Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </WorkspaceProvider>
    </AppAuthProvider>,
  );
}
