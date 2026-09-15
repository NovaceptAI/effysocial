import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIStudio from './AIStudio';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import actions from '../../test/fixtures/postActions';

// AI Studio's Add to calendar opens the post dialog with the draft (G29), and a
// repurposed post starts at the format chooser with its caption as the brief.
const shell = {
  'GET /bootstrap': bootstrapFixture,
  'GET /studio/context': { status: 'ok' },
  'GET /studio/voices': { status: 'ok', voices: [], music: [{ key: '', name: 'None' }] },
  'GET /integrations': { status: 'ok', integrations: [] },
  'GET /characters': { status: 'ok', presets: [], custom: [] },
};
const draft = { status: 'ok', caption: 'Monsoon check-ups are 20% off this week.', hashtags: ['smile'], scores: [], hook: 'Rain or shine, smile on.', cta: 'Book now', cited: [] };

describe('AI Studio — calendar and repurpose', () => {
  it('Add to calendar opens a new post with the draft in it', async () => {
    const user = userEvent.setup();
    const api = mockApi({ ...shell, 'POST /studio/generate': draft, 'POST /posts': actions.createdDraft });
    renderApp(<AIStudio />, { route: '/app/studio?topic=Monsoon%20check-up%20offer' });
    await user.click((await screen.findAllByRole('button', { name: /^generate$/i }))[0]);
    await user.click(await screen.findByRole('button', { name: /add to calendar/i }));

    const d = await screen.findByRole('dialog');
    expect(within(d).getByRole('heading', { name: 'New post' })).toBeInTheDocument();
    expect(within(d).getByLabelText('Title')).toHaveValue(draft.hook);
    expect(within(d).getByLabelText(/^Caption/)).toHaveValue('Monsoon check-ups are 20% off this week.\n\n#smile');
    expect(within(d).getByLabelText('Channel')).toHaveValue('instagram');
    await user.click(within(d).getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(api.callsTo('POST /posts')).toHaveLength(1));
    expect(api.callsTo('POST /posts')[0].body).toMatchObject({ title: draft.hook, status: 'draft', channel: 'instagram', type: 'post' });
  });

  it('a repurposed post starts at the format chooser with its caption as the brief', async () => {
    const user = userEvent.setup();
    mockApi(shell);
    renderApp(<AIStudio />, { route: `/app/studio?repurpose=7&topic=${encodeURIComponent('Free roof check this week.')}` });
    expect(await screen.findByRole('heading', { name: 'Repurpose a post' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /LinkedIn Post/ }));
    await waitFor(() => expect(screen.getByDisplayValue('Free roof check this week.')).toBeInTheDocument());
  });
});
