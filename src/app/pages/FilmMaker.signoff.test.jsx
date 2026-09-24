import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// Sign-off record in Ad Films (G12, FILM-028). Payloads come from the engine's test
// flow: Meera Iyer is a Client approver; the film includes 1 revision per deliverable.
function openFilm(film, stage, handlers = {}) {
  const api = mockApi({
    'GET /bootstrap': bootstrapFixture,
    'GET /films/1': { status: 'ok', film: { ...film, stage } },
    'GET /studio/voices': { voices: [] },
    'PATCH /films/1': (body) => ({ status: 'ok', film: { ...film, stage, ...body } }),
    ...handlers,
  });
  renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
  return api;
}


describe('Ad Films — who signed off, when, and in which round', () => {
  it('each still shows its approver, round and any extra scope', async () => {
    openFilm(films.fresh, 3);
    await screen.findByText(/stills approved/);
    const [first, second] = screen.getAllByTestId('signoff');
    expect(first).toHaveTextContent(/^Approvedby .+ · .+ · round 1$/);
    expect(within(first).queryByText('Extra scope')).not.toBeInTheDocument();
    expect(second).toHaveTextContent('by Meera Iyer (Client approver)');
    expect(second).toHaveTextContent('round 3');
    expect(within(second).getByText('Extra scope')).toBeInTheDocument();
  });

  it('an approval from before sign-off records says the approver is unknown', async () => {
    const legacy = { ...films.fresh, scenes: films.fresh.scenes.map((s) => ({ ...s, signoff: null })) };
    openFilm(legacy, 3);
    expect(await screen.findAllByText('Approved — approver not recorded')).toHaveLength(2);
  });

  it('the master is approved from the assemble stage', async () => {
    const user = userEvent.setup();
    const api = openFilm(films.awaitingMasterSignoff, 6, {
      'POST /films/1/signoff': () => ({ status: 'ok', film: { ...films.fresh, stage: 6 } }),
    });
    const box = await screen.findByRole('region', { name: 'Master sign-off' });
    expect(within(box).getByText(/Not signed off yet/)).toBeInTheDocument();
    await user.click(within(box).getByRole('button', { name: /approve master/i }));
    await waitFor(() => expect(api.callsTo('POST /films/1/signoff').map((c) => c.body))
      .toEqual([{ stage: 'master', decision: 'approved' }]));
    expect(await within(box).findByTestId('signoff')).toHaveTextContent('Approvedby Meera Iyer (Client approver)');
    expect(within(box).queryByRole('button', { name: /approve master/i })).not.toBeInTheDocument();
  });

  it('asking for changes to the master needs a note, and sends it', async () => {
    const user = userEvent.setup();
    const api = openFilm(films.awaitingMasterSignoff, 6, {
      'POST /films/1/signoff': () => ({ status: 'ok', film: { ...films.awaitingMasterSignoff, stage: 6 } }),
    });
    const box = await screen.findByRole('region', { name: 'Master sign-off' });
    const request = within(box).getByRole('button', { name: 'Request changes' });
    expect(request).toBeDisabled();
    await user.type(within(box).getByLabelText('What needs to change'), 'Logo bigger on the end card');
    await user.click(request);
    await waitFor(() => expect(api.callsTo('POST /films/1/signoff').map((c) => c.body))
      .toEqual([{ stage: 'master', decision: 'changes_requested', note: 'Logo bigger on the end card' }]));
  });

  it('delivery stays locked until the master is approved', async () => {
    openFilm(films.awaitingMasterSignoff, 7);
    await screen.findByRole('heading', { name: 'Deliver' });
    expect(screen.getByText('Approve the master before building exports.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /build exports/i })).toBeDisabled();
  });

  it('cutdowns are approved one by one and the full record is listed', async () => {
    const user = userEvent.setup();
    const api = openFilm(films.fresh, 7, {
      'POST /films/1/signoff': () => ({ status: 'ok', film: { ...films.fresh, stage: 7 } }),
    });
    await screen.findByRole('heading', { name: 'Deliver' });
    expect(screen.getByRole('button', { name: /rebuild exports/i })).toBeEnabled();
    expect(within(screen.getByTestId('export-master')).getByTestId('signoff')).toHaveTextContent('Approvedby Meera Iyer');
    expect(within(screen.getByTestId('export-whatsapp')).getByTestId('signoff')).toHaveTextContent('Approved');
    expect(within(screen.getByTestId('export-whatsapp')).queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();

    await user.click(within(screen.getByTestId('export-reel')).getByRole('button', { name: /approve/i }));
    await waitFor(() => expect(api.callsTo('POST /films/1/signoff').map((c) => c.body)).toEqual([
      { stage: 'cutdown', target: 'reel', decision: 'approved' },
    ]));

    const record = screen.getByRole('region', { name: 'Sign-off record' });
    expect(record).toHaveTextContent('Revisions included: 1 per deliverable · 1 extra-scope decision(s)');
    const rows = within(record).getAllByRole('listitem');
    expect(rows).toHaveLength(films.fresh.signoffs.history.length);
    expect(rows[0]).toHaveTextContent('WhatsApp 480p');
    expect(within(record).getAllByText('Master')).toHaveLength(2);
    expect(within(record).getByText('“Logo bigger on the end card”')).toBeInTheDocument();
    expect(within(record).getAllByText('Scene 2 still').length).toBeGreaterThanOrEqual(3);
  });

  it('the revision allowance is set on the direction stage', async () => {
    const user = userEvent.setup();
    const api = openFilm(films.fresh, 1);
    const input = await screen.findByLabelText('Revisions included');
    expect(input).toHaveValue(1);
    await user.clear(input);
    await user.type(input, '2');
    await user.tab();
    await user.clear(screen.getByLabelText('Revisions included'));
    await user.tab();
    await waitFor(() => expect(api.callsTo('PATCH /films/1').map((c) => c.body))
      .toEqual([{ revisionAllowance: 2 }, { revisionAllowance: null }]));
  });
});
