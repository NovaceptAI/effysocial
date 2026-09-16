import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import Trends from './Trends';
import Competitors from './Competitors';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/strategy';

// Trends and competitors say what they are based on (launch plan 5.11, G43).
// Payloads from the engine's test flow.
const openTrends = (payload) => {
  mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /strategy/trends': payload });
  renderApp(<Trends />, { route: '/app/trends' });
};
const card = (heading) => screen.getByRole('heading', { name: heading }).closest('div.rounded-2xl');

describe('Trends — every section names its source', () => {
  it('AI themes are called suggestions, never trends, and say when they were made', async () => {
    openTrends(fx.brandTrends);
    expect(await screen.findByRole('heading', { name: 'Suggested themes' })).toBeInTheDocument();
    expect(screen.queryByText('Trending now')).not.toBeInTheDocument();
    const themes = card('Suggested themes');
    expect(within(themes).getByText('AI suggestions')).toBeInTheDocument();
    const source = within(themes).getByLabelText('Source');
    expect(source).toHaveTextContent('Source: AI suggestions from your Brand Brain · as of 17 Sept 2026');
    expect(source).toHaveTextContent('Suggestions, not measured trends — no search, social or sales data was looked at.');
  });

  it('without a Brand Brain the themes are general guidance and say how to get better ones', async () => {
    openTrends(fx.generalTrends);
    const themes = card(await screen.findByRole('heading', { name: 'Suggested themes' }).then((h) => h.textContent));
    expect(within(themes).getByText('General guidance')).toBeInTheDocument();
    expect(within(themes).getByLabelText('Source')).toHaveTextContent('Build your Brand Brain for suggestions made for you.');
    expect(within(themes).getByLabelText('Source')).not.toHaveTextContent('as of');
  });

  it('gaps, seasons, hashtags and formats each say what they covered and what they are not', async () => {
    openTrends(fx.brandTrends);
    await screen.findByRole('heading', { name: 'Suggested themes' });
    expect(screen.getByText('Content gaps').closest('div.rounded-2xl')).toHaveTextContent('covers 1 post (drafts included) across 1 channel');
    expect(screen.getByText('Seasonal opportunities').closest('div.rounded-2xl')).toHaveTextContent('covers september 2026. General dates — not demand or search data.');
    expect(screen.getByText('Suggested hashtags').closest('div.rounded-2xl')).toHaveTextContent("How popular each tag is isn't measured.");
    expect(screen.queryByText('Hot formats')).not.toBeInTheDocument();
    const formats = screen.getByText('Formats to try').closest('div.rounded-2xl');
    expect(within(formats).getByRole('region', { name: 'Your best format' })).toHaveTextContent("Your best so far: Reel · 9.9% engagement");
    expect(within(formats).getByRole('region', { name: 'Your best format' })).toHaveTextContent("Source: Your published posts' Instagram numbers");
  });
});

describe('Competitors — your entries, with no metrics', () => {
  it('say they are accounts you added, when each was added, and that there are no metrics', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /strategy/competitors': fx.competitors });
    renderApp(<Competitors />, { route: '/app/competitors' });
    expect(await screen.findByRole('heading', { name: 'Rival Seal' })).toBeInTheDocument();
    expect(screen.getByText(/^Added \d{1,2} Sept 2026$/)).toBeInTheDocument();
    const source = screen.getByLabelText('Source');
    expect(source).toHaveTextContent('Source: Accounts you added');
    expect(source).toHaveTextContent('covers 1 competitor, 2 profile links');
    expect(source).toHaveTextContent('No metrics — posting frequency, engagement and share of voice need channel sync');
  });

  it('with none added it still offers to add one', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /strategy/competitors': fx.noCompetitors });
    renderApp(<Competitors />, { route: '/app/competitors' });
    expect(await screen.findByRole('button', { name: /Add your first competitor/ })).toBeInTheDocument();
  });
});
