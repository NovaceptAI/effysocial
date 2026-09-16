import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Integrations from './Integrations';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/metaConnect';

// Connecting Instagram through Meta and knowing when access ends (launch plan 4.4,
// PUBL-012). Payloads come from the engine's test flow.
const card = () => screen.findByRole('group', { name: 'Instagram' });
const open = (integrations, handlers = {}) => {
  const api = mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /integrations': integrations, ...handlers });
  renderApp(<Integrations />, { route: '/app/integrations' });
  return api;
};

describe('Integrations — Meta connections', () => {
  it('sends Connect to Meta’s sign-in', async () => {
    const user = userEvent.setup();
    const href = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ href: '', search: '', set href(v) { href(v); } });
    open({ status: 'ok', integrations: fx.connected.integrations.map((i) => (i.provider === 'instagram' ? { ...i, state: 'available', account: '', accessEndsAt: null } : i)) },
      { 'POST /integrations/instagram/connect': fx.connectRedirect });
    await user.click(within(await card()).getByRole('button', { name: 'Connect' }));
    await waitFor(() => expect(href).toHaveBeenCalledWith(fx.connectRedirect.redirect));
    expect(fx.connectRedirect.redirect).toContain('facebook.com/v25.0/dialog/oauth');
    vi.restoreAllMocks();
  });

  it('shows when access ends', async () => {
    open(fx.connected);
    expect(await within(await card()).findByText('Access ends 15 Dec 2026.')).toBeInTheDocument();
  });

  it('asks to reconnect while there is still time', async () => {
    open(fx.endingSoon);
    const soon = within(await card());
    expect(soon.getByText('Access ends 21 Sept 2026 (4 days left) — reconnect to keep publishing.')).toBeInTheDocument();
    expect(soon.getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
  });

  it('shows an expired connection with a reconnect prompt (PUBL-012)', async () => {
    open(fx.expired);
    const expired = within(await card());
    expect(expired.getByText('Permission expired')).toBeInTheDocument();
    expect(expired.getByText('Access ended 15 Sept 2026 — reconnect to publish again.')).toBeInTheDocument();
    expect(expired.getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
    expect(expired.queryByRole('button', { name: 'Test post' })).not.toBeInTheDocument();
  });

  it('passes on Meta’s reason when a connection fails', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /integrations': fx.connected });
    renderApp(<Integrations />, { route: '/app/integrations?connected=instagram&status=exchange_failed&reason=No+Instagram+Business+account+is+linked+to+your+Facebook+Pages.' });
    expect(await screen.findByText(/No Instagram Business account is linked/)).toBeInTheDocument();
  });
});
