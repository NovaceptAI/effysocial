import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Budgets from './Budgets';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import { adsBudgets, budgetOutOfRange } from '../../test/fixtures/ads';
import { inr } from '../context/WorkspaceContext';

const row = adsBudgets.budgets[0];
const RANGE_MSG = 'Enter a budget between ₹1,000 and ₹1 crore.';
const open = (handlers = {}) => { const api = mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /ads/budgets': adsBudgets, ...handlers }); renderApp(<Budgets />, { route: '/app/budgets' }); return api; };

async function editFirstBudget() {
  await userEvent.click(await screen.findByRole('button', { name: new RegExp(inr(row.budget).replace(/[.₹]/g, '\\$&')) }));
  const input = screen.getByRole('spinbutton');
  const [save] = input.parentElement.querySelectorAll('button');
  return { input, save };
}

describe('Budgets — inline budget edit (ADS-005, ADS-006)', () => {
  it('blocks blank, too-small and too-large budgets with the allowed range', async () => {
    const api = open();
    const { input, save } = await editFirstBudget();
    for (const value of ['', '999', '10000001']) {
      await userEvent.clear(input);
      if (value) await userEvent.type(input, value);
      expect(screen.getByText(RANGE_MSG)).toBeInTheDocument();
      expect(save).toBeDisabled();
    }
    for (const value of ['1000', '10000000']) {
      await userEvent.clear(input);
      await userEvent.type(input, value);
      expect(screen.queryByText(RANGE_MSG)).not.toBeInTheDocument();
      expect(save).toBeEnabled();
    }
    expect(api.callsTo(`POST /ads/campaigns/${row.id}/budget`)).toHaveLength(0);
  });

  it('shows the server’s reason and stays in edit mode when the save is rejected', async () => {
    const api = open({ [`POST /ads/campaigns/${row.id}/budget`]: budgetOutOfRange });
    const { input, save } = await editFirstBudget();
    await userEvent.clear(input);
    await userEvent.type(input, '5000');
    await userEvent.click(save);

    expect(await screen.findByText(budgetOutOfRange[1].message)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(5000);
    expect(api.callsTo(`POST /ads/campaigns/${row.id}/budget`)[0].body).toMatchObject({ budget: 5000 });
  });

  it('closes the editor after a successful save', async () => {
    open({ [`POST /ads/campaigns/${row.id}/budget`]: { status: 'ok', mode: 'sandbox' } });
    const { input, save } = await editFirstBudget();
    await userEvent.clear(input);
    await userEvent.type(input, '45000');
    await userEvent.click(save);
    await waitFor(() => expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument());
  });

  it('explains a failed Pause instead of leaving you to think spend stopped', async () => {
    open({ [`POST /ads/campaigns/${row.id}/status`]: [502, { status: 'error', message: 'Could not reach the ads provider.' }] });
    const pause = (await screen.findAllByRole('button', { name: /pause/i }))[0];
    await userEvent.click(pause);
    expect(await screen.findByText('Could not reach the ads provider.')).toBeInTheDocument();
  });
});
