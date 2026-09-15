import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CampaignLaunch from './CampaignLaunch';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import actions from '../../test/fixtures/postActions';

const campaign = (overrides = {}) => ({ id: 42, name: 'Monsoon Checkup Drive', objective: 'Lead generation', budget: 40000, ...overrides });
const assembly = { steps: [], counts: {} };

async function openStepOne(api) {
  renderApp(<CampaignLaunch />, { route: '/app/launch' });
  const name = await screen.findByPlaceholderText('e.g. Monsoon Checkup Drive');
  await waitFor(() => expect(api.callsTo('GET /bootstrap')).toHaveLength(1));
  return { name, budget: screen.getByRole('spinbutton') };
}

describe('Campaign Launch — step 1 (CAMP-001, CAMP-002, CAMP-003)', () => {
  it('blocks a blank, zero or negative budget with a visible reason', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'GET /bootstrap': bootstrapFixture });
    const { name, budget } = await openStepOne(api);
    await user.type(name, 'Monsoon Checkup Drive');
    const create = screen.getByRole('button', { name: /create & continue/i });

    for (const value of ['', '0', '-5']) {
      await user.clear(budget);
      if (value) await user.type(budget, value);
      expect(screen.getByText('Enter a budget above ₹0.')).toBeInTheDocument();
      expect(create).toBeDisabled();
    }
    await user.clear(budget);
    await user.type(budget, '25000');
    expect(screen.queryByText('Enter a budget above ₹0.')).not.toBeInTheDocument();
    expect(create).toBeEnabled();
  });

  it('requires a name before creating', async () => {
    const api = mockApi({ 'GET /bootstrap': bootstrapFixture });
    await openStepOne(api);
    expect(screen.getByRole('button', { name: /create & continue/i })).toBeDisabled();
  });

  it('creates once, then updates instead of duplicating when step 1 is revisited', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': bootstrapFixture,
      'POST /campaigns': (body) => ({ status: 'ok', campaign: campaign({ name: body.name, budget: body.budget }) }),
      'PATCH /campaigns/42': (body) => ({ status: 'ok', campaign: campaign({ name: body.name, budget: body.budget }) }),
      'GET /campaigns/42/assembly': assembly,
    });
    const { name, budget } = await openStepOne(api);
    await user.type(name, '  Monsoon Checkup Drive ');
    await user.clear(budget);
    await user.type(budget, '25000');
    await user.click(screen.getByRole('button', { name: /create & continue/i }));

    await screen.findByText('Create content');
    expect(api.callsTo('POST /campaigns')).toHaveLength(1);
    expect(api.callsTo('POST /campaigns')[0].body).toMatchObject({ workspace: 'ws_1', name: 'Monsoon Checkup Drive', budget: 25000 });

    await user.click(screen.getByRole('button', { name: /back/i }));
    const renamed = await screen.findByPlaceholderText('e.g. Monsoon Checkup Drive');
    await user.clear(renamed);
    await user.type(renamed, 'Monsoon Smile Week');
    await user.click(screen.getByRole('button', { name: /update & continue/i }));

    await screen.findByText('Create content');
    expect(api.callsTo('POST /campaigns')).toHaveLength(1);
    expect(api.callsTo('PATCH /campaigns/42')).toHaveLength(1);
    expect(api.callsTo('PATCH /campaigns/42')[0].body).toMatchObject({ name: 'Monsoon Smile Week' });
    expect(api.unhandled).toEqual([]);
  });
});

describe('Campaign Launch — Create ad from a published post (PUBL-018)', () => {
  it('starts from the post and attaches it to the new campaign', async () => {
    const user = userEvent.setup();
    const live = actions.publishedNow.post;
    const api = mockApi({
      'GET /bootstrap': actions.bootstrap,
      'GET /posts': actions.posts,
      'POST /campaigns': actions.campaign,
      [`PATCH /posts/${live.id}`]: actions.postLinked,
      [`GET /campaigns/${actions.campaign.campaign.id}/assembly`]: { status: 'ok', checklist: [], counts: {} },
    });
    renderApp(<CampaignLaunch />, { route: `/app/launch?post=${live.id}` });
    expect(await screen.findByText('Creating an ad from a post')).toBeInTheDocument();
    const name = screen.getByPlaceholderText('e.g. Monsoon Checkup Drive');
    await waitFor(() => expect(name).toHaveValue(`${live.title} — ad`));
    expect(screen.getByRole('combobox')).toHaveValue('Awareness');
    await user.click(screen.getByRole('button', { name: /create & continue/i }));

    expect(await screen.findByText(`“${live.title}” is this campaign’s creative.`)).toBeInTheDocument();
    expect(api.callsTo('POST /campaigns')[0].body).toMatchObject({ name: `${live.title} — ad`, objective: 'Awareness', channels: ['instagram'] });
    expect(api.callsTo(`PATCH /posts/${live.id}`)[0].body).toEqual({ campaignId: actions.campaign.campaign.id });
  });
});

