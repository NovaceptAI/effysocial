import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIStudio from './AIStudio';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';

// Failures in AI Studio must be visible (STU-011, STU-015, STU-017) and sending must not duplicate (STU-014).
const shell = {
  'GET /bootstrap': bootstrapFixture,
  'GET /studio/context': { status: 'ok' },
  'GET /studio/voices': { status: 'ok', voices: [], music: [{ key: '', name: 'None' }] },
  'GET /integrations': { status: 'ok', integrations: [] },
  'GET /characters': { status: 'ok', presets: [], custom: [] },
};
const draft = { status: 'ok', caption: 'Monsoon check-ups are 20% off this week.', hashtags: [], scores: [], hook: 'Rain or shine.', cta: 'Book now', cited: [] };
const later = (value, ms = 60) => () => new Promise((r) => setTimeout(() => r(value), ms));

async function draftReady(handlers) {
  const api = mockApi({ ...shell, 'POST /studio/generate': draft, ...handlers });
  renderApp(<AIStudio />, { route: '/app/studio?topic=Monsoon%20offer' });
  await userEvent.click((await screen.findAllByRole('button', { name: /^generate$/i }))[0]);
  await screen.findByDisplayValue(draft.caption);
  return api;
}

describe('AI Studio — visible failures', () => {
  it('shows why Send to approval failed and lets you try again (STU-015)', async () => {
    const api = await draftReady({ 'POST /studio/send-to-approval': [403, { status: 'error', message: 'Your role (View-only) can’t make this change.' }] });
    await userEvent.click(screen.getByRole('button', { name: /send to approval/i }));

    expect(await screen.findByText('Your role (View-only) can’t make this change.')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /send to approval/i });
    expect(button).toBeEnabled();
    expect(api.callsTo('POST /studio/send-to-approval')).toHaveLength(1);
  });

  it('sends one post even when Send to approval is double-clicked (STU-014)', async () => {
    const api = await draftReady({ 'POST /studio/send-to-approval': later({ status: 'ok', post: { id: 3 } }) });
    const button = screen.getByRole('button', { name: /send to approval/i });
    await userEvent.dblClick(button);

    expect(await screen.findByRole('button', { name: /sent/i })).toBeDisabled();
    expect(api.callsTo('POST /studio/send-to-approval')).toHaveLength(1);
  });

  it('shows why a refine failed and keeps the caption (STU-011)', async () => {
    await draftReady({ 'POST /studio/refine': [503, { status: 'error', message: 'Refine unavailable. Try again.' }] });
    await userEvent.click(screen.getAllByRole('button', { name: /^refine$/i })[0]);
    await userEvent.click(await screen.findByRole('button', { name: 'Shorten' }));

    expect(await screen.findByText('Refine unavailable. Try again.')).toBeInTheDocument();
    expect(screen.getByDisplayValue(draft.caption)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Shorten' })).toBeEnabled());
  });

  it('shows why image generation failed (STU-017)', async () => {
    await draftReady({ 'POST /studio/image': [503, { status: 'error', message: 'Image generation is busy right now — try again in a moment.' }] });
    await userEvent.click(screen.getByRole('button', { name: /generate image/i }));

    expect(await screen.findByText('Image generation is busy right now — try again in a moment.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate image/i })).toBeEnabled();
  });
});
