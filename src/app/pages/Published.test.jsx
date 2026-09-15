import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Published from './Published';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/publishing';

// Published shows each post's real outcome: the live permalink, Instagram's own
// reason for a failure, or an upload still processing (launch plan 4.1).
// Payloads come from the engine's test flow.
const card = (title) => screen.getByRole('article', { name: title });
const replace = (posts, post) => posts.map((p) => (p.id === post.id ? post : p));

describe('Published', () => {
  it('lists processing, failed and live posts, never drafts (PUBL-005, PUBL-006)', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /posts': fx.posts });
    renderApp(<Published />, { route: '/app/published' });

    const titles = (await screen.findAllByRole('heading', { level: 3 })).map((h) => h.textContent);
    // Processing, then failed, then live posts newest first.
    expect(titles).toEqual(['Still going', 'Wide banner', 'Before the rains', 'Monsoon offer']);
    expect(screen.queryByText('Draft idea')).not.toBeInTheDocument();

    const live = within(card('Monsoon offer'));
    expect(live.getByRole('link', { name: /view on instagram/i })).toHaveAttribute('href', 'https://www.instagram.com/p/M1/');
    expect(live.getByText('Reach and likes aren’t synced yet. Instagram shows them on the post.')).toBeInTheDocument();
    expect(live.getByText(/^Published /)).toBeInTheDocument();

    const failed = within(card('Wide banner'));
    expect(failed.getByRole('alert')).toHaveTextContent('The aspect ratio is not supported.');
    expect(failed.queryByText(/token expired/i)).not.toBeInTheDocument();
    expect(within(card('Still going')).getByRole('status')).toHaveTextContent('Instagram is processing this video.');
  });

  it('Retry publishes the failed post again (PUBL-007)', async () => {
    let posts = fx.posts;
    const api = mockApi({
      'GET /bootstrap': fx.bootstrap,
      'GET /posts': () => posts,
      'POST /posts/3/publish': () => { posts = fx.postsAfterRetry; return fx.retryPublished; },
    });
    renderApp(<Published />, { route: '/app/published' });
    await userEvent.click(within(await waitFor(() => card('Wide banner'))).getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(within(card('Wide banner')).getByRole('link', { name: /view on instagram/i }))
      .toHaveAttribute('href', fx.retryPublished.post.permalink));
    expect(within(card('Wide banner')).queryByRole('alert')).not.toBeInTheDocument();
    expect(api.callsTo('POST /posts/3/publish')).toHaveLength(1);
  });

  it('Retry explains why it could not publish', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /posts': fx.posts, 'POST /posts/3/publish': [fx.retryRefused.status, fx.retryRefused.body] });
    renderApp(<Published />, { route: '/app/published' });
    await userEvent.click(within(await waitFor(() => card('Wide banner'))).getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(within(card('Wide banner')).getByText('Connect an Instagram account first (Integrations).')).toBeInTheDocument());
  });

  it('Check now turns a processed upload live', async () => {
    let posts = fx.posts;
    mockApi({
      'GET /bootstrap': fx.bootstrap,
      'GET /posts': () => posts,
      'POST /posts/4/publish/check': () => { posts = { ...fx.posts, posts: replace(fx.posts.posts, fx.checkPublished.post) }; return fx.checkPublished; },
    });
    renderApp(<Published />, { route: '/app/published' });
    await userEvent.click(within(await waitFor(() => card('Still going'))).getByRole('button', { name: 'Check now' }));

    await waitFor(() => expect(within(card('Still going')).getByRole('link', { name: /view on instagram/i }))
      .toHaveAttribute('href', fx.checkPublished.post.permalink));
  });

  it('a post failed by an expired connection links to Integrations (PUBL-012)', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /posts': { status: 'ok', posts: [fx.tokenRevoked.body.post] } });
    renderApp(<Published />, { route: '/app/published' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Error validating access token');
    expect(within(alert).getByRole('link', { name: 'Open Integrations' })).toHaveAttribute('href', '/app/integrations');
  });
});
