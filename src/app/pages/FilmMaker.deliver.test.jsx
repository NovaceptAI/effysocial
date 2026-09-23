import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// Deliver on one screen: the master to watch beside the exports it makes, dealer versions
// side by side with the list, and the records in a sidebar.
// Assembled and approved, with no exports or dealer versions built yet.
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

  it('says where dealer versions will appear before any are built', async () => {
    open(assembled);
    await screen.findByRole('heading', { name: 'Deliver' });
    expect(screen.getByLabelText('Dealers')).toBeInTheDocument();
    expect(screen.getByText('Built versions appear here, each with its own download and sign-off.')).toBeInTheDocument();
  });
});
