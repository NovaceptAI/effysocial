import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ProductShotStudio from './ProductShotStudio';
import AIStudio from '../pages/AIStudio';
import AppLauncher from '../pages/AppLauncher';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/brandAndShots';

// Product Shots: delete a project (PROD-011), open one from Home (HOME-003), and the
// X filter in AI Studio (STU-002). Payloads come from the engine's test flow.
const [newest, older] = fx.productShots.shots;
afterEach(() => vi.restoreAllMocks());

function Where() {
  const loc = useLocation();
  return <output data-testid="where">{loc.pathname}{loc.search}</output>;
}

describe('Product Shots', () => {
  it('deletes a project after confirmation (PROD-011)', async () => {
    const user = userEvent.setup();
    let shots = fx.productShots.shots;
    const api = mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /product-shots': () => ({ status: 'ok', shots }),
      [`DELETE /product-shots/${older.id}`]: () => { shots = shots.filter((s) => s.id !== older.id); return { status: 'ok' }; },
    });
    renderApp(<ProductShotStudio onBack={() => {}} />, { route: '/app/studio' });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);

    await user.click(await screen.findByRole('button', { name: `Delete ${older.title}` }));
    expect(confirm).toHaveBeenLastCalledWith(expect.stringContaining(`Delete “${older.title}”?`));
    expect(api.callsTo(`DELETE /product-shots/${older.id}`)).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: `Delete ${older.title}` }));
    await waitFor(() => expect(api.callsTo(`DELETE /product-shots/${older.id}`)).toHaveLength(1));
    await waitFor(() => expect(screen.queryByRole('button', { name: `Open ${older.title}` })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: `Open ${newest.title}` })).toBeInTheDocument();
  });

  it('a recent Product Shot on Home links to its own project (HOME-003)', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /films': { status: 'ok', films: [] },
      'GET /product-shots': fx.productShots,
      'GET /library': { status: 'ok', media: [] },
    });
    renderApp(<><AppLauncher /><Where /></>, { route: '/app' });
    await user.click(await screen.findByRole('button', { name: new RegExp(older.title) }));
    expect(screen.getByTestId('where')).toHaveTextContent(`/app/studio?productShot=${older.id}`);
  });

  it('AI Studio opens that project straight away', async () => {
    mockApi({
      'GET /bootstrap': bootstrapFixture,
      'GET /studio/context': { status: 'ok' },
      'GET /studio/voices': { status: 'ok', voices: [], music: [] },
      'GET /product-shots': fx.productShots,
      [`GET /product-shots/${fx.productShot.shot.id}`]: fx.productShot,
    });
    renderApp(<AIStudio />, { route: `/app/studio?productShot=${fx.productShot.shot.id}` });
    expect(await screen.findByText(fx.productShot.shot.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all product shots/i })).toBeInTheDocument();
  });

  it('AI Studio has an X filter showing X Post (STU-002)', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /studio/context': { status: 'ok' }, 'GET /studio/voices': { status: 'ok', voices: [], music: [] } });
    renderApp(<AIStudio />, { route: '/app/studio' });
    await user.click(await screen.findByRole('button', { name: 'X' }));
    const cards = screen.getAllByRole('button').filter((b) => /1600 × 900|1080 × 1350|1200 × 1200/.test(b.textContent));
    expect(cards.map((b) => b.textContent)).toEqual([expect.stringContaining('X Post')]);
  });
});
