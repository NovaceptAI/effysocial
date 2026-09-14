import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Rules from './Rules';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import { adsRules, adsDryRun } from '../../test/fixtures/ads';

const ruleId = adsRules.rules[0].id;
const open = (handlers) => { const api = mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /ads/rules': adsRules, ...handlers }); renderApp(<Rules />, { route: '/app/rules' }); return api; };

describe('Automated Rules — visible failures', () => {
  it('shows the dry run result when it succeeds (ADS-010)', async () => {
    open({ 'POST /ads/rules/dry-run': adsDryRun });
    await userEvent.click(await screen.findByRole('button', { name: /run check/i }));
    expect(await screen.findAllByText('CPL guard')).not.toHaveLength(0);
  });

  it('explains a failed dry run and re-enables the check (ADS-010)', async () => {
    open({ 'POST /ads/rules/dry-run': [502, { status: 'error', message: 'Ads provider timed out.' }] });
    await userEvent.click(await screen.findByRole('button', { name: /run check/i }));
    expect(await screen.findByText('Ads provider timed out.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run check/i })).toBeEnabled();
  });

  it('explains a failed enable/disable or delete instead of doing nothing (ADS-011)', async () => {
    open({
      [`PATCH /ads/rules/${ruleId}`]: [502, { status: 'error', message: 'Could not reach the ads provider.' }],
      [`DELETE /ads/rules/${ruleId}`]: [404, { status: 'error', message: 'Unknown rule.' }],
    });
    // The rule's own card: its first button pauses or resumes it, the second deletes it.
    const card = (await screen.findAllByText('CPL guard'))[0].closest('div.p-4, [class*="p-4"]');
    const [toggle, remove] = within(card).getAllByRole('button');
    await userEvent.click(toggle);
    expect(await screen.findByText('Could not reach the ads provider.')).toBeInTheDocument();
    await userEvent.click(remove);
    expect(await screen.findByText('Unknown rule.')).toBeInTheDocument();
  });
});
