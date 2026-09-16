import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CampaignWorkspace from './CampaignWorkspace';
import Campaigns from './Campaigns';
import { AssistantProvider, AssistantSurface } from '../context/AssistantContext';
import { useLocation } from 'react-router-dom';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/campaign';

// A campaign's workspace shows what is really linked to it (launch plan 5.1, CAMP-005,
// CAMP-007). Payloads come from the engine's test flow.
const c = fx.workspace.campaign;
const open = (handlers = {}, workspace = fx.workspace) => {
  const api = mockApi({ 'GET /bootstrap': fx.bootstrap, [`GET /campaigns/${c.id}/workspace`]: workspace, ...handlers });
  renderApp(<AssistantProvider><CampaignWorkspace /><AssistantSurface /></AssistantProvider>, { route: `/app/campaigns/${c.id}`, path: '/app/campaigns/:id' });
  return api;
};
const tab = async (name) => userEvent.click(await screen.findByRole('button', { name, exact: true }));

describe('Campaign workspace', () => {
  it('opens on what the campaign adds up to', async () => {
    open();
    expect(await screen.findByRole('heading', { name: c.name })).toBeInTheDocument();
    expect(screen.getByText(/Lead generation · 2026/)).toBeInTheDocument();
    expect(screen.getByText('2 qualified')).toBeInTheDocument();
    expect(screen.getByText('1 won')).toBeInTheDocument();
    expect(screen.getByText('Funnel — content to revenue')).toBeInTheDocument();
    expect(screen.getAllByText('₹12.0K spent').length).toBeGreaterThan(0);
  });

  it('every tab shows the campaign’s own rows (CAMP-007)', async () => {
    open();
    await screen.findByRole('heading', { name: c.name });

    await tab('Plan');
    expect(screen.getByText(/is 40% of your marketing plan/)).toBeInTheDocument();
    expect(screen.getByText('Reels and carousels')).toBeInTheDocument();
    expect(screen.getByText(/Aim for 20 this month/)).toBeInTheDocument();

    await tab('Content');
    expect(screen.getByRole('button', { name: /Terrace before and after/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Monsoon offer/ })).toBeInTheDocument();

    await tab('Ads');
    expect(screen.getByText(/EffySocial doesn’t run ads yet/)).toBeInTheDocument();
    expect(screen.getByText('1,240 reach · 10.9% engagement')).toBeInTheDocument();

    await tab('Conversion');
    expect(screen.getByText('Monsoon landing')).toBeInTheDocument();
    expect(screen.getByText('Monsoon enquiry')).toBeInTheDocument();

    await tab('Leads');
    expect(screen.getByRole('table')).toHaveTextContent('Asha Rao');
    expect(screen.getByRole('table')).toHaveTextContent('₹50.0K');

    await tab('Analytics');
    expect(screen.getByText('0 scheduled')).toBeInTheDocument();
    expect(screen.getByText('Leads by stage')).toBeInTheDocument();

    await tab('Activity');
    expect(screen.getByText('Campaign “Monsoon Drive” created')).toBeInTheDocument();
    expect(screen.getByText(/Lead Asha Rao arrived from form — won/)).toBeInTheDocument();
    expect(screen.queryByText(/next in the build/)).not.toBeInTheDocument();
  });

  it('a campaign with nothing in it reads as zeros, not as invented numbers', async () => {
    open({}, fx.emptyWorkspace);
    await screen.findByRole('heading', { name: fx.emptyWorkspace.campaign.name });
    expect(screen.getByText('no leads yet')).toBeInTheDocument();
    await tab('Leads');
    expect(screen.getByRole('heading', { name: 'No leads yet' })).toBeInTheDocument();
    await tab('Plan');
    expect(screen.getByRole('heading', { name: 'No marketing plan yet' })).toBeInTheDocument();
  });

  it('Edit saves the campaign', async () => {
    const user = userEvent.setup();
    const api = open({ [`PATCH /campaigns/${c.id}`]: fx.edited });
    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit campaign' });
    const name = within(dialog).getByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Monsoon Drive 2026');
    await user.selectOptions(within(dialog).getByLabelText('Status'), 'live');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(api.callsTo(`PATCH /campaigns/${c.id}`)).toHaveLength(1));
    expect(api.callsTo(`PATCH /campaigns/${c.id}`)[0].body).toMatchObject({
      name: 'Monsoon Drive 2026', status: 'live', objective: c.objective, channels: c.channels, budget: c.budget,
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Ask Effy opens the assistant with the campaign’s question', async () => {
    const user = userEvent.setup();
    const api = open({ 'POST /assistant/chat': fx.assistantReply, 'GET /assistant/recommendations': { status: 'ok', recommendations: [] } });
    await user.click(await screen.findByRole('button', { name: /ask effy/i }));
    expect(await screen.findByText(fx.assistantReply.reply)).toBeInTheDocument();
    expect(api.callsTo('POST /assistant/chat')[0].body.message).toBe(`How is the campaign “${c.name}” doing, and what should I change?`);
  });
});

const Where = () => { const l = useLocation(); return <output aria-label="location">{l.pathname}</output>; };

describe('Campaigns list', () => {
  it('New campaign opens the wizard (CAMP-005)', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /campaigns': fx.campaigns });
    renderApp(<><Campaigns /><Where /></>, { route: '/app/campaigns' });
    await user.click(await screen.findByRole('button', { name: /new campaign/i }));
    expect(screen.getByRole('status', { name: 'location' })).toHaveTextContent('/app/launch');
  });

  it('the empty state’s Create campaign opens the wizard too (CAMP-005)', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /campaigns': { status: 'ok', campaigns: [] } });
    renderApp(<><Campaigns /><Where /></>, { route: '/app/campaigns' });
    await user.click(await screen.findByRole('button', { name: 'Create campaign' }));
    expect(screen.getByRole('status', { name: 'location' })).toHaveTextContent('/app/launch');
  });
});
