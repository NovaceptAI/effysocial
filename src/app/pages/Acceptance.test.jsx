import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Acceptance from './Acceptance';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import acceptance from '../../test/fixtures/acceptance';

// Acceptance records (G13, FILM-029). Payloads come from the engine's test flow: a
// delivered film accepted with fixes by a Client approver, a built product shot with
// no verdict, and an AI Studio job accepted after two drafts.
const rowFor = (title) => screen.getByText(title).closest('tr');

describe('Creation Acceptance page', () => {
  it('summarises every project and its verdict', async () => {
    mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /acceptance': acceptance.list });
    renderApp(<Acceptance />, { route: '/app/analytics/acceptance' });
    expect(await screen.findByText('100%')).toBeInTheDocument(); // acceptance rate
    expect(screen.getByText(`$${acceptance.list.totals.costUsd.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(/2 of 3 with a verdict · 1 accepted without fixes/)).toBeInTheDocument();

    const film = rowFor('Roof Ka Rakshak');
    expect(within(film).getByText('Ad Film')).toBeInTheDocument();
    expect(within(film).getByText('Accepted with fixes')).toBeInTheDocument();
    expect(within(film).getByRole('link', { name: 'Roof Ka Rakshak' })).toHaveAttribute('href', expect.stringMatching(/\/app\/films\/\d+$/));
    expect(within(rowFor('Glow serum')).getByText('Not recorded')).toBeInTheDocument();
    expect(within(rowFor('Instagram post — monsoon offer')).getByText('Accepted')).toBeInTheDocument();
  });

  it('records a verdict for a product shot, asking what was wrong when it isn’t a clean accept', async () => {
    const user = userEvent.setup();
    const shot = acceptance.list.rows.find((r) => r.kind === 'product_shot');
    const api = mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /acceptance': acceptance.list,
      [`POST /acceptance/product_shot/${shot.ref}`]: { status: 'ok', record: {}, summary: shot.summary },
    });
    renderApp(<Acceptance />, { route: '/app/analytics/acceptance' });
    await user.click(within(await waitFor(() => rowFor('Glow serum'))).getByRole('button', { name: 'Details' }));
    const card = screen.getByRole('region', { name: 'Product Shot acceptance' });
    expect(within(card).getByText('Stills generated')).toBeInTheDocument();
    expect(within(card).getByText('No verdict recorded yet.')).toBeInTheDocument();

    await user.click(within(card).getByRole('button', { name: 'Record verdict' }));
    await user.click(within(card).getByLabelText('Rejected'));
    await user.click(within(card).getByRole('button', { name: 'Save verdict' }));
    expect(within(card).getByRole('alert')).toHaveTextContent('Describe what was wrong.');
    expect(api.callsTo(`POST /acceptance/product_shot/${shot.ref}`)).toHaveLength(0);

    await user.type(within(card).getByLabelText('What was wrong (required)'), 'Label text warped');
    await user.selectOptions(within(card).getByLabelText('Quality'), '2');
    await user.type(within(card).getByLabelText('Delivery hours (human time)'), '1.5');
    await user.click(within(card).getByRole('button', { name: 'Save verdict' }));
    await waitFor(() => expect(api.callsTo(`POST /acceptance/product_shot/${shot.ref}`).map((c) => c.body)).toEqual([{
      workspace: bootstrapFixture.workspaces[0].id, result: 'rejected', quality: 2, deliveryHours: 1.5,
      defects: 'Label text warped', notes: '',
    }]));
  });

  it('shows an empty state when nothing has been made', async () => {
    mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /acceptance': { status: 'ok', rows: [], totals: { projects: 0 } } });
    renderApp(<Acceptance />, { route: '/app/analytics/acceptance' });
    expect(await screen.findByText('Nothing to review yet')).toBeInTheDocument();
  });
});

describe('Film Maker — acceptance record on Deliver (FILM-029)', () => {
  it('shows cost, attempts, retries, rounds, turnaround and the verdict', async () => {
    const user = userEvent.setup();
    const film = { ...acceptance.film, stage: 7 };
    const api = mockApi({
      'GET /bootstrap': bootstrapFixture,
      [`GET /films/${film.id}`]: { status: 'ok', film },
      'GET /studio/voices': { voices: [] },
      [`POST /acceptance/film/${film.id}`]: { status: 'ok', record: {}, summary: film.acceptance },
    });
    renderApp(<FilmMaker />, { route: `/app/films/${film.id}`, path: '/app/films/:id' });
    const card = await screen.findByRole('region', { name: 'Acceptance record' });
    const metric = (label) => within(card).getByText(label).nextSibling.textContent;
    expect(metric('Generation cost')).toBe(`$${film.acceptance.costUsd.toFixed(2)}`);
    expect(metric('Stills generated')).toBe('3');
    expect(metric('Clip renders')).toBe('3');
    expect(metric('Retries')).toBe('2');
    expect(metric('Revision rounds')).toBe('2'); // scene 1's still was regenerated and approved again
    expect(metric('Approval rate')).toBe('100%');
    expect(metric('Turnaround (brief to exports)')).not.toBe('Not delivered yet');
    expect(within(card).getByTestId('verdict')).toHaveTextContent(
      'Accepted with fixes · quality 4/5 · 3 delivery hours — recorded by Meera Iyer (Client approver)');
    expect(within(card).getByTestId('verdict')).toHaveTextContent('Defects: “End card logo slightly soft”');

    await user.click(within(card).getByRole('button', { name: 'Update verdict' }));
    await user.click(within(card).getByRole('button', { name: 'Save verdict' }));
    await waitFor(() => expect(api.callsTo(`POST /acceptance/film/${film.id}`).map((c) => c.body)).toEqual([
      { result: 'accepted', quality: null, deliveryHours: null, defects: '', notes: '' },
    ]));
  });
});
