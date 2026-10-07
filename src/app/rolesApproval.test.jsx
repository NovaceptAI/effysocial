import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import PostDialog from './components/PostDialog';
import ShareRow from './components/ShareRow';
import NavRail from './shell/NavRail';
import { mockApi } from '../test/mockApi';
import { renderApp } from '../test/render';
import settingsFx from '../test/fixtures/settings';
import postFx from '../test/fixtures/postActions';

// Settings → Roles & client approval (launch plan 6.16). Shapes follow the engine's
// serialize_profile: `profile.settings` holds the four switches, each off until turned on.
const OFF = { clientsPage: false, clientApprover: false, clientReview: false, requireApproval: false };
const business = (settings = {}, clientFeatures = true) => ({
  type: 'business', label: 'Business', desc: 'We market our own company or shop.', clientFeatures,
  settings: { ...OFF, ...settings },
});
const withProfile = (boot, profile, role) => ({ ...boot, ...(role ? { role } : {}), org: { ...boot.org, profile } });

function openSettings(boot, extra = {}) {
  const api = mockApi({ 'GET /bootstrap': boot, 'GET /auth/2fa': settingsFx.statusOff, 'GET /onboarding': settingsFx.onboarding, ...extra });
  renderApp(<Settings />, { route: '/app/settings' });
  return api;
}

describe('Settings → Roles & client approval', () => {
  it('lists the four switches, all off, and turns one on', async () => {
    const user = userEvent.setup();
    let boot = withProfile(settingsFx.bootstrap, business(), 'Workspace admin');
    const api = openSettings(() => boot, {
      'PATCH /profile/settings': (body) => {
        boot = withProfile(settingsFx.bootstrap, business({ clientApprover: true, clientReview: true }), 'Workspace admin');
        return { status: 'ok', profile: boot.org.profile, body };
      },
    });
    const section = await screen.findByRole('region', { name: 'Roles & client approval' });
    const switches = within(section).getAllByRole('switch');
    expect(switches.map((s) => [s.getAttribute('aria-label'), s.getAttribute('aria-checked')])).toEqual([
      ['Clients page', 'false'], ['Client approver role', 'false'], ['Client review stage', 'false'],
      ['Require approval before publishing', 'false']]);

    await user.click(within(section).getByRole('switch', { name: 'Client approver role' }));
    expect(api.callsTo('PATCH /profile/settings')[0].body).toEqual({ clientApprover: true });
    // The role brings the client review stage with it (engine), and the page shows what was saved.
    await waitFor(() => expect(within(section).getByRole('switch', { name: 'Client review stage' })).toHaveAttribute('aria-checked', 'true'));
    expect(await screen.findByRole('status')).toHaveTextContent('Client approver role turned on.');
  });

  it('says why a switch can’t go off', async () => {
    const user = userEvent.setup();
    openSettings(withProfile(settingsFx.bootstrap, business({ clientApprover: true, clientReview: true }), 'Workspace admin'), {
      'PATCH /profile/settings': [409, { status: 'error', message: 'Meera Iyer is a Client approver. Change their role or cancel the invite first.' }],
    });
    const section = await screen.findByRole('region', { name: 'Roles & client approval' });
    await user.click(within(section).getByRole('switch', { name: 'Client approver role' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Meera Iyer is a Client approver.');
  });

  it('is read-only for teammates', async () => {
    openSettings(withProfile(settingsFx.bootstrap, business({ requireApproval: true }), 'Copywriter'));
    const section = await screen.findByRole('region', { name: 'Roles & client approval' });
    expect(within(section).getByText('Set by your organisation’s owners and admins.')).toBeInTheDocument();
    within(section).getAllByRole('switch').forEach((s) => expect(s).toBeDisabled());
  });

  it('isn’t offered to a Personal Brand', async () => {
    openSettings(withProfile(settingsFx.bootstrap, { ...business({}, false), type: 'personal_brand', label: 'Personal Brand' }, 'Workspace admin'));
    await screen.findByRole('region', { name: 'Organisation' });
    expect(screen.queryByRole('region', { name: 'Roles & client approval' })).not.toBeInTheDocument();
  });
});

describe('The Clients page follows its switch', () => {
  it('says where to turn it on while it’s off', async () => {
    mockApi({ 'GET /bootstrap': withProfile(settingsFx.bootstrap, business(), 'Workspace admin') });
    renderApp(<Clients />, { route: '/app/clients' });
    expect(await screen.findByRole('heading', { name: 'The Clients page is off' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Settings' })).toHaveAttribute('href', '/app/settings');
  });

  it('appears in the menu only once it’s on', async () => {
    const user = userEvent.setup();
    for (const [clientsPage, shown] of [[false, false], [true, true]]) {
      mockApi({ 'GET /bootstrap': withProfile(settingsFx.bootstrap, business({ clientsPage }), 'Workspace admin') });
      const { unmount } = renderApp(<NavRail />, { route: '/app/home' });
      await user.click(await screen.findByRole('button', { name: /Admin/ }));
      expect(!!screen.queryByRole('link', { name: 'Clients' })).toBe(shown);
      unmount();
    }
  });

  it('the hub menu has Admin too, and no Settings or Pricing of its own', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': withProfile(settingsFx.bootstrap, business(), 'Workspace admin') });
    renderApp(<NavRail />, { route: '/app' });
    expect(await screen.findByRole('link', { name: 'AI Studio' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Admin/ }));
    for (const name of ['Team', 'Billing', 'Settings']) expect(screen.getByRole('link', { name })).toBeInTheDocument();
  });
});

describe('Require approval before publishing', () => {
  const boot = (requireApproval) => withProfile(postFx.bootstrap, business({ requireApproval }));

  it('a new post can only be saved or sent for review, and says why', async () => {
    mockApi({ 'GET /bootstrap': boot(true) });
    renderApp(<PostDialog open onClose={() => {}} initial={{ date: '', time: '' }} />);
    const d = await screen.findByRole('dialog');
    expect(within(d).getByRole('note')).toHaveTextContent('Posts here need approval before they’re scheduled or published.');
    expect(within(d).queryByRole('button', { name: 'Schedule' })).not.toBeInTheDocument();
    expect(within(d).queryByRole('button', { name: 'Publish now' })).not.toBeInTheDocument();
    expect(within(d).getByRole('button', { name: 'Send for review' })).toBeInTheDocument();
  });

  it('without it a new post can still be scheduled straight away', async () => {
    mockApi({ 'GET /bootstrap': boot(false) });
    renderApp(<PostDialog open onClose={() => {}} initial={{ date: '', time: '' }} />);
    const d = await screen.findByRole('dialog');
    expect(within(d).getByRole('button', { name: 'Schedule' })).toBeInTheDocument();
    expect(within(d).queryByRole('note')).not.toBeInTheDocument();
  });

  it('AI Studio sends to approval instead of publishing straight to Instagram', async () => {
    mockApi({ 'GET /bootstrap': boot(true), 'GET /integrations': { status: 'ok', integrations: [{ provider: 'instagram', state: 'connected' }] } });
    renderApp(<ShareRow imageUrl="https://cdn.example.in/offer.jpg" caption="Hello" />);
    expect(await screen.findByRole('button', { name: /Instagram — needs approval/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Publish to Instagram/ })).not.toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('send this to approval');
  });
});
