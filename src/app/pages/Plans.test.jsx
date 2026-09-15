import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Billing from './Billing';
import Admin from './Admin';
import Team from './Team';
import Clients from './Clients';
import { featureForPath, hasFeature } from '../plans';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import plans from '../../test/fixtures/plans';

// Plans in the app (G22). Payloads come from the engine's test flow.

describe('Billing', () => {
  it('shows the trial with its end date and everything it includes', async () => {
    mockApi({ 'GET /bootstrap': plans.trialEndingBootstrap, 'GET /billing/credits': { ...plans.trialEndedCredits, planInfo: plans.trialEndingBootstrap.org.planInfo, warning: null, used: 0 } });
    renderApp(<Billing />, { route: '/app/billing' });
    expect(await screen.findByRole('status')).toHaveTextContent('Your free trial includes everything in Pro and ends in 3 days');
    const includes = screen.getByRole('list', { name: 'What your plan includes' });
    expect(within(includes).getByText('Performance Marketing')).toBeInTheDocument();
    expect(within(includes).queryByText(/on Pro and above/)).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Workspaces' })).toHaveTextContent('1 / 3');
    expect(screen.getByRole('group', { name: 'Seats' })).toHaveTextContent('1 / 5');
  });

  it('after the trial, says so and shows what Creative doesn’t include', async () => {
    mockApi({ 'GET /bootstrap': plans.trialEndedBootstrap, 'GET /billing/credits': plans.trialEndedCredits });
    renderApp(<Billing />, { route: '/app/billing' });
    expect(await screen.findByRole('status')).toHaveTextContent('Your free trial has ended, so you’re on the free Creative plan.');
    const includes = screen.getByRole('list', { name: 'What your plan includes' });
    expect(includes).toHaveTextContent('Performance Marketing — on Growth and above');
    expect(includes).toHaveTextContent('Ads, landing pages, forms and leads — on Pro and above');
    expect(within(screen.getByRole('table', { name: 'Plans' })).getByText('yours').closest('tr')).toHaveTextContent('Creative');
  });

  it('warns as credits run out, without saying work is blocked', async () => {
    mockApi({ 'GET /bootstrap': plans.growthBootstrap, 'GET /billing/credits': plans.growthCreditsNear });
    const first = renderApp(<Billing />, { route: '/app/billing' });
    const credits = await screen.findByRole('group', { name: 'Credits this month' });
    await waitFor(() => expect(credits).toHaveTextContent('420 / 500'));
    expect(credits).toHaveTextContent('You’re close to this month’s allowance.');
    first.unmount();

    mockApi({ 'GET /bootstrap': plans.growthBootstrap, 'GET /billing/credits': plans.growthCreditsOver });
    renderApp(<Billing />, { route: '/app/billing' });
    const over = await screen.findByRole('group', { name: 'Credits this month' });
    await waitFor(() => expect(over).toHaveTextContent('510 / 500'));
    expect(over).toHaveTextContent('Work isn’t blocked yet');
  });
});

describe('Limits in the app', () => {
  it('a full plan disables inviting and says why', async () => {
    mockApi({ 'GET /bootstrap': plans.creativeBootstrap, 'GET /team': plans.creativeTeam });
    renderApp(<Team />, { route: '/app/team' });
    const invite = await screen.findByRole('button', { name: /invite member/i });
    await waitFor(() => expect(invite).toBeDisabled());
    expect(invite).toHaveAttribute('title', expect.stringContaining('The only seat on your Creative plan is taken'));
    expect(screen.getByRole('status')).toHaveTextContent('Upgrade in Billing, or remove someone.');
  });

  it('adding a workspace past the plan’s limit is disabled with the reason', async () => {
    mockApi({ 'GET /bootstrap': plans.creativeBootstrap, 'GET /workspaces/summary': { status: 'ok', clients: [] } });
    renderApp(<Clients />, { route: '/app/clients' });
    const add = await screen.findByRole('button', { name: /add client/i });
    expect(add).toBeDisabled();
    expect(add).toHaveAttribute('title', 'Your Creative plan includes 1 workspace. Upgrade in Billing for more.');
  });
});

