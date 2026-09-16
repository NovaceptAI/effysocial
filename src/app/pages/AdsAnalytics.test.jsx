import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdsAnalytics from './AdsAnalytics';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import { adsAnalyticsSandbox, adsAnalyticsMock } from '../../test/fixtures/ads';

// Advertising Analytics runs on whatever the ads adapter returns — sandbox today, a
// live account later — and shows the connect state only when nothing is connected
// (launch plan 5.3, G34; ADS-011). Payloads captured from the engine.
const open = (payload) => {
  mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /ads/analytics': payload });
  renderApp(<AdsAnalytics />, { route: '/app/analytics/ads' });
};

describe('Advertising Analytics', () => {
  it('shows the headline numbers and badges sandbox data', async () => {
    open(adsAnalyticsSandbox);
    expect(await screen.findByText('Sandbox data — not live spend')).toBeInTheDocument();
    expect(screen.getByText('₹1.7L')).toBeInTheDocument();
    expect(screen.getByText('₹157')).toBeInTheDocument();
    expect(screen.getByText('8.4×')).toBeInTheDocument();
    expect(screen.getByText('1.34%')).toBeInTheDocument();
  });

  it('reads impressions down to leads', async () => {
    open(adsAnalyticsSandbox);
    const funnel = await screen.findByRole('region', { name: 'Impressions to leads' });
    expect(within(funnel).getByText('14,33,373')).toBeInTheDocument();
    expect(within(funnel).getByText('1,054')).toBeInTheDocument();
    expect(funnel).toHaveTextContent('5.5% of clicks become leads');
  });

  it('names the cheapest and dearest leads', async () => {
    open(adsAnalyticsSandbox);
    expect(await screen.findByRole('region', { name: 'Cheapest leads' })).toHaveTextContent('Search — Brand + Category');
    expect(screen.getByRole('region', { name: 'Most expensive leads' })).toHaveTextContent('Click-to-WhatsApp Offers');
    expect(screen.getByRole('region', { name: 'Cheapest leads' })).toHaveTextContent('₹132 per lead · 10.6× ROAS');
  });

  it('cuts the spend by platform, objective, format and audience', async () => {
    const user = userEvent.setup();
    open(adsAnalyticsSandbox);
    const table = await screen.findByRole('region', { name: 'Where the money went' });
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Google');
    expect(within(table).getByRole('columnheader', { name: 'ROAS' })).toBeInTheDocument();

    await user.click(within(table).getByRole('button', { name: 'Creative format' }));
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Image');
    expect(within(table).getByRole('columnheader', { name: 'CTR' })).toBeInTheDocument();

    await user.click(within(table).getByRole('button', { name: 'Audience' }));
    expect(within(table).getByText('Broad 25-45')).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Size' })).toBeInTheDocument();

    await user.click(within(table).getByRole('button', { name: 'Objective' }));
    expect(within(table).getByText('Website traffic')).toBeInTheDocument();
  });

  it('with nothing connected it asks for an ad account instead of showing numbers', async () => {
    open(adsAnalyticsMock);
    expect(await screen.findByText('Connect an ad account')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Connect ad accounts/ })).toHaveAttribute('href', '/app/integrations');
    expect(screen.queryByRole('region', { name: 'Where the money went' })).not.toBeInTheDocument();
    expect(screen.queryByText('Sandbox data — not live spend')).not.toBeInTheDocument();
  });

  it('says why the numbers could not be loaded', async () => {
    mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /ads/analytics': [500, { message: 'Ads are having a moment.' }] });
    renderApp(<AdsAnalytics />, { route: '/app/analytics/ads' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Ads are having a moment.');
  });
});
