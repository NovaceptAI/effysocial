import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Rules from './Rules';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import { adsRules, adsDryRun, adsRulesAlerting } from '../../test/fixtures/ads';

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

// Rules are checked for you every half hour; what the last check found sits on the
// page with a way to act or put it away (launch plan 5.4, G35; ADS-009, ADS-012).
describe('Automated Rules — the scheduled check', () => {
  const alerting = (handlers, payload = adsRulesAlerting) => {
    const api = mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /ads/rules': payload, ...handlers });
    renderApp(<Rules />, { route: '/app/rules' });
    return api;
  };

  it('shows what the last check found, and when', async () => {
    alerting();
    const panel = await screen.findByRole('region', { name: 'Rule alerts' });
    expect(within(panel).getAllByText('Lead Gen — Always On')).toHaveLength(2);  // one per rule
    expect(panel).toHaveTextContent('CPL ₹376 (goes above ₹200)');
    expect(panel).toHaveTextContent('Rule “CPL guard”');
    expect(screen.getAllByText(/^Checked /).length).toBeGreaterThan(0);
  });

  it('a pause rule offers the pause, it never happened by itself', async () => {
    const api = alerting({ 'POST /ads/campaigns/adc_1_0/status': { status: 'ok' } });
    const panel = await screen.findByRole('region', { name: 'Rule alerts' });
    const buttons = within(panel).getAllByRole('button', { name: /Pause campaign/ });
    expect(buttons).toHaveLength(3);   // the three "Stop the bleeding" alerts
    await userEvent.click(buttons[1]);
    expect(api.callsTo('POST /ads/campaigns/adc_1_0/status').map((c) => c.body))
      .toEqual([{ workspace: bootstrapFixture.workspaces[0].id, status: 'paused' }]);
  });

  it('an alert can be put away', async () => {
    const id = adsRulesAlerting.alerts[0].id;
    const api = alerting({ [`POST /ads/rules/alerts/${id}/dismiss`]: { status: 'ok' } });
    const panel = await screen.findByRole('region', { name: 'Rule alerts' });
    const a = adsRulesAlerting.alerts[0];
    await userEvent.click(within(panel).getByRole('button', { name: `Dismiss “${a.rule}” on ${a.campaign}` }));
    expect(api.callsTo(`POST /ads/rules/alerts/${id}/dismiss`)).toHaveLength(1);
  });

  it('says a blank threshold is missing instead of saving a rule that matches everything (ADS-009)', async () => {
    const api = alerting({ 'POST /ads/rules': { status: 'ok', rule: {} } });
    await screen.findByRole('region', { name: 'Rule alerts' });
    await userEvent.type(screen.getByPlaceholderText('e.g. CPL guardrail'), 'No threshold');
    await userEvent.click(screen.getByRole('button', { name: /create rule/i }));
    expect(await screen.findByText('Give the rule a threshold.')).toBeInTheDocument();
    expect(api.callsTo('POST /ads/rules')).toHaveLength(0);
  });

  it('an alert already put away is not shown again', async () => {
    const [first, ...rest] = adsRulesAlerting.alerts;
    alerting({}, { ...adsRulesAlerting, alerts: [{ ...first, dismissed: true }, ...rest] });
    const panel = await screen.findByRole('region', { name: 'Rule alerts' });
    expect(within(panel).getAllByRole('listitem')).toHaveLength(rest.length);
    expect(within(panel).queryByRole('button', { name: `Dismiss “${first.rule}” on ${first.campaign}` })).not.toBeInTheDocument();
  });

  it('with no alerts it says when the next check runs', async () => {
    mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /ads/rules': adsRules });
    renderApp(<Rules />, { route: '/app/rules' });
    await screen.findAllByText('CPL guard');
    expect(screen.queryByRole('region', { name: 'Rule alerts' })).not.toBeInTheDocument();
    expect(screen.getByText(/the first check runs within half an hour/)).toBeInTheDocument();
  });
});
