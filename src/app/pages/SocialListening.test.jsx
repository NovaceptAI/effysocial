import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialListening from './SocialListening';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';

// Social Listening part 1: Instagram comments and tags, as the engine returns them (listening.py).
const comment = { id: 7, channel: 'instagram', kind: 'comment', person: 'asha', text: 'Do you ship to Pune?',
  post: 'Monsoon offer', permalink: 'https://www.instagram.com/p/M1/', at: '2026-10-06T09:00:00+00:00' };
const tag = { id: 8, channel: 'instagram', kind: 'mention', person: 'ravi', text: 'Loved the session with @clinic',
  post: '', permalink: 'https://www.instagram.com/p/T1/', at: '2026-10-06T18:00:00+00:00' };
const listening = (extra = {}) => ({ status: 'ok', connected: true, username: 'clinic',
  last: { syncedAt: '2026-10-07T10:00:00+00:00', added: 2 }, mentions: [tag, comment], ...extra });

const open = (handlers = {}, bootstrap = bootstrapFixture) => {
  const api = mockApi({ 'GET /bootstrap': bootstrap, 'GET /listening': listening(), ...handlers });
  renderApp(<SocialListening />, { route: '/app/listening' });
  return api;
};

describe('Social Listening', () => {
  it('lists comments and tags with who wrote them and a link to Instagram', async () => {
    open();
    const list = await screen.findByRole('list', { name: 'Mentions' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('@ravi');
    expect(items[0]).toHaveTextContent('Tagged you');
    expect(items[1]).toHaveTextContent('Do you ship to Pune?');
    expect(items[1]).toHaveTextContent('On your post: Monsoon offer');
    expect(within(items[1]).getByRole('link', { name: /View on Instagram/ })).toHaveAttribute('href', comment.permalink);
    expect(screen.getByText("Comments and tags on @clinic's Instagram")).toBeInTheDocument();
    expect(screen.queryByText(/sentiment|intent/i)).not.toBeInTheDocument();
  });

  it('filters to comments or tags', async () => {
    open();
    await userEvent.click(await screen.findByRole('button', { name: 'Tags (1)' }));
    const items = within(screen.getByRole('list', { name: 'Mentions' })).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('@ravi');
    expect(screen.getByRole('button', { name: 'Comments (1)' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('refreshes from Instagram and shows what came back', async () => {
    const api = open({ 'GET /listening': listening({ mentions: [] }), 'POST /listening/refresh': listening() });
    expect(await screen.findByText('No comments or tags yet')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(await screen.findByText('@asha')).toBeInTheDocument();
    expect(api.callsTo('POST /listening/refresh')[0].body).toEqual({ workspace: bootstrapFixture.workspaces[0].id });
  });

  it("says what Instagram didn't share and where to reconnect", async () => {
    open({ 'GET /listening': listening({ last: { syncedAt: '2026-10-07T10:00:00+00:00', added: 0,
      tagsError: 'Application does not have permission for this action Reconnect Instagram in Integrations to allow reading comments and tags.' } }) });
    const note = await screen.findByRole('status');
    expect(note).toHaveTextContent("Instagram didn't share everything");
    expect(note).toHaveTextContent('Tags: Application does not have permission');
    expect(within(note).getByRole('link', { name: 'Open Integrations' })).toHaveAttribute('href', '/app/integrations');
  });

  it('without a connection it says so and offers to connect, inventing nothing', async () => {
    open({ 'GET /listening': { status: 'ok', connected: false, reason: "Instagram isn't connected.", username: '', last: null, mentions: [] } });
    expect(await screen.findByText('Connect Instagram to start listening')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Connect Instagram/ })).toHaveAttribute('href', '/app/integrations');
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Mentions' })).not.toBeInTheDocument();
  });

  it('a view-only teammate sees the list but cannot refresh', async () => {
    open({}, { ...bootstrapFixture, role: 'View-only' });
    expect(await screen.findByText('@asha')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
  });
});
