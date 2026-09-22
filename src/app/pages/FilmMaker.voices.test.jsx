import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// ElevenLabs' free plan can't use library voices, so the Voice stage offers the built-in
// voices, says what they sound like, and hides library casting until a paid plan.
const BUILTIN = [
  { key: 'builtin_alice', name: 'Alice', lang: 'Any language, British accent', gender: 'female' },
  { key: 'builtin_george', name: 'George', lang: 'Any language, British accent', gender: 'male' },
];

function open(voices) {
  mockApi({
    'GET /bootstrap': bootstrapFixture,
    'GET /films/1': { status: 'ok', film: { ...films.fresh, stage: 5 } },
    'GET /studio/voices': voices,
  });
  renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
}

describe('Film Maker — voices on the free ElevenLabs plan', () => {
  it('offers the built-in voices, says what they sound like, and hides library casting', async () => {
    open({ status: 'ok', voices: BUILTIN, libraryVoices: false });
    expect(await screen.findByRole('option', { name: 'George — Any language, British accent (male)' })).toBeInTheDocument();
    expect(screen.getByText(/Indian narrators and finding more voices need a paid ElevenLabs plan/)).toBeInTheDocument();
    expect(screen.queryByText('FIND MORE VOICES')).not.toBeInTheDocument();
  });

  it('shows library casting on a paid plan', async () => {
    open({ status: 'ok', voices: BUILTIN, libraryVoices: true });
    expect(await screen.findByText('FIND MORE VOICES')).toBeInTheDocument();
    expect(screen.queryByText(/need a paid ElevenLabs plan/)).not.toBeInTheDocument();
  });
});
