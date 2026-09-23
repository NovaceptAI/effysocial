import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// Out-of-date renders in Ad Films (G11: FILM-015, FILM-016). The payloads come from
// the engine's test flow, so `cut`, `clipStale` and `voStale` are the real shapes.
function openFilm(film, stage) {
  const api = mockApi({
    'GET /bootstrap': bootstrapFixture,
    'GET /films/1': { status: 'ok', film: { ...film, stage } },
    'GET /studio/voices': { voices: [] },
    'PATCH /films/1': (body) => ({ status: 'ok', film: { ...film, ...body } }),
  });
  renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
  return api;
}


describe('Ad Films — renders that no longer match the film', () => {
  it('a regenerated still marks only that scene’s clip out of date (FILM-015)', async () => {
    openFilm(films.stillRegenerated, 4);
    await screen.findByText(/Renders cost/);
    const [first, second] = screen.getAllByRole('button', { name: /retake/i }).map((b) => b.closest('div').parentElement);
    expect(within(first).getByText(/Out of date — the still, motion or length changed/)).toBeInTheDocument();
    expect(within(first).queryByText('Audio clean (AI-checked)')).not.toBeInTheDocument();
    expect(within(second).getByText('Audio clean (AI-checked)')).toBeInTheDocument();
    expect(within(second).queryByText(/Out of date/)).not.toBeInTheDocument();
  });

  it('the assemble stage says the cut is out of date and lists what to fix first', async () => {
    openFilm(films.stillRegenerated, 6);
    await screen.findByText('The cut');
    expect(screen.getByText(/This cut is out of date/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /re-assemble/i })).toBeDisabled();
    const todo = screen.getByRole('list', { name: 'Before assembling' });
    expect(within(todo).getAllByRole('listitem').map((li) => li.textContent))
      .toEqual(['Scene 1 changed after it was animated — retake it.']);
  });

  it('an edited line flags its voiceover, not the others', async () => {
    openFilm(films.lineEdited, 5);
    await screen.findByRole('heading', { name: 'Voice' });
    const rows = [1, 2].map((n) => screen.getByLabelText(`Line for scene ${n}`).parentElement);
    expect(within(rows[0]).getByText('Out of date — regenerate')).toBeInTheDocument();
    expect(within(rows[1]).queryByText(/Out of date/)).not.toBeInTheDocument();
    expect(within(rows[1]).getByText(/^read: [\d.]+s$/)).toBeInTheDocument();
  });

  it('delivery waits for re-assembly and marks every existing export out of date (FILM-016)', async () => {
    const user = userEvent.setup();
    const api = openFilm(films.lineEdited, 7);
    await screen.findByRole('heading', { name: 'Deliver' });
    expect(screen.getByText(/The film changed after it was assembled/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rebuild exports/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /build dealer versions/i })).toBeDisabled();
    for (const row of ['export-master', 'export-reel', 'export-whatsapp', 'dealer-Sharma']) {
      expect(within(screen.getByTestId(row)).getByText('Out of date')).toBeInTheDocument();
    }
    await user.click(screen.getByRole('button', { name: 'Go to assemble' }));
    await screen.findByText('The cut');
    await waitFor(() => expect(api.callsTo('PATCH /films/1').map((c) => c.body)).toEqual([{ stage: 6 }]));
  });

  it('a film that matches its renders shows nothing out of date', async () => {
    openFilm(films.fresh, 7);
    await screen.findByRole('heading', { name: 'Deliver' });
    expect(screen.queryByText(/Out of date/)).not.toBeInTheDocument();
    expect(screen.queryByText(/The film changed after it was assembled/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rebuild exports/i })).toBeEnabled();
  });

  it('a fresh film can be re-assembled', async () => {
    openFilm(films.fresh, 6);
    await screen.findByText('The cut');
    expect(screen.queryByText(/This cut is out of date/)).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Before assembling' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /re-assemble/i })).toBeEnabled();
  });
});
