import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// A voice line that runs past its scene talks over the next one in the mix. Slightly long
// lines are sped up by the engine; the rest offer "Shorten to fit", and Assemble warns
// about any that are still long without blocking the build.
const LONG = 'Har chhat jhelti hai dhoop aur baarish saal bhar lagataar bina ruke.';
const withVo = (stage, over) => ({
  ...films.fresh,
  stage,
  scenes: films.fresh.scenes.map((s, i) => ({
    ...s, vo: `aud_${i}.mp3`, voUrl: `/api/effy/media/aud_${i}.mp3`, voStale: false,
    line: i === 0 && over ? LONG : s.line,
    voSeconds: i === 0 && over ? 6.4 : 3.6,
  })),
});

const open = (film, handlers = {}) => {
  const api = mockApi({
    'GET /bootstrap': bootstrapFixture,
    'GET /films/1': () => ({ status: 'ok', film }),
    'GET /studio/voices': { status: 'ok', voices: [], libraryVoices: false },
    ...handlers,
  });
  renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
  return api;
};

describe('Film Maker — a voice line that runs long', () => {
  it('offers Shorten to fit and says what the line became', async () => {
    const film = withVo(5, true);
    const shortened = { status: 'ok', was: LONG, line: 'Chhat jhelti hai dhoop aur baarish.', over: false,
                        scene: { ...film.scenes[0], line: 'Chhat jhelti hai dhoop aur baarish.', voSeconds: 3.8 } };
    const api = open(film, { 'POST /films/1/scenes/1/fit': shortened });
    await userEvent.click(await screen.findByRole('button', { name: /Shorten to fit/ }));
    expect(api.callsTo('POST /films/1/scenes/1/fit')).toHaveLength(1);
    const note = await screen.findByText(/Scene 1 is now/);
    expect(note).toHaveTextContent('“Chhat jhelti hai dhoop aur baarish.” (3.8s of 4s)');
    expect(note).toHaveTextContent(`Was: “${LONG}”`);
  });

  it('offers it only on the lines that run long', async () => {
    open(withVo(5, false));
    await screen.findByText(/One narrator reads every line/);
    expect(screen.queryByRole('button', { name: /Shorten to fit/ })).not.toBeInTheDocument();
  });

  it('warns at Assemble but still lets the film be built', async () => {
    open(withVo(6, true));
    const warning = await screen.findByRole('status', { name: 'Lines that run long' });
    expect(warning).toHaveTextContent('Scene 1 runs longer than its scene');
    expect(warning).toHaveTextContent('You can assemble anyway');
    expect(within(warning).getByRole('button', { name: 'Fix in Voice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Re-assemble|Assemble the film/ })).toBeEnabled();
  });
});
