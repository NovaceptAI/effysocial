import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Reviews from './Reviews';
import PublicReviews from '../../marketing/PublicReviews';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/inbox';

// Request reviews and the public review page (launch plan 5.8, G31).
const slug = fx.reviewLink.link.slug;
const openReviews = (handlers = {}) => {
  const api = mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /reviews': fx.reviews, 'GET /reviews/request-link': fx.reviewLinkNone, ...handlers });
  renderApp(<Reviews />, { route: '/app/reviews' });
  return api;
};

describe('Reviews — request reviews', () => {
  it('creates the link from the review sites and shows it to share', async () => {
    const api = openReviews({ 'PUT /reviews/request-link': { status: 'ok', link: fx.reviewLink.link } });
    await userEvent.click(await screen.findByRole('button', { name: 'Request reviews' }));
    const dialog = screen.getByRole('dialog', { name: 'Request reviews' });
    await userEvent.type(await within(dialog).findByLabelText('Google review link'), 'https://g.page/r/roofseal/review');
    await userEvent.type(within(dialog).getByLabelText(/Another review site/), 'https://www.justdial.com/roofseal');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create link' }));

    expect(api.callsTo('PUT /reviews/request-link')[0].body).toEqual({
      workspace: fx.bootstrap.workspaces[0].id,
      sites: { google: 'https://g.page/r/roofseal/review', other: 'https://www.justdial.com/roofseal' },
    });
    const share = await within(dialog).findByRole('region', { name: 'Your review link' });
    expect(within(share).getByLabelText('Review link')).toHaveValue(`${window.location.origin}/r/${slug}`);
    expect(within(share).getByRole('link', { name: /Share on WhatsApp/ }).getAttribute('href')).toContain(encodeURIComponent(`/r/${slug}`));
    expect(share).toHaveTextContent('Opened 1 time · 1 went to Google.');
  });

  it('shows why the links were refused', async () => {
    openReviews({ 'PUT /reviews/request-link': [400, { message: 'Google: Review links must be full https:// addresses.' }] });
    await userEvent.click(await screen.findByRole('button', { name: 'Request reviews' }));
    const dialog = screen.getByRole('dialog', { name: 'Request reviews' });
    await userEvent.type(await within(dialog).findByLabelText('Google review link'), 'http://g.page');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create link' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Google: Review links must be full https:// addresses.');
  });

  it('private feedback is labelled, and replying never claims to post on Google', async () => {
    openReviews();
    expect(await screen.findByText(/private feedback/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Suggest reply/ }));
    expect(screen.getByRole('button', { name: /Mark as replied/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Post reply/ })).not.toBeInTheDocument();
    expect(screen.getByText(/came privately through your review link/)).toBeInTheDocument();
  });

  it('with no reviews it does not claim an average', async () => {
    openReviews({ 'GET /reviews': { status: 'ok', reviews: [] } });
    expect(await screen.findByText('0 reviews')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('Public review page', () => {
  const openPage = (handlers = {}) => {
    const api = mockApi({ [`GET /public/reviews/${slug}`]: fx.publicPage, ...handlers });
    render(<MemoryRouter initialEntries={[`/r/${slug}`]}><Routes><Route path="/r/:slug" element={<PublicReviews />} /></Routes></MemoryRouter>);
    return api;
  };

  it('shows every review site to everyone, and counts which one they chose', async () => {
    const api = openPage({ [`POST /public/reviews/${slug}/click`]: { status: 'ok' } });
    const sites = await screen.findByRole('region', { name: 'Leave a public review' });
    const links = within(sites).getAllByRole('link');
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Review us on Google', 'https://g.page/r/roofseal/review'],
      ['Review us on our review page', 'https://www.justdial.com/roofseal'],
    ]);
    links[0].addEventListener('click', (e) => e.preventDefault());
    await userEvent.click(links[0]);
    expect(api.callsTo(`POST /public/reviews/${slug}/click`).map((c) => c.body)).toEqual([{ site: 'google' }]);
  });

  it('choosing a low rating never hides the public review sites', async () => {
    openPage();
    await userEvent.click(await screen.findByRole('button', { name: '1 star' }));
    expect(screen.getAllByRole('link', { name: /Review us on/ })).toHaveLength(2);
  });

  it('sends private feedback once it has a rating and a message', async () => {
    const api = openPage({ [`POST /public/reviews/${slug}/feedback`]: { status: 'ok' } });
    const form = await screen.findByRole('form', { name: 'Private feedback' });
    await userEvent.click(within(form).getByRole('button', { name: 'Send privately' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('Choose from 1 to 5 stars.');
    await userEvent.click(within(form).getByRole('button', { name: '2 stars' }));
    await userEvent.type(within(form).getByLabelText('What happened?'), 'Came two days late');
    await userEvent.type(within(form).getByLabelText('Your name (optional)'), 'Asha');
    await userEvent.click(within(form).getByRole('button', { name: 'Send privately' }));
    expect(await screen.findByText(/has your feedback/)).toBeInTheDocument();
    expect(api.callsTo(`POST /public/reviews/${slug}/feedback`)[0].body).toEqual({ rating: 2, name: 'Asha', text: 'Came two days late', website: '' });
  });

  it('a link that no longer exists says so', async () => {
    mockApi({ 'GET /public/reviews/gone': [404, { message: "This review link isn't available." }] });
    render(<MemoryRouter initialEntries={['/r/gone']}><Routes><Route path="/r/:slug" element={<PublicReviews />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('This review link isn’t available.')).toBeInTheDocument();
  });
});