describe('Admin — organisations and plans', () => {
  it('lists every organisation’s plan and usage, and changes a plan', async () => {
    const user = userEvent.setup();
    const org = plans.adminOrgs.orgs.find((o) => o.name === 'Northwind');
    const api = mockApi({
      'GET /bootstrap': plans.trialBootstrap,
      'GET /admin/usage': { status: 'ok', month: '2026-09-01', totals: { veo_video: 0, image: 0, tts_chars: 0, est_usd: 0 }, workspaces: [], platform: { users: 2, orgs: 2, workspaces: 2 }, limits: { veo_video: 20, image: 300 }, recent: [] },
      'GET /admin/settings': { status: 'ok', settings: { image_provider: 'flux', video_provider: 'free' } },
      'GET /admin/orgs': plans.adminOrgs,
      [`PATCH /admin/orgs/${org.id}`]: plans.adminSetPro,
    });
    renderApp(<Admin />, { route: '/app/admin' });
    const section = await screen.findByRole('region', { name: 'Organisations and plans' });
    const row = within(section).getByText('Northwind').closest('tr');
    expect(row).toHaveTextContent('asha@northwind.in');
    expect(within(row).getByRole('combobox', { name: 'Plan for Northwind' })).toHaveValue('Growth');
    expect(row).toHaveTextContent(`${org.creditsUsed} / 500`);
    await user.selectOptions(within(row).getByRole('combobox'), 'Pro');
    await waitFor(() => expect(api.callsTo(`PATCH /admin/orgs/${org.id}`).map((c) => c.body)).toEqual([{ plan: 'Pro' }]));
    expect(api.callsTo('GET /admin/orgs').length).toBeGreaterThan(1);
  });

  it('choosing Trial starts a fresh 14-day trial', async () => {
    const user = userEvent.setup();
    const org = plans.adminOrgs.orgs.find((o) => o.name === 'Northwind');
    const api = mockApi({
      'GET /bootstrap': plans.trialBootstrap,
      'GET /admin/usage': { status: 'ok', month: '2026-09-01', totals: { veo_video: 0, image: 0, tts_chars: 0, est_usd: 0 }, workspaces: [], platform: { users: 2, orgs: 2, workspaces: 2 }, limits: { veo_video: 20, image: 300 }, recent: [] },
      'GET /admin/settings': { status: 'ok', settings: { image_provider: 'flux', video_provider: 'free' } },
      'GET /admin/orgs': plans.adminOrgs,
      [`PATCH /admin/orgs/${org.id}`]: plans.adminSetPro,
    });
    renderApp(<Admin />, { route: '/app/admin' });
    const section = await screen.findByRole('region', { name: 'Organisations and plans' });
    await user.selectOptions(within(section).getByRole('combobox', { name: 'Plan for Northwind' }), 'Trial');
    await waitFor(() => expect(api.callsTo(`PATCH /admin/orgs/${org.id}`).map((c) => c.body)).toEqual([{ plan: 'Trial', trialDays: 14 }]));
  });
});

describe('Which pages need which plan', () => {
  it.each([
    ['/app/ads', 'conversion'], ['/app/pipeline/12', 'conversion'], ['/app/analytics/leads', 'conversion'], ['/app/sites', 'conversion'],
    ['/app/home', 'marketing'], ['/app/calendar', 'marketing'], ['/app/campaigns/4', 'marketing'], ['/app/analytics/organic', 'marketing'],
    ['/app', null], ['/app/studio', null], ['/app/films/3', null], ['/app/brand', null], ['/app/billing', null], ['/app/team', null],
    ['/app/analytics/acceptance', null], ['/app/adsx', null],
  ])('%s → %s', (path, feature) => {
    expect(featureForPath(path)).toBe(feature);
  });

  it('checks against the organisation’s plan', () => {
    const creative = plans.creativeBootstrap.org.planInfo;
    const growth = plans.growthBootstrap.org.planInfo;
    expect(hasFeature(creative, 'marketing')).toBe(false);
    expect(hasFeature(growth, 'marketing')).toBe(true);
    expect(hasFeature(growth, 'conversion')).toBe(false);
    expect(hasFeature(null, 'conversion')).toBe(true);
    expect(hasFeature(creative, null)).toBe(true);
  });
});
