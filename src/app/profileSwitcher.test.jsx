import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppAuthProvider } from './context/AppAuth';
import { savedChoice, saveChoice } from './context/WorkspaceContext';
import ProfileSwitcher from './shell/ProfileSwitcher';
import { WorkEmailBanner } from './shell/AppShell';
import NoOrganisation from './pages/NoOrganisation';
import Onboarding from '../marketing/Onboarding';
import { mockApi, bootstrapFixture } from '../test/mockApi';
import { renderApp } from '../test/render';
import ob from '../test/fixtures/onboarding';

// Several profiles on one login (launch plan 6.15). Shapes follow the engine's
// _bootstrap_payload: `profiles` lists every profile, `current` marks the one in use.
const rao = { id: 1, name: 'Rao Dental', type: 'business', label: 'Business', role: 'Workspace admin', plan: 'Trial', isOwner: true };
const asha = { id: 2, name: 'Dr Asha Rao', type: 'personal_brand', label: 'Personal Brand', role: 'Workspace admin', plan: 'Creative', isOwner: true };
const inProfile = (org, { profiles = [rao, asha], ...rest } = {}) => ({
  ...bootstrapFixture,
  org: { ...bootstrapFixture.org, id: org.id, name: org.name, type: org.type, plan: org.plan },
  workspaces: [{ ...bootstrapFixture.workspaces[0], id: `ws_${org.id}`, dbId: org.id, name: org.name }],
  profiles: profiles.map((p) => ({ ...p, current: p.id === org.id })),
  newProfileTrial: false,
  ...rest,
});

function Where() {
  return <output aria-label="Current page">{useLocation().pathname}</output>;
}

afterEach(() => localStorage.clear());

