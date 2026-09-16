import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import OrganicAnalytics from './OrganicAnalytics';
import { organicCsv } from '../organicExport';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/organic';

// Organic Analytics from real sources only (launch plan 5.9, G41): nothing invented —
// what Instagram doesn't give says why. Payloads from the engine's test flow.
const open = (payload) => {
  mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /analytics/organic': payload });
  renderApp(<OrganicAnalytics />, { route: '/app/analytics/organic' });
};

describe('Organic Analytics — a connected small account with published posts', () => {
  it('shows the account and its real 28-day numbers', async () => {
    open(fx.smallAccount);
    const account = await screen.findByRole('region', { name: 'Instagram account' });
    expect(account).toHaveTextContent('@clinic');
    expect(account).toHaveTextContent('31 followers · 12 following · 6 posts');
    // The hint sits in its own row inside the metric card; the card holds label and value.
    const reach = screen.getByText('5,400 views · last 28 days').parentElement.parentElement;
    expect(reach).toHaveTextContent('Reach1,240');
    expect(screen.getByText('5.8%')).toBeInTheDocument();
    expect(screen.getByText('average of 6 published posts')).toBeInTheDocument();
  });

  it('says why audience and follower growth are missing instead of inventing them', async () => {
    open(fx.smallAccount);
    expect(await screen.findByRole('region', { name: 'Audience' })).toHaveTextContent('Instagram shares this once an account has 100 followers.');
    expect(screen.getByRole('region', { name: 'New followers' })).toHaveTextContent('Instagram shares this once an account has 100 followers.');
    expect(screen.queryByText('18–24')).not.toBeInTheDocument();   // the old sample age chart
    expect(screen.queryByText(/Sample series/)).not.toBeInTheDocument();
  });

  it("what's working comes from the posts, including the best time", async () => {
    open(fx.smallAccount);
    const working = await screen.findByRole('region', { name: "What's working" });
    expect(working).toHaveTextContent('Terrace before and after · 1,240 reach');
    expect(working).toHaveTextContent('Reel · 9.9%');
    expect(working).toHaveTextContent('Wed evening · 10.9%');
    expect(working).not.toHaveTextContent('Educational');
  });

  it('lists top posts by reach and draws the best-times grid from them', async () => {
    open(fx.smallAccount);
    const posts = await screen.findByRole('region', { name: 'Top posts' });
    expect(within(posts).getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[1].textContent))
      .toEqual(expect.arrayContaining([expect.stringContaining('Terrace before and after')]));
    expect(within(posts).getAllByRole('row')[1]).toHaveTextContent('Terrace before and after');
    const times = screen.getByRole('region', { name: 'Best posting times' });
    expect(times).toHaveTextContent('Average engagement of your published posts by when they went out (Asia/Kolkata)');
    expect(within(times).getByText('10.9%')).toBeInTheDocument();
  });
});

describe('Organic Analytics — other states', () => {
  it('a larger account shows its audience as shares', async () => {
    open(fx.largeAccount);
    const audience = await screen.findByRole('region', { name: 'Audience' });
    expect(audience).toHaveTextContent('25-34');
    expect(audience).toHaveTextContent('60%');
    expect(screen.getByRole('region', { name: 'New followers' })).toHaveTextContent('3gained in the last 28 days');
  });

  it('not connected and nothing published says what to do, with no numbers', async () => {
    open(fx.notConnected);
    expect(await screen.findByText('Nothing to measure yet')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Instagram account' })).toHaveTextContent("Instagram isn't connected.");
    expect(screen.getByRole('link', { name: 'Create a post' })).toHaveAttribute('href', '/app/studio');
    expect(screen.queryByRole('button', { name: /Export/ })).not.toBeInTheDocument();
  });

  it('connected with nothing published still shows the account and daily reach', async () => {
    open(fx.connectedNothingPublished);
    expect(await screen.findByRole('region', { name: 'Daily reach' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Top posts' })).toHaveTextContent('None of your published posts has numbers yet');
    expect(screen.getByRole('region', { name: 'Best posting times' })).toHaveTextContent('Needs at least 6 published posts with numbers — you have 0.');
    expect(screen.getByText('no measured posts yet')).toBeInTheDocument();
  });

  it('an account Instagram refused shows the reason', async () => {
    open({ ...fx.smallAccount, account: null, sources: { ...fx.smallAccount.sources, instagram: { connected: true, username: 'clinic', error: 'Error validating access token.' } } });
    expect(await screen.findByRole('region', { name: 'Instagram account' })).toHaveTextContent("Instagram didn't return this account's numbers: Error validating access token.");
  });
});

describe('Organic Analytics — CSV export', () => {
  it('has the summary, daily reach, top posts and best times, blank where unknown', () => {
    const csv = organicCsv(fx.smallAccount, 'Asia/Kolkata').split('\r\n');
    expect(csv).toContain('Instagram account,instagram.com/clinic,Instagram');
    expect(csv).toContain('Reach (28 days),1240,Instagram');
    expect(csv).toContain('Average post engagement %,5.8,6 of 6 published posts measured');
    expect(csv).toContain('2026-09-14,40');
    expect(csv.find((l) => l.startsWith('Terrace before and after,reel,'))).toMatch(/,1240,10\.9,1,,,,https:\/\/www\.instagram\.com\/p\/Terrace before and after\/$/);
    expect(csv).toContain("Not available,Instagram shares this once an account has 100 followers.");
    expect(csv).toContain('Day,Morning engagement %,Afternoon engagement %,Evening engagement %,Night engagement %');
  });

  it('when nothing is connected the unknown numbers stay blank, not zero', () => {
    const csv = organicCsv(fx.notConnected, 'Asia/Kolkata').split('\r\n');
    expect(csv).toContain("Instagram account,Instagram isn't connected.,Instagram");
    expect(csv).toContain('Followers,,"Instagram, now"');
    expect(csv).toContain('Not available,Instagram not connected');
  });

  it('never lets a post title run as a formula', () => {
    const risky = { ...fx.smallAccount, topPosts: [{ ...fx.smallAccount.topPosts[0], title: '=cmd|"/c calc"!A1' }] };
    expect(organicCsv(risky, 'Asia/Kolkata')).toContain(`"'=cmd|""/c calc""!A1"`);
  });
});
