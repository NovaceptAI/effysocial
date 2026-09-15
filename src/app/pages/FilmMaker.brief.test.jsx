import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// Clicking Draft the script right after typing the brief also saves the brief (on blur).
// If that save answers after the script, its reply — the film as it was before the
// script — must not wipe the new scenes (the demo-film run caught this now and then).
describe('Ad Films — brief saved while the script is drafted', () => {
  it('keeps the drafted scenes when the brief save answers last', async () => {
    const user = userEvent.setup();
    const before = { ...films.fresh, stage: 2, brief: '', scenes: [] };
    let saved = before;   // the film as the engine holds it
    let patched = false;
    mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /films/1': () => ({ status: 'ok', film: saved }),
      'GET /studio/voices': { voices: [] },
      'PATCH /films/1': async (body) => {
        const reply = { ...before, ...body };   // read before the script landed
        await new Promise((resolve) => { setTimeout(resolve, 150); });
        saved = { ...saved, ...body };
        patched = true;
        return { status: 'ok', film: reply };
      },
      'POST /films/1/script': () => {
        saved = { ...films.fresh, stage: 2, brief: 'Monsoon roof ad' };
        return { status: 'ok', film: saved };
      },
    });
    renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
    await user.type(await screen.findByLabelText('Film brief'), 'Monsoon roof ad');
    await user.click(screen.getByRole('button', { name: 'Draft the script' }));

    const line = films.fresh.scenes[0].line;
    expect(await screen.findByDisplayValue(line)).toBeInTheDocument();
    await waitFor(() => expect(patched).toBe(true));
    await new Promise((resolve) => { setTimeout(resolve, 50); });
    expect(screen.getByDisplayValue(line)).toBeInTheDocument();
    expect(screen.getByLabelText('Film brief')).toHaveValue('Monsoon roof ad');
  });
});