describe('Profile switcher', () => {
  it('lists every profile on the login, marks the one in use, and switches to Home in another', async () => {
    const api = mockApi({ 'GET /bootstrap': inProfile(rao), 'POST /profiles/2/switch': inProfile(asha) });
    renderApp(<><ProfileSwitcher /><Where /></>, { route: '/app/calendar' });
    await userEvent.click(await screen.findByRole('button', { name: 'Profile: Rao Dental. Switch profile' }));
    const list = screen.getByRole('list', { name: 'Your profiles' });
    const items = within(list).getAllByRole('button');
    expect(items.map((b) => b.textContent)).toEqual([
      'Rao DentalBusiness · Workspace admin · Trial', 'Dr Asha RaoPersonal Brand · Workspace admin · Creative']);
    expect(items[0]).toHaveAttribute('aria-current', 'true');

    await userEvent.click(items[1]);
    expect(api.callsTo('POST /profiles/2/switch')).toHaveLength(1);
    expect(await screen.findByRole('button', { name: 'Profile: Dr Asha Rao. Switch profile' })).toBeInTheDocument();
    expect(screen.getByLabelText('Current page')).toHaveTextContent(/^\/app$/);
  });

  it('says why a switch failed and stays put', async () => {
    mockApi({ 'GET /bootstrap': inProfile(rao), 'POST /profiles/2/switch': [404, { status: 'error', message: 'You’re not part of that profile.' }] });
    renderApp(<><ProfileSwitcher /><Where /></>, { route: '/app/calendar' });
    await userEvent.click(await screen.findByRole('button', { name: /Switch profile/ }));
    await userEvent.click(screen.getByRole('button', { name: /Dr Asha Rao/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('You’re not part of that profile.');
    expect(screen.getByLabelText('Current page')).toHaveTextContent('/app/calendar');
  });
});

describe('Add account type', () => {
  it('adds a profile of the chosen type and carries on in its onboarding', async () => {
    const api = mockApi({ 'GET /bootstrap': inProfile(rao), 'POST /profiles': { ...inProfile(asha), trial: false } });
    renderApp(<><ProfileSwitcher /><Where /></>, { route: '/app' });
    await userEvent.click(await screen.findByRole('button', { name: /Switch profile/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Add account type' }));
    const dialog = screen.getByRole('dialog', { name: 'Add account type' });
    // The first profile used the free trial, so this one starts on Creative — said before adding.
    expect(within(dialog).getByRole('note')).toHaveTextContent('It starts on the free Creative plan');

    await userEvent.click(within(dialog).getByRole('radio', { name: /Personal Brand/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add profile' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Enter your name.');
    expect(api.callsTo('POST /profiles')).toHaveLength(0);

    await userEvent.type(within(dialog).getByLabelText('Your name'), 'Dr Asha Rao');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add profile' }));
    expect(api.callsTo('POST /profiles')[0].body).toEqual({ type: 'personal_brand', name: 'Dr Asha Rao' });
    expect(await screen.findByLabelText('Current page')).toHaveTextContent('/onboarding');
  });

  it('says when the new profile comes with the trial', async () => {
    mockApi({ 'GET /bootstrap': inProfile(rao, { newProfileTrial: true }) });
    renderApp(<ProfileSwitcher />);
    await userEvent.click(await screen.findByRole('button', { name: /Switch profile/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Add account type' }));
    expect(screen.getByRole('note')).toHaveTextContent('It comes with a 14-day free trial of Pro.');
  });

  it('is offered to someone who is no longer in any team', async () => {
    const api = mockApi({
      'GET /bootstrap': { ...bootstrapFixture, org: null, workspaces: [], role: null, profiles: [], newProfileTrial: true },
      'POST /profiles': { ...inProfile(asha), trial: true },
    });
    render(
      <AppAuthProvider>
        <MemoryRouter initialEntries={['/app']}>
          <Routes><Route path="*" element={<><NoOrganisation /><Where /></>} /></Routes>
        </MemoryRouter>
      </AppAuthProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Create your own profile' }));
    const dialog = screen.getByRole('dialog', { name: 'Add account type' });
    await userEvent.type(within(dialog).getByLabelText('Business name'), 'Kiran Bakes');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add profile' }));
    expect(api.callsTo('POST /profiles')[0].body).toEqual({ type: 'business', name: 'Kiran Bakes' });
    expect(await screen.findByLabelText('Current page')).toHaveTextContent('/onboarding');
  });
});

describe('The chosen workspace, per profile', () => {
  it('is remembered separately for each profile', () => {
    saveChoice(7, 1, 'ws_1');
    saveChoice(7, 2, 'ws_9');
    expect(savedChoice(7, 1)).toBe('ws_1');
    expect(savedChoice(7, 2)).toBe('ws_9');
    expect(savedChoice(8, 1)).toBeNull();                        // another login on this browser
  });

  it('still reads a choice saved before profiles existed', () => {
    localStorage.setItem('effy.workspace', JSON.stringify({ user: 7, workspace: 'ws_3' }));
    expect(savedChoice(7, 1)).toBe('ws_3');
  });
});

describe('Onboarding on the Creative plan', () => {
  it('offers content creation and says marketing comes with an upgrade', async () => {
    const creative = { ...ob.bootstrapFresh, org: { ...ob.bootstrapFresh.org, planInfo: { plan: 'Creative', features: [], limits: {}, usage: {} } } };
    mockApi({
      'GET /bootstrap': creative,
      'GET /onboarding': { ...ob.fresh, onboarding: { orgType: 'personal_brand', details: { name: 'Dr Asha Rao' }, step: 'offer' } },
    });
    render(
      <AppAuthProvider>
        <MemoryRouter initialEntries={['/onboarding']}><Routes><Route path="/onboarding" element={<Onboarding />} /></Routes></MemoryRouter>
      </AppAuthProvider>,
    );
    expect(await screen.findByRole('radio', { name: /Create content/ })).toBeEnabled();
    expect(screen.getByRole('radio', { name: /Market and grow/ })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /^Both/ })).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent('This profile is on the free Creative plan');
  });
});

describe('Work email banner for teammates who can’t verify', () => {
  it('says an owner or admin can verify it, with no link', async () => {
    const business = { type: 'business', label: 'Business', desc: 'We market our own company or shop.', clientFeatures: true,
      workEmail: { email: null, verified: false, verifiedAt: null, pending: null } };
    mockApi({ 'GET /bootstrap': { ...bootstrapFixture, role: 'Copywriter', org: { ...bootstrapFixture.org, profile: business } } });
    renderApp(<WorkEmailBanner />);
    const banner = await screen.findByRole('note', { name: 'Work email' });
    expect(banner).toHaveTextContent('An owner or admin can verify it.');
    expect(screen.queryByRole('link', { name: 'Verify now' })).not.toBeInTheDocument();
  });
});
