import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreditsChip, { nextReset } from './shell/CreditsChip';
import TopBar from './shell/TopBar';
import { effyApi } from './api/effyApi';
import { mockApi } from '../test/mockApi';
import { renderApp } from '../test/render';
import plans from '../test/fixtures/plans';

// The credits chip in the top bar (launch plan 6.20). Credit payloads come from the
// engine's test flow (fixtures/plans.js).
const chip = () => screen.findByRole('link', { name: /^Credits:/ });

describe('Credits chip', () => {
  it('shows the credits left this month and opens Billing', async () => {
    mockApi({ 'GET /bootstrap': plans.trialEndedBootstrap, 'GET /billing/credits': plans.trialEndedCredits });
    renderApp(<CreditsChip />, { route: '/app' });
    const c = await chip();
    expect(c).toHaveTextContent('150 credits left');
    expect(c).toHaveAttribute('href', '/app/billing');
    expect(c).toHaveAttribute('data-state', 'ok');
    expect(c).toHaveAccessibleName(`Credits: 150 of 150 credits left this month. They reset on ${nextReset()}. Open Billing.`);
  });

  it('turns amber from 80% used', async () => {
    mockApi({ 'GET /bootstrap': plans.growthBootstrap, 'GET /billing/credits': plans.growthCreditsNear });
    renderApp(<CreditsChip />, { route: '/app' });
    const c = await chip();
    expect(c).toHaveTextContent('80 credits left');
    expect(c).toHaveAttribute('data-state', 'near');
    expect(c).toHaveAccessibleName(/80 of 500 credits left this month/);
  });

  it('turns red once all are used, without saying work is blocked', async () => {
    mockApi({ 'GET /bootstrap': plans.growthBootstrap, 'GET /billing/credits': plans.growthCreditsOver });
    renderApp(<CreditsChip />, { route: '/app' });
    const c = await chip();
    expect(c).toHaveTextContent('0 credits left');
    expect(c).toHaveAttribute('data-state', 'over');
    expect(c).toHaveAccessibleName(/All 500 of this month’s credits are used\. Work isn’t blocked yet\./);
  });

  it('never rounds credits up', async () => {
    mockApi({ 'GET /bootstrap': plans.growthBootstrap, 'GET /billing/credits': { ...plans.growthCreditsNear, used: 420.5, remaining: 79.5 } });
    renderApp(<CreditsChip />, { route: '/app' });
    expect(await chip()).toHaveTextContent('79 credits left');
  });

  it('reads the credits again after the app changes something', async () => {
    let used = 0;
    mockApi({
      'GET /bootstrap': plans.trialEndedBootstrap,
      'GET /billing/credits': () => ({ ...plans.trialEndedCredits, used, remaining: 150 - used }),
      'POST /brand/test': () => { used = 4; return { status: 'ok', reply: 'Hello' }; },
    });
    renderApp(<CreditsChip />, { route: '/app' });
    expect(await chip()).toHaveTextContent('150 credits left');
    await effyApi.testBrandVoice('ws_1', 'Say hello');
    await waitFor(() => expect(screen.getByRole('link', { name: /^Credits:/ })).toHaveTextContent('146 credits left'), { timeout: 3000 });
  });

  it('on phones, the avatar menu says the same, and a dot warns when they run low', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': plans.growthBootstrap, 'GET /billing/credits': plans.growthCreditsNear });
    renderApp(<TopBar onOpenPalette={() => {}} onOpenAssistant={() => {}} onOpenNav={() => {}} />, { route: '/app' });
    expect(await screen.findByRole('img', { name: 'Credits running low' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Credits:/ })).toHaveLength(1);   // the chip; the menu is closed
    await user.click(screen.getByTitle('Asha Rao'));
    const inMenu = screen.getAllByRole('link', { name: /^Credits:/ })[1];
    expect(inMenu).toHaveTextContent(`80 credits leftresets ${nextReset()}`);
    expect(inMenu).toHaveAttribute('href', '/app/billing');
    expect(inMenu).toHaveAttribute('data-state', 'near');
  });

  it('no dot while there are plenty of credits', async () => {
    mockApi({ 'GET /bootstrap': plans.trialEndedBootstrap, 'GET /billing/credits': plans.trialEndedCredits });
    renderApp(<TopBar onOpenPalette={() => {}} onOpenAssistant={() => {}} onOpenNav={() => {}} />, { route: '/app' });
    await chip();
    expect(screen.queryByRole('img', { name: /^Credits/ })).not.toBeInTheDocument();
  });

  it('knows when the credits reset, across the year end', () => {
    expect(nextReset(new Date('2026-09-30T12:00:00Z'))).toBe('1 Oct');
    expect(nextReset(new Date('2026-12-31T23:00:00Z'))).toBe('1 Jan');
  });
});
