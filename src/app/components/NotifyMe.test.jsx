import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from '../pages/Blog';
import Admin from '../pages/Admin';
import ModulePlaceholder from '../pages/ModulePlaceholder';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/interest';

// “Notify me when ready” (G49, SHELL-010) and the in-shell page for unknown addresses
// (SHELL-009). Payloads come from the engine's test flow.
describe('Notify me when ready', () => {
  it('records the ask and confirms who will be told', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /interest': fx.none, 'POST /interest': fx.asked });
    renderApp(<Blog />, { route: '/app/blog' });
    const button = await screen.findByRole('button', { name: /notify me when ready/i });
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);
    expect(await screen.findByRole('status')).toHaveTextContent('You’re on the list. We’ll email asha@northwind.in when Blog is ready.');
    expect(screen.getByText('We’ll let you know')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /notify me when ready/i })).not.toBeInTheDocument();
    expect(api.callsTo('POST /interest').map((c) => c.body)).toEqual([{ feature: 'blog' }]);
  });

  it('remembers an earlier ask', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /interest': fx.afterAsk });
    renderApp(<Blog />, { route: '/app/blog' });
    expect(await screen.findByText('We’ll let you know')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /notify me when ready/i })).not.toBeInTheDocument();
  });

  it('says so when the ask fails', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /interest': fx.none, 'POST /interest': [fx.unknown.status, fx.unknown.body] });
    renderApp(<Blog />, { route: '/app/blog' });
    const button = await screen.findByRole('button', { name: /notify me when ready/i });
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent(fx.unknown.body.message);
  });

  it('platform admins see who asked for what', async () => {
    mockApi({
      'GET /bootstrap': fx.bootstrap,
      'GET /admin/usage': { status: 'ok', month: '2026-09-01', totals: { veo_video: 0, image: 0, tts_chars: 0, est_usd: 0 }, workspaces: [], platform: { users: 1, orgs: 1, workspaces: 1 }, limits: { veo_video: 20, image: 300 }, recent: [] },
      'GET /admin/interest': fx.admin,
    });
    renderApp(<Admin />, { route: '/app/admin' });
    const section = await screen.findByRole('region', { name: 'Interest in coming features' });
    const blog = within(section).getByText('Blog').closest('li');
    expect(blog).toHaveTextContent('1');
    expect(blog).toHaveTextContent('asha@northwind.in (Northwind)');
    expect(within(section).getByText('Dealer voice cloning').closest('li')).toHaveTextContent('0');
  });
});

describe('Unknown addresses', () => {
  it('show a page-not-found inside the app, with no notify button', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap });
    renderApp(<ModulePlaceholder />, { route: '/app/does-not-exist' });
    expect(await screen.findByText('We couldn’t find that page')).toBeInTheDocument();
    expect(screen.getByText('/app/does-not-exist')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to home/i })).toHaveAttribute('href', '/app');
    expect(screen.queryByRole('button', { name: /notify me/i })).not.toBeInTheDocument();
  });
});
