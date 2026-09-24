import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// Deliver on one screen: the master to watch beside the exports it makes, and the records
// in a sidebar. There are no dealer versions here any more.
// Assembled and approved, with no exports built yet.
const assembled = { ...films.fresh, renders: { master: films.fresh.renders.master, qa: films.fresh.renders.qa } };

const open = (film) => {
  mockApi({
    'GET /bootstrap': bootstrapFixture,
    'GET /films/1': { status: 'ok', film: { ...film, stage: 7 } },
    'GET /studio/voices': { status: 'ok', voices: [], libraryVoices: false },
  });
  renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
};

describe('Film Maker — Deliver', () => {
  it('shows the master to watch, and the exports the button will build', async () => {
    open(assembled);
    await screen.findByRole('heading', { name: 'Deliver' });
    expect(screen.getByLabelText('The master')).toHaveAttribute('src', films.fresh.renders.master);
    expect(screen.getByTestId('export-master')).toBeInTheDocument();
    for (const k of ['reel', 'whatsapp']) {
      expect(screen.getByTestId(`export-${k}-pending`)).toHaveTextContent('Built with the exports');
      expect(screen.queryByTestId(`export-${k}`)).not.toBeInTheDocument();
    }
  });

  it('has no dealer versions section', async () => {
    open(films.fresh);   // even a film that had dealer versions built before
    await screen.findByRole('heading', { name: 'Deliver' });
    expect(screen.queryByText('DEALER VERSIONS')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /dealer versions/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('dealer-Sharma')).not.toBeInTheDocument();
  });
});
