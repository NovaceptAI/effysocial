import React from 'react';
import { describe, expect, it } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// Generate all, then Approve all. Approve all must not act until the film shows every
// new still; otherwise it approves only the stills that had arrived (seen in the
// demo-film browser run as "1/2 stills approved").
const noStill = (s) => ({ ...s, still: '', stillUrl: '', stillStatus: 'draft', signoff: null });

describe('Ad Films — bulk stills', () => {
  it('Approve all waits until every generated still has loaded', async () => {
    const user = userEvent.setup();
    let scenes = films.fresh.scenes.map(noStill);
    let hold = null; // a pending GET /films/1, released by the test
    const film = () => ({ status: 'ok', film: { ...films.fresh, stage: 3, scenes } });
    const api = mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /studio/voices': { voices: [] },
      'GET /films/1': () => (hold ? hold.promise.then(film) : film()),
      'PATCH /films/1': () => film(),
      'POST /films/1/scenes/1/still': () => { scenes = scenes.map((s) => (s.id === 1 ? { ...films.fresh.scenes[0], stillStatus: 'still_ready', signoff: null } : s)); return { status: 'ok' }; },
      'POST /films/1/scenes/2/still': async () => {
        await new Promise((r) => { setTimeout(r, 30); }); // the first still's refetch lands meanwhile
        scenes = scenes.map((s) => (s.id === 2 ? { ...films.fresh.scenes[1], stillStatus: 'still_ready', signoff: null } : s));
        let release;
        hold = { promise: new Promise((r) => { release = r; }), release: () => release() };
        return { status: 'ok' };
      },
      'POST /films/1/scenes/1/approve': () => { scenes = scenes.map((s) => (s.id === 1 ? { ...s, stillStatus: 'approved' } : s)); return { status: 'ok' }; },
      'POST /films/1/scenes/2/approve': () => { scenes = scenes.map((s) => (s.id === 2 ? { ...s, stillStatus: 'approved' } : s)); return { status: 'ok' }; },
    });
    renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });

    await user.click(await screen.findByRole('button', { name: /generate all/i }));
    await waitFor(() => expect(api.callsTo('POST /films/1/scenes/2/still')).toHaveLength(1));
    await act(() => new Promise((r) => { setTimeout(r, 30); }));
    // The film with the second still hasn't loaded yet, so bulk actions stay locked.
    const early = screen.queryByRole('button', { name: /approve all/i });
    if (early) expect(early).toBeDisabled();

    const { release } = hold;
    hold = null;
    await act(async () => { release(); });
    await waitFor(() => expect(screen.getByText(/0\/2 stills approved/)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /approve all/i }));
    expect(await screen.findByText('2/2 stills approved')).toBeInTheDocument();
    expect(api.callsTo('POST /films/1/scenes/1/approve')).toHaveLength(1);
    expect(api.callsTo('POST /films/1/scenes/2/approve')).toHaveLength(1);
  });
});
