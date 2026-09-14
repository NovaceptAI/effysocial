import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DealerAvatarStudio from './DealerAvatarStudio';
import { slotProblem } from './BrandMasterCard';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/avatarMasters';

// Brand master for Personalized Avatar Video (G14, DEAL-007). Payloads come from the
// engine's test flow with real ffmpeg: a vertical upload, then a 10-second Media
// Library film made active, and a dealer rendered on each master.
const ws = bootstrapFixture.workspaces[0].id;
const open = (handlers) => {
  const api = mockApi({
    'GET /bootstrap': bootstrapFixture,
    'GET /studio/voices': { status: 'ok', voices: [], music: [] },
    'GET /dealer-avatars': { status: 'ok', dealers: [fx.dealerOnBrand] },
    'GET /dealer-avatars/masters': fx.placeholder,
    'GET /library': { status: 'ok', media: fx.library },
    ...handlers,
  });
  renderApp(<DealerAvatarStudio onBack={() => {}} />, { route: '/app/studio' });
  return api;
};
// The panel renders while the masters load; wait until its actions are there.
const card = async () => {
  const c = await screen.findByRole('region', { name: 'Brand master' });
  await within(c).findByRole('button', { name: /upload video/i });
  return c;
};

describe('Personalized Avatar Video — brand master', () => {
  it('shows that renders use the placeholder until a master is added', async () => {
    open();
    const c = await card();
    expect(within(c).getByText('Placeholder')).toBeInTheDocument();
    expect(within(c).getByText(/24-second placeholder/)).toBeInTheDocument();
    expect(within(c).queryByRole('button', { name: 'Use placeholder' })).not.toBeInTheDocument();
  });

  it('uploads a master, refusing files over 25 MB before sending them', async () => {
    const api = open({ 'POST /dealer-avatars/masters': fx.twoMasters });
    const c = await card();
    const input = c.querySelector('input[type="file"]');
    const huge = new File(['x'], 'huge.mp4', { type: 'video/mp4' });
    Object.defineProperty(huge, 'size', { value: 26 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [huge] } });
    expect(within(c).getByRole('alert')).toHaveTextContent('over 25 MB. Add it to the Media Library');
    expect(api.callsTo('POST /dealer-avatars/masters')).toHaveLength(0);

    fireEvent.change(input, { target: { files: [new File(['v'], 'diwali.mov', { type: 'video/quicktime' })] } });
    await waitFor(() => expect(api.callsTo('POST /dealer-avatars/masters')).toHaveLength(1));
    expect(await within(c).findByText('Film master — Roof Ka Rakshak')).toBeInTheDocument();
    expect(within(c).getByText('Brand master', { selector: 'span' })).toBeInTheDocument();
    expect(within(c).getByText(/10\.0 s · 1280×720 landscape · from the Media Library/)).toBeInTheDocument();
    expect(within(c).getByText('Diwali reel cut')).toBeInTheDocument(); // the earlier upload, now inactive
  });

  it('chooses a video from the Media Library', async () => {
    const user = userEvent.setup();
    const api = open({ 'POST /dealer-avatars/masters/from-library': fx.twoMasters });
    const c = await card();
    await user.click(within(c).getByRole('button', { name: /choose from media library/i }));
    const tile = (await within(c).findByTitle('Film master — Roof Ka Rakshak')).closest('div');
    await user.click(within(tile).getByRole('button', { name: /use this video/i }));
    await waitFor(() => expect(api.callsTo('POST /dealer-avatars/masters/from-library').map((x) => x.body))
      .toEqual([{ workspace: ws, name: 'vid_fixture_library_master.mp4' }]));
    expect(await within(c).findByText('Film master — Roof Ka Rakshak', { selector: 'p' })).toBeInTheDocument();
  });

  it('edits when each layer appears, catching impossible timings before saving', async () => {
    const user = userEvent.setup();
    const api = open({ 'GET /dealer-avatars/masters': fx.twoMasters, [`PATCH /dealer-avatars/masters/${fx.twoMasters.active.id}`]: fx.twoMasters });
    const c = await card();
    const end = await within(c).findByLabelText('End card end (seconds)');
    await user.clear(end);
    await user.type(end, '99');
    await user.click(within(c).getByRole('button', { name: 'Save timings' }));
    expect(within(c).getByRole('alert')).toHaveTextContent(fx.slotError.message);
    expect(api.callsTo(`PATCH /dealer-avatars/masters/${fx.twoMasters.active.id}`)).toHaveLength(0);

    await user.clear(end);
    await user.type(end, '9.5');
    await user.click(within(c).getByRole('button', { name: 'Save timings' }));
    await waitFor(() => expect(api.callsTo(`PATCH /dealer-avatars/masters/${fx.twoMasters.active.id}`)).toHaveLength(1));
    expect(api.callsTo(`PATCH /dealer-avatars/masters/${fx.twoMasters.active.id}`)[0].body.slots.endCard).toEqual({ t0: fx.twoMasters.active.slots.endCard.t0, t1: 9.5 });
  });

  it('the dealer’s render says which master it uses and was built on (DEAL-007)', async () => {
    const user = userEvent.setup();
    open({ 'GET /dealer-avatars/masters': fx.twoMasters });
    await user.click(await screen.findByRole('button', { name: /sharma/i }));
    await waitFor(() => expect(screen.getByTestId('render-master')).toHaveTextContent('Renders on Film master — Roof Ka Rakshak (brand master, 10.0 s)'));
    const built = screen.getByTestId('built-on');
    expect(built).toHaveTextContent('Built on “Film master — Roof Ka Rakshak”');
    expect(built).not.toHaveTextContent('has changed');
  });

  it('warns when the master changed after the render', async () => {
    const user = userEvent.setup();
    open({ 'GET /dealer-avatars': { status: 'ok', dealers: [fx.dealerOnPlaceholder] }, 'GET /dealer-avatars/masters': fx.twoMasters });
    await user.click(await screen.findByRole('button', { name: /sharma/i }));
    await waitFor(() => expect(screen.getByTestId('built-on')).toHaveTextContent(
      /^Built on the placeholder master\s*The master has changed since this render — re-render to use “Film master — Roof Ka Rakshak”\.$/));
  });

  it('client-side timing rules match the engine', () => {
    const { slots, durationS } = fx.twoMasters.active;
    expect(slotProblem(slots, durationS)).toBe('');
    expect(slotProblem({ ...slots, endCard: { t0: 8, t1: 99 } }, durationS)).toBe(fx.slotError.message);
    expect(slotProblem({ ...slots, avatar2: { t0: 5, t1: 6 } }, durationS)).toMatch('at least 2 seconds');
  });
});
