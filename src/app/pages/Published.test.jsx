import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Published from './Published';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/publishing';
import actions from '../../test/fixtures/postActions';

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
    expect(live.getByText('Open Report for reach, likes and saves from Instagram.')).toBeInTheDocument();
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

  it('Repurpose and Create ad hand the post on (PUBL-018)', async () => {
    const user = userEvent.setup();
    const Where = () => { const l = useLocation(); return <output aria-label="location">{l.pathname}{l.search}</output>; };
    mockApi({ 'GET /bootstrap': actions.bootstrap, 'GET /posts': actions.posts });
    renderApp(<><Published /><Where /></>, { route: '/app/published' });
    const live = actions.publishedNow.post;
    const card = await screen.findByRole('article', { name: live.title });

    await user.click(within(card).getByRole('button', { name: /repurpose/i }));
    const studio = new URL(screen.getByRole('status', { name: 'location' }).textContent, 'http://x');
    expect(studio.pathname).toBe('/app/studio');
    expect(Object.fromEntries(studio.searchParams)).toEqual({ repurpose: String(live.id), topic: live.caption });

    await user.click(within(card).getByRole('button', { name: /create ad/i }));
    expect(screen.getByRole('status', { name: 'location' })).toHaveTextContent(`/app/launch?post=${live.id}`);
  });

  it('Report reads the post’s numbers from Instagram (PUBL-018)', async () => {
    const user = userEvent.setup();
    const live = actions.publishedNow.post;
    let posts = actions.posts;
    const api = mockApi({
      'GET /bootstrap': actions.bootstrap,
      'GET /posts': () => posts,
      [`POST /posts/${live.id}/insights`]: () => { posts = { ...actions.posts, posts: replace(actions.posts.posts, actions.insights.post) }; return actions.insights; },
    });
    renderApp(<Published />, { route: '/app/published' });
    await user.click(within(await screen.findByRole('article', { name: live.title })).getByRole('button', { name: /report/i }));
    const report = await screen.findByRole('dialog', { name: `Report: ${live.title}` });
    const figure = (label) => within(report).getByText(label).nextElementSibling;
    await waitFor(() => expect(figure('Reach')).toHaveTextContent('1,240'));
    expect(figure('Likes')).toHaveTextContent('96');
    expect(figure('Saves')).toHaveTextContent('18');
    expect(within(report).getByText(/Engagement rate/)).toHaveTextContent('Engagement rate 10.9%');
    await user.click(within(report).getByRole('button', { name: 'Close' }));
    const card = screen.getByRole('article', { name: live.title });
    await waitFor(() => expect(within(card).getByText('Reach').previousElementSibling).toHaveTextContent('1,240'));
    expect(api.callsTo(`POST /posts/${live.id}/insights`)).toHaveLength(1);
  });

  it('Report says when the post is gone from Instagram', async () => {
    const user = userEvent.setup();
    const live = actions.publishedNow.post;
    mockApi({
      'GET /bootstrap': actions.bootstrap,
      'GET /posts': actions.posts,
      [`POST /posts/${live.id}/insights`]: [actions.insightsGone.status, actions.insightsGone.body],
    });
    renderApp(<Published />, { route: '/app/published' });
    await user.click(within(await screen.findByRole('article', { name: live.title })).getByRole('button', { name: /report/i }));
    const report = await screen.findByRole('dialog', { name: `Report: ${live.title}` });
    expect(await within(report).findByRole('alert')).toHaveTextContent('This post is no longer on Instagram.');
  });
});
