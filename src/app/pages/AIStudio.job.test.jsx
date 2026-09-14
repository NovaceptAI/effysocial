import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIStudio from './AIStudio';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';

// AI Studio work is counted as one acceptance-record job per format session (G13).
const shell = {
  'GET /bootstrap': bootstrapFixture,
  'GET /studio/context': { status: 'ok' },
  'GET /studio/voices': { status: 'ok', voices: [], music: [{ key: '', name: 'None' }] },
  'GET /integrations': { status: 'ok', integrations: [] },
  'GET /characters': { status: 'ok', presets: [], custom: [] },
};
const draft = { status: 'ok', caption: 'Monsoon check-ups are 20% off this week.', hashtags: ['smile'], scores: [], hook: 'Rain or shine, smile on.', cta: 'Book now', cited: [] };
const clickGenerate = async () => userEvent.click((await screen.findAllByRole('button', { name: /^generate$/i }))[0]);

describe('AI Studio — acceptance job id', () => {
  it('sends the same job id with the draft and the approval, and starts a new job for a new format', async () => {
    const user = userEvent.setup();
    const api = mockApi({ ...shell, 'POST /studio/generate': draft, 'POST /studio/send-to-approval': { status: 'ok', postId: 9 } });
    renderApp(<AIStudio />, { route: '/app/studio?topic=Monsoon%20check-up%20offer' });
    await clickGenerate();
    await screen.findByDisplayValue(draft.caption);
    await user.click(screen.getByRole('button', { name: /send to approval/i }));
    await waitFor(() => expect(api.callsTo('POST /studio/send-to-approval')).toHaveLength(1));

    const jobs = ['POST /studio/generate', 'POST /studio/send-to-approval'].flatMap((k) => api.callsTo(k)).map((c) => c.body.job);
    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatch(/^st_[a-z0-9]{8,32}$/);
    expect(new Set(jobs).size).toBe(1);
    expect(api.callsTo('POST /studio/send-to-approval')[0].body.topic).toBe('Monsoon check-up offer');

    await user.click(screen.getByRole('button', { name: /formats/i }));
    await user.click(await screen.findByRole('button', { name: /instagram post/i }));
    await clickGenerate();
    await waitFor(() => expect(api.callsTo('POST /studio/generate')).toHaveLength(2));
    const next = api.callsTo('POST /studio/generate')[1].body.job;
    expect(next).toMatch(/^st_[a-z0-9]{8,32}$/);
    expect(next).not.toBe(jobs[0]);
  });
});
