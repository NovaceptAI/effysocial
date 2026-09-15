import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIStudio from './AIStudio';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';

// What reaches Send to approval from AI Studio's draft (STU-008, STU-014).
const shell = {
  'GET /bootstrap': bootstrapFixture,
  'GET /studio/context': { status: 'ok' },
  'GET /studio/voices': { status: 'ok', voices: [], music: [{ key: '', name: 'None' }] },
  'GET /integrations': { status: 'ok', integrations: [] },
  'GET /characters': { status: 'ok', presets: [], custom: [] },
};
const draft = { status: 'ok', caption: 'Monsoon check-ups are 20% off this week.', hashtags: ['smile'], scores: [], hook: 'Rain or shine, smile on.', cta: 'Book now', cited: [] };
const openStudio = (qs = '?topic=Monsoon%20check-up%20offer') => renderApp(<AIStudio />, { route: `/app/studio${qs}` });
const sendButton = () => screen.getByRole('button', { name: /send to approval/i });
// The Brief panel and the empty canvas both offer Generate; use the Brief panel's.
const clickGenerate = async () => userEvent.click((await screen.findAllByRole('button', { name: /^generate$/i }))[0]);
const findCaptionBox = () => waitFor(() => {
  const box = document.querySelector('textarea[rows="5"]');
  if (!box) throw new Error('caption box not rendered');
  return box;
});

describe('AI Studio — draft sent to approval', () => {
  it('shows a failed generation as an error, never as a caption that can be sent (STU-008)', async () => {
    const api = mockApi({ ...shell, 'POST /studio/generate': [503, { status: 'error', message: 'Generation unavailable. Try again.' }] });
    openStudio();
    await clickGenerate();

    expect(await screen.findByRole('alert')).toHaveTextContent('Generation unavailable. Try again.');
    expect(screen.queryByDisplayValue(/generation (failed|unavailable)/i)).not.toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
    for (const tool of ['Shorten', 'Rewrite']) {
      const b = screen.queryByRole('button', { name: tool });
      if (b) expect(b).toBeDisabled();
    }
    expect(api.callsTo('POST /studio/send-to-approval')).toHaveLength(0);
  });

  it('clears the error when a retry succeeds', async () => {
    let attempt = 0;
    mockApi({ ...shell, 'POST /studio/generate': () => (++attempt === 1 ? [503, { status: 'error', message: 'Generation unavailable. Try again.' }] : draft) });
    openStudio();
    await clickGenerate();
    await screen.findByRole('alert');
    await clickGenerate();

    expect(await screen.findByDisplayValue(draft.caption)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(sendButton()).toBeEnabled();
  });

  it('sends the caption as edited, not the original draft (STU-014)', async () => {
    const api = mockApi({ ...shell, 'POST /studio/generate': draft, 'POST /studio/send-to-approval': { status: 'ok', post: { id: 9 } } });
    openStudio();
    await clickGenerate();
    const box = await screen.findByDisplayValue(draft.caption);
    await userEvent.clear(box);
    await userEvent.type(box, 'Monsoon check-ups: 25% off until Sunday.');
    expect(box).toHaveFocus(); // typing must not remount the field
    await userEvent.click(sendButton());

    await waitFor(() => expect(api.callsTo('POST /studio/send-to-approval')).toHaveLength(1));
    // What gets posted: the edited caption with the draft's hashtags.
    expect(api.callsTo('POST /studio/send-to-approval')[0].body).toMatchObject({ workspace: 'ws_1', caption: 'Monsoon check-ups: 25% off until Sunday.\n\n#smile', hook: draft.hook });
  });

  it('sends the caption typed for a video reused from Media Library', async () => {
    const api = mockApi({ ...shell, 'POST /studio/send-to-approval': { status: 'ok', post: { id: 10 } } });
    openStudio(`?video=${encodeURIComponent('https://effysocial.effybiz.in/api/effy/media/vid_reuse0000000001.mp4')}`);
    const box = await findCaptionBox();
    await userEvent.type(box, 'Our clinic tour in 30 seconds.');
    await userEvent.click(sendButton());

    await waitFor(() => expect(api.callsTo('POST /studio/send-to-approval')).toHaveLength(1));
    expect(api.callsTo('POST /studio/send-to-approval')[0].body).toMatchObject({
      caption: 'Our clinic tour in 30 seconds.', mediaUrl: 'https://effysocial.effybiz.in/api/effy/media/vid_reuse0000000001.mp4',
    });
  });
});
