import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareRow from './ShareRow';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/publishing';

// Studio's Share row publishes to Instagram and reports the outcome the engine
// recorded on the post (launch plan 4.1). Payloads come from the engine's test flow.
const IMAGE = 'https://cdn.example.in/monsoon-offer.jpg';
const VIDEO = 'https://cdn.example.in/monsoon-reel.mp4';
const CAPTION = 'Monsoon offer: free roof check this week.\n\n#monsoon #roofing';

const connected = { 'GET /bootstrap': fx.bootstrap, 'GET /integrations': fx.integrationsConnected };

afterEach(() => vi.useRealTimers());

describe('Share row', () => {
  it('publishes an image and links to the live post (PUBL-005)', async () => {
    const api = mockApi({ ...connected, 'POST /publish/instagram': fx.imagePublished });
    renderApp(<ShareRow imageUrl={IMAGE} caption={CAPTION} title="Monsoon offer" />);
    await userEvent.click(await screen.findByRole('button', { name: /publish to instagram/i }));

    expect(await screen.findByText('Published to Instagram.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view on instagram/i })).toHaveAttribute('href', fx.imagePublished.permalink);
    expect(screen.getByRole('link', { name: 'See it on Published' })).toHaveAttribute('href', '/app/published');
    expect(screen.getByRole('button', { name: 'Published' })).toBeDisabled();
    expect(api.callsTo('POST /publish/instagram').map((c) => c.body)).toEqual([
      { workspace: 'ws_1', imageUrl: IMAGE, caption: CAPTION, title: 'Monsoon offer' },
    ]);
  });

  it('follows a Reel while Instagram processes it (PUBL-009)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const checks = [fx.reelChecking, fx.reelPublished];
    const api = mockApi({
      ...connected,
      'POST /publish/instagram-reel': fx.reelPending,
      [`POST /posts/${fx.reelPending.postId}/publish/check`]: () => checks.shift(),
    });
    renderApp(<ShareRow videoUrl={VIDEO} caption="Before the rains" title="Before the rains" />);
    await userEvent.click(await screen.findByRole('button', { name: /publish to instagram/i }));

    expect(await screen.findByText('Instagram is processing the video…')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(5000); });
    await waitFor(() => expect(api.callsTo(`POST /posts/${fx.reelPending.postId}/publish/check`)).toHaveLength(1));
    expect(screen.queryByText('Published to Instagram.')).not.toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(5000); });

    expect(await screen.findByRole('link', { name: /view on instagram/i })).toHaveAttribute('href', fx.reelPublished.post.permalink);
    expect(api.callsTo('POST /publish/instagram-reel')[0].body).toEqual({
      workspace: 'ws_1', videoUrl: VIDEO, caption: 'Before the rains', title: 'Before the rains',
    });
  });

  it('shows Instagram’s own reason when it refuses (PUBL-006)', async () => {
    mockApi({ ...connected, 'POST /publish/instagram': [fx.imageFailed.status, fx.imageFailed.body] });
    renderApp(<ShareRow imageUrl={IMAGE} caption="Wide banner" />);
    await userEvent.click(await screen.findByRole('button', { name: /publish to instagram/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The aspect ratio is not supported.');
    expect(screen.getByRole('button', { name: /try again/i })).toBeEnabled();
  });

  it('warns about a caption Instagram would refuse, before publishing (PUBL-013)', async () => {
    const api = mockApi(connected);
    const caption = Array.from({ length: 31 }, (_, i) => `#tag${i}`).join(' ');
    renderApp(<ShareRow imageUrl={IMAGE} caption={caption} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Instagram allows up to 30 hashtags. This caption has 31. Edit the caption to publish.');
    expect(screen.getByRole('button', { name: /publish to instagram/i })).toBeDisabled();
    expect(api.callsTo('POST /publish/instagram')).toHaveLength(0);
  });

  it('sends people to Integrations when Instagram isn’t connected or has expired (PUBL-011, PUBL-012)', async () => {
    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /integrations': fx.integrationsNone });
    const { unmount } = renderApp(<ShareRow imageUrl={IMAGE} caption="hi" />);
    expect(await screen.findByRole('link', { name: /instagram — connect to enable/i })).toHaveAttribute('href', '/app/integrations');
    unmount();

    mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /integrations': fx.integrationsExpired });
    renderApp(<ShareRow imageUrl={IMAGE} caption="hi" />);
    expect(await screen.findByRole('link', { name: /instagram — reconnect to publish/i })).toHaveAttribute('href', '/app/integrations');
    expect(screen.queryByRole('button', { name: /publish to instagram/i })).not.toBeInTheDocument();
  });
});
