import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import AIStudio from './AIStudio';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';

// A template hands off to Studio: ?format= opens that format straight away, with the
// template's brief already in the brief box (launch plan 5.2, G39).
const shell = {
  'GET /bootstrap': bootstrapFixture,
  'GET /studio/context': { status: 'ok' },
  'GET /studio/voices': { status: 'ok', voices: [], music: [{ key: '', name: 'None' }] },
  'GET /integrations': { status: 'ok', integrations: [] },
  'GET /characters': { status: 'ok', presets: [], custom: [] },
};
const brief = 'A three-step how-to the customer can actually follow.';

describe('AI Studio opened from a template', () => {
  it('starts in the template’s own format with its brief', async () => {
    mockApi(shell);
    renderApp(<AIStudio />, { route: `/app/studio?format=ig_carousel&topic=${encodeURIComponent(brief)}&template=edu-how-to` });
    expect(await screen.findByText('Carousel')).toBeInTheDocument();
    expect(screen.getByDisplayValue(brief)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Create a post' })).not.toBeInTheDocument();
  });

  it('a reel template opens the reel format, not the first one', async () => {
    mockApi(shell);
    renderApp(<AIStudio />, { route: '/app/studio?format=ig_reel&topic=Behind%20the%20scenes' });
    expect(await screen.findByText('Instagram Reel')).toBeInTheDocument();
  });

  it('a format nobody offers still opens the chooser', async () => {
    mockApi(shell);
    renderApp(<AIStudio />, { route: '/app/studio?format=not_a_format' });
    expect(await screen.findByRole('heading', { name: 'Create a post' })).toBeInTheDocument();
  });
});
