import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import FilmMaker from './FilmMaker';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import films from '../../test/fixtures/films';

// A Veo refusal during a scene render is shown, not swallowed (G18, ENV-013).
// The refusal body is what refusals.veo() returns for a safety filter.
const REFUSAL = {
  "code": 422,
  "body": {
    "status": "error",
    "message": "Google Veo declined this video under its safety rules (Your video contains prominent people). Try a different image or description: close-up faces, real people and logos are refused most often. No credits were charged.",
    "reason": "safety",
    "charged": false
  }
};

afterEach(() => vi.useRealTimers());

describe('Film Maker — refused scene render', () => {
  it('tells the user why the render stopped', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const [first, ...rest] = films.fresh.scenes;
    let film = { ...films.fresh, stage: 4, scenes: [{ ...first, clipStatus: 'animating', op: 'operations/refused' }, ...rest] };
    const api = mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /films/1': () => ({ status: 'ok', film }),
      'GET /studio/voices': { voices: [] },
      [`POST /films/1/scenes/${first.id}/animate/status`]: () => {
        film = { ...film, scenes: [{ ...first, clipStatus: '', op: '' }, ...rest] };
        return [REFUSAL.code, REFUSAL.body];
      },
    });
    renderApp(<FilmMaker />, { route: '/app/films/1', path: '/app/films/:id' });
    await screen.findByText(/Renders cost/);
    await act(async () => { vi.advanceTimersByTime(8100); });
    await waitFor(() => expect(api.callsTo(`POST /films/1/scenes/${first.id}/animate/status`)).toHaveLength(1));
    expect(await screen.findByText(/Scene 1: Google Veo declined this video under its safety rules/)).toBeInTheDocument();
    expect(screen.getByText(/No credits were charged\./)).toBeInTheDocument();
  });
});
