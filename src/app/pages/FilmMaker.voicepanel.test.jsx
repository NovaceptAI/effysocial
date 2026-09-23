import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// The Voice stage: lines on the left with room to write, narrator and a summary of the
// read on the right. The summary counts what is spoken and what runs long.
const LONG = 'Har chhat jhelti hai dhoop aur baarish saal bhar lagataar bina ruke rehti hai.';
const film = {
  ...films.fresh,
  stage: 5,
  scenes: films.fresh.scenes.map((s, i) => ({
    ...s, vo: `aud_${i}.mp3`, voUrl: `/api/effy/media/aud_${i}.mp3`, voStale: false,
    line: i === 0 ? LONG : s.line,
    voSeconds: i === 0 ? 6.4 : 3.2,
  })),
};

const open = (handlers = {}) => {
  const api = mockApi({
    'GET /bootstrap': bootstrapFixture,
    'GET /films/1': () => ({ status: 'ok', film }),
    'GET /studio/voices': { status: 'ok', voices: [{ key: 'builtin_alice', name: 'Alice', lang: 'Any language, British accent', gender: 'female' }], libraryVoices: false },
    ...handlers,
  });
  renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
  return api;
};

describe('Film Maker — the Voice stage', () => {
  it('sums up the read and names the lines that run long', async () => {
    open();
    const summary = await screen.findByLabelText('This film');
    expect(summary).toHaveTextContent('2 lines · 9.6s spoken of 12s');
    expect(summary).toHaveTextContent('1 line runs past its scene (1)');
    expect(within(summary).getByRole('button', { name: /Fit all long lines/ })).toBeInTheDocument();
    expect(within(summary).getByRole('button', { name: /Play all/ })).toBeInTheDocument();
  });

  it('estimates the read as the line is typed, before spending a generation', async () => {
    open();
    const box = await screen.findByLabelText('Line for scene 2');
    expect(box.tagName).toBe('TEXTAREA');                     // room to write, not a one-line input
    await userEvent.clear(box);
    await userEvent.type(box, 'One two three four five six seven eight nine ten eleven twelve');
    expect(await screen.findByText('~12 words ≈ 5.2s of 4s')).toBeInTheDocument();
  });

  it('shortens every long line from the summary, one at a time', async () => {
    const api = open({
      'POST /films/1/scenes/1/fit': { status: 'ok', was: LONG, line: 'Chhat jhelti hai dhoop.', over: false,
                                      scene: { ...film.scenes[0], line: 'Chhat jhelti hai dhoop.', voSeconds: 3.4 } },
    });
    await userEvent.click(await screen.findByRole('button', { name: /Fit all long lines/ }));
    expect(api.callsTo('POST /films/1/scenes/1/fit')).toHaveLength(1);   // only the long one
    expect(api.callsTo('POST /films/1/scenes/2/fit')).toHaveLength(0);
    expect(await screen.findByText(/Shortened scene 1 → 3.4s/)).toBeInTheDocument();
  });

  it('regenerates a line with the keyboard', async () => {
    const api = open({ 'POST /films/1/scenes/2/vo': { status: 'ok', scene: film.scenes[1] } });
    const box = await screen.findByLabelText('Line for scene 2');
    await userEvent.click(box);
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    expect(api.callsTo('POST /films/1/scenes/2/vo')).toHaveLength(1);
  });
});
