import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIStudio from './AIStudio';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';

// The speaking-agent outro (EMB-004, EMB-005, EMB-006). Response bodies below
// are the engine's real shapes, pinned on the backend by
// tests/test_effy_agent_outro_contract.py — keep the two in step.
const MEDIA = 'https://effysocial.effybiz.in/api/effy/media/';
const AD = 'vid_ad00000000000001.mp4';
const DONE = 'Done — your ad with agent outro is saved in Media Library.';

const shell = {
  'GET /bootstrap': bootstrapFixture,
  'GET /studio/context': { status: 'ok' },
  'GET /studio/voices': { status: 'ok', voices: [], music: [{ key: '', name: 'None' }] },
  'GET /characters': { status: 'ok', presets: [{ key: 'asha', name: 'Asha', role: 'Dealer', ready: true }], custom: [], maxWords: 38 },
  'GET /integrations': { status: 'ok', integrations: [] },
};
const clip = (n) => ({ status: 'ready', videoUrl: `${MEDIA}vid_clip0000000000000${n}.mp4`, name: `vid_clip0000000000000${n}.mp4` });
const stitched = { status: 'ok', videoUrl: `${MEDIA}vid_agent_final00000001.mp4`, name: 'vid_agent_final00000001.mp4' };

// The outro polls every 8 s; run those waits at once and leave every other timer alone.
function skipPollingWaits() {
  const real = globalThis.setTimeout;
  vi.stubGlobal('setTimeout', (fn, ms, ...args) => real(fn, ms === 8000 ? 0 : ms, ...args));
}

async function openOutro() {
  const view = renderApp(<AIStudio />, { route: `/app/studio?video=${encodeURIComponent(MEDIA + AD)}` });
  await userEvent.click(await screen.findByRole('button', { name: /add agent outro/i }));
  return view;
}

describe('AI Studio — speaking agent outro', () => {
  it('stitches a preset character after lip-sync finishes, using the clip name', async () => {
    skipPollingWaits();
    let lipsyncPolls = 0;
    const api = mockApi({
      ...shell,
      'POST /characters/speak': { status: 'ok', job: 'job-1' },
      'POST /studio/avatar/status': () => (++lipsyncPolls === 1 ? { status: 'pending' } : clip(1)),
      'POST /studio/embed/video/stitch': stitched,
    });
    await openOutro();
    const picker = (await screen.findByRole('option', { name: 'Asha · Dealer' })).closest('select');
    await userEvent.selectOptions(picker, 'preset:asha');
    await userEvent.click(screen.getByRole('button', { name: 'Create final video' }));

    expect(await screen.findByText(DONE)).toBeInTheDocument();
    expect(api.callsTo('POST /characters/speak')[0].body).toMatchObject({ workspace: 'ws_1', preset: 'asha', script: 'Ready to grow? Talk to our team today.' });
    expect(lipsyncPolls).toBe(2);
    expect(api.callsTo('POST /studio/embed/video/stitch')[0].body).toEqual({ workspace: 'ws_1', videoName: AD, outroName: 'vid_clip00000000000001.mp4' });
    expect(api.unhandled).toEqual([]);
  });

  it('creates a character from a photo, stops polling once it is ready, then speaks as it', async () => {
    skipPollingWaits();
    let characterPolls = 0;
    const api = mockApi({
      ...shell,
      'POST /characters': { status: 'ok', character: { id: 7, name: 'Agent Priya', kind: 'custom', status: 'animating', ready: false } },
      'POST /characters/7/status': () => (++characterPolls < 2
        ? { status: 'pending' }
        : { status: 'ready', character: { id: 7, name: 'Agent Priya', kind: 'custom', status: 'ready', ready: true } }),
      'POST /characters/speak': { status: 'ok', job: 'job-2' },
      'POST /studio/avatar/status': clip(2),
      'POST /studio/embed/video/stitch': stitched,
    });
    const { container } = await openOutro();
    await userEvent.click(screen.getByRole('button', { name: 'Upload agent photo' }));
    const agentName = screen.getByPlaceholderText('Agent name');
    await userEvent.clear(agentName);
    await userEvent.type(agentName, 'Agent Priya');
    await userEvent.upload(container.querySelector('input[type="file"]'), new File(['png'], 'priya.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: 'Create final video' }));

    expect(await screen.findByText(DONE)).toBeInTheDocument();
    expect(characterPolls).toBe(2); // ends on the ready character, not after 60 polls
    expect(api.callsTo('POST /characters')[0].body.get('name')).toBe('Agent Priya');
    expect(api.callsTo('POST /characters/speak')[0].body).toMatchObject({ workspace: 'ws_1', characterId: 7 });
    expect(api.callsTo('POST /studio/embed/video/stitch')[0].body.outroName).toBe('vid_clip00000000000002.mp4');
    expect(api.unhandled).toEqual([]);
  });

  it('keeps Create disabled until a character is chosen and the line fits 16 words', async () => {
    mockApi(shell);
    await openOutro();
    const create = screen.getByRole('button', { name: 'Create final video' });
    expect(create).toBeDisabled(); // no character yet
    await userEvent.selectOptions((await screen.findByRole('option', { name: 'Asha · Dealer' })).closest('select'), 'preset:asha');
    expect(create).toBeEnabled();

    const line = screen.getByPlaceholderText('What should your agent say?');
    await userEvent.clear(line);
    await userEvent.type(line, 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen');
    expect(screen.getByText('17/16 words')).toBeInTheDocument();
    expect(create).toBeDisabled();
    await userEvent.clear(line);
    expect(create).toBeDisabled(); // empty line
  });
});
