import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import CreativeAnalytics from './CreativeAnalytics';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/creative';

// Creative Performance compares the workspace's own published posts (launch plan 5.2,
// G39; ANL-005) and says plainly how many of them have numbers. Payloads come from the
// engine's test flow.
const open = (payload) => {
  mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /analytics/creative': payload });
  renderApp(<CreativeAnalytics />, { route: '/app/analytics/creative' });
};

describe('Creative Performance', () => {
  it('names the best format and hook from real published posts', async () => {
    open(fx.measured);
    expect(await screen.findByRole('region', { name: 'Best format' })).toHaveTextContent('Reel');
    expect(screen.getByRole('region', { name: 'Best format' })).toHaveTextContent('9.1% engagement across 2 posts');
    expect(screen.getByRole('region', { name: 'Best hook' })).toHaveTextContent('Statement or story');

    const byHook = screen.getByRole('region', { name: 'By hook' });
    expect(within(byHook).getByText('List or number')).toBeInTheDocument();
    expect(byHook).toHaveTextContent('4.8% · 2,180 reach · 1 post');
  });

  it('says how much of what is published is actually measured', async () => {
    open(fx.measured);
    expect(await screen.findByText(/Comparing/)).toHaveTextContent('Comparing 4 of your 5 published posts');
    expect(screen.getByRole('link', { name: 'Open Published' })).toHaveAttribute('href', '/app/published');
  });

  it('lists every published post, including one nobody has read the numbers for', async () => {
    open(fx.measured);
    const list = await screen.findByRole('region', { name: 'Published posts' });
    expect(within(list).getAllByRole('heading').map((h) => h.textContent))
      .toEqual(['Published posts', 'Free check', 'Spot a leak', 'Pune terrace', 'Three signs', 'Monsoon check']);
    expect(within(list).getByText('How-to')).toBeInTheDocument();
    expect(within(list).getByText('How to spot a leak before the ceiling stains')).toBeInTheDocument();
    expect(within(list).getAllByRole('link', { name: 'No numbers yet' })).toHaveLength(1);
    expect(within(list).getAllByRole('link', { name: 'View' })[0]).toHaveAttribute('href', 'https://www.instagram.com/p/M5/');
  });

  it('published but unmeasured says so instead of comparing nothing', async () => {
    open(fx.unmeasured);
    expect(await screen.findByText(/no numbers for it yet/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Best format' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'By format' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Published posts' })).getByText('Gutters')).toBeInTheDocument();
  });

  it('nothing published at all points at AI Studio', async () => {
    open(fx.empty);
    expect(await screen.findByText('No published posts to compare yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create in AI Studio/ })).toHaveAttribute('href', '/app/studio');
    expect(screen.queryByRole('region', { name: 'Published posts' })).not.toBeInTheDocument();
  });

  it('says why the numbers could not be loaded', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /analytics/creative': [500, { message: 'Analytics is having a moment.' }] });
    renderApp(<CreativeAnalytics />, { route: '/app/analytics/creative' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Analytics is having a moment.');
  });
});
