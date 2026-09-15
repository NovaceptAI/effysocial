import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketingPlan from './MarketingPlan';
import AppLauncher from './AppLauncher';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import ob from '../../test/fixtures/onboarding';

// The plan generated in onboarding stays visible on Marketing Plan (ONB-003), and
// Home offers to resume an unfinished onboarding. Payloads from the engine's test flow.
describe('Marketing Plan page', () => {
  it('shows the plan generated during onboarding', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, 'GET /marketing-plan': { status: 'ok', plan: ob.plan.plan } });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    expect(await screen.findByText(ob.plan.plan.plan.summary)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Content pillars' })).toHaveTextContent('Educational40%');
    expect(screen.getByText(/for: Generate leads, Get phone calls/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /write a new plan/i })).toBeInTheDocument();
  });

  it('a channel without a weekly cadence doesn’t say “0 a week”', async () => {
    const record = ob.plan.plan;
    const plan = { ...record, plan: { ...record.plan, channels: [...record.plan.channels, { channel: 'google_business', postsPerWeek: 0, role: 'Answer reviews' }] } };
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, 'GET /marketing-plan': { status: 'ok', plan } });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    const channels = await screen.findByRole('region', { name: 'Channels and cadence' });
    expect(channels).toHaveTextContent('Instagram · 4 a week');
    expect(channels).toHaveTextContent('Google Business Profile · no set cadence');
    expect(channels).not.toHaveTextContent('0 a week');
  });

  it('generates a plan when there is none', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': ob.bootstrapCompleted,
      'GET /marketing-plan': { status: 'ok', plan: null },
      'POST /marketing-plan': ob.plan,
    });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    await user.click(await screen.findByRole('button', { name: /generate plan/i }));
    expect(await screen.findByText(ob.plan.plan.plan.summary)).toBeInTheDocument();
    expect(api.callsTo('POST /marketing-plan').map((c) => c.body)).toEqual([{ workspace: ob.bootstrapCompleted.workspaces[0].id }]);
  });

  it('shows why a plan couldn’t be written', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': ob.bootstrapCompleted,
      'GET /marketing-plan': { status: 'ok', plan: null },
      'POST /marketing-plan': [ob.planFailed.status, ob.planFailed.body],
    });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    await user.click(await screen.findByRole('button', { name: /generate plan/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(ob.planFailed.body.message);
  });

  it('read-only roles can see a plan but not generate one', async () => {
    mockApi({ 'GET /bootstrap': { ...ob.bootstrapCompleted, role: 'View-only' }, 'GET /marketing-plan': { status: 'ok', plan: null } });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    expect(await screen.findByText(/Someone who can edit content can generate one/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /generate plan/i })).not.toBeInTheDocument();
  });
});

describe('Home — unfinished onboarding', () => {
  const home = { 'GET /films': { films: [] }, 'GET /product-shots': { shots: [] }, 'GET /library': { media: [] } };

  it('offers to continue setting up until onboarding is finished', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, ...home });
    renderApp(<AppLauncher />, { route: '/app' });
    const card = await screen.findByRole('region', { name: 'Finish setting up' });
    expect(within(card).getByRole('button', { name: /continue setup/i })).toBeInTheDocument();
  });

  it('is gone once onboarding is finished, and hidden from roles that can’t set up', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, ...home });
    const done = renderApp(<AppLauncher />, { route: '/app' });
    await screen.findByText(/Welcome back/);
    expect(screen.queryByRole('region', { name: 'Finish setting up' })).not.toBeInTheDocument();
    done.unmount();

    mockApi({ 'GET /bootstrap': { ...ob.bootstrapFresh, role: 'Copywriter' }, ...home });
    renderApp(<AppLauncher />, { route: '/app' });
    await screen.findByText(/Welcome back/);
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Finish setting up' })).not.toBeInTheDocument());
  });
});
