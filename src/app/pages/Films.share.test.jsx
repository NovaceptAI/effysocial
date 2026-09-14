import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Films from './Films';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// Copy link hands out a 7-day share link, not the in-app link that expires within a day (G46).
const inApp = '/api/effy/media/vid_master.mp4?e=1789430400&s=inapp';
const share = { status: 'ok', url: '/api/effy/media/vid_master.mp4?e=1790035200&s=share', expires: 1790035200 };
const until = new Date(share.expires * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

afterEach(() => vi.restoreAllMocks());

function clipboard() {
  const writeText = vi.fn().mockResolvedValue();
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

describe('Copy link gives a 7-day share link', () => {
  it('on the Ad Films list', async () => {
    const user = userEvent.setup();
    const writeText = clipboard();
    const api = mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /films': { status: 'ok', films: [{ ...films.fresh, status: 'delivered', renders: { ...films.fresh.renders, master: inApp } }] },
      'POST /media/share': share,
    });
    renderApp(<Films />, { route: '/app/films' });
    await user.click(await screen.findByRole('button', { name: /copy link/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(share.url));
    expect(api.callsTo('POST /media/share')[0].body).toEqual({ url: inApp });
    expect(screen.getByRole('status')).toHaveTextContent(`Copied · works until ${until}`);
  });

  it('on the Film Maker’s Deliver stage', async () => {
    const user = userEvent.setup();
    const writeText = clipboard();
    const film = { ...films.fresh, stage: 7, renders: { ...films.fresh.renders, whatsapp: inApp } };
    const api = mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /films/1': { status: 'ok', film },
      'GET /studio/voices': { voices: [] },
      'POST /media/share': share,
    });
    renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
    const row = await screen.findByTestId('export-whatsapp');
    await user.click(row.querySelector('button[title="Copy link"]'));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(share.url));
    expect(api.callsTo('POST /media/share')[0].body).toEqual({ url: inApp });
    expect(await screen.findByText(`WhatsApp 480p link copied. It works until ${until}.`)).toBeInTheDocument();
  });
});
