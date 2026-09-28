import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketingPlan from './pages/MarketingPlan';
import PlanView from './components/PlanView';
import { mockApi } from '../test/mockApi';
import { renderApp } from '../test/render';
import ob from '../test/fixtures/onboarding';
import sostac from '../test/fixtures/sostac';

// The marketing plan on SOSTAC (launch plan 6.18). Payloads captured from the engine.
const { page, written, accepted, suggested } = sostac;
const record = page.plan;
const acceptPath = `POST /marketing-plan/${record.id}/accept`;
const open = (user, name) => user.click(screen.getByRole('tab', { name }));

describe('Marketing plan on SOSTAC', () => {
  it('starts from the counted numbers, each with its source', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, 'GET /marketing-plan': page });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    expect(await screen.findByText(record.plan.summary)).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Situation', 'Objectives', 'Strategy', 'Tactics', 'Action', 'Control'].map((s) => `${s[0]}${s}`));
    const numbers = screen.getByRole('region', { name: 'Where things stand' });
    expect(within(numbers).getByRole('row', { name: /Leads, last 30 days/ })).toHaveTextContent('0Lead pipeline');
    expect(within(numbers).getByRole('row', { name: /Instagram followers/ })).toHaveTextContent('Not measuredConnect Instagram to measure this.');
    expect(within(numbers).getByRole('row', { name: /Spend recorded/ })).toHaveTextContent('INR 0Campaigns');
    expect(screen.getByRole('region', { name: 'Strengths' })).toHaveTextContent('A written 5-year warranty');
    expect(screen.getByRole('region', { name: "What's missing" })).toHaveTextContent('Instagram isn\'t connected');
  });

  it('has one objective from today’s baseline, and says when the target was suggested', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, 'GET /marketing-plan': page });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    await screen.findByText(record.plan.summary);
    await open(user, 'Objectives');
    const goal = screen.getByRole('region', { name: 'One measurable goal' });
    expect(goal).toHaveTextContent('Leads: from 0 to 40 leads a month by 25 Oct');
    expect(goal).toHaveTextContent('Starting point: 0 — Leads in the last 30 days. The target is the one in the plan brief.');
    expect(within(goal).queryByText('Suggested')).not.toBeInTheDocument();

    const done = renderApp(<PlanView plan={suggested.plan} />);
    await user.click(await within(done.container).findByRole('tab', { name: 'Objectives' }));
    const mine = within(done.container).getByRole('region', { name: 'One measurable goal' });
    expect(mine).toHaveTextContent('Leads: from 1 to 50 leads a month by 25 Oct');
    expect(within(mine).getByText('Suggested')).toBeInTheDocument();
    expect(mine).toHaveTextContent('The target was suggested because the plan brief has none');
  });

  it('shows tactics that fit the team and a budget split that adds up', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, 'GET /marketing-plan': page });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    await screen.findByText(record.plan.summary);
    await open(user, 'Strategy');
    expect(screen.getByRole('region', { name: 'Content pillars' })).toHaveTextContent('Proof50%');
    await open(user, 'Tactics');
    const channels = screen.getByRole('region', { name: 'Channels and cadence' });
    expect(channels).toHaveTextContent('Instagram · 3 a week');
    expect(channels).toHaveTextContent('5 posts a week in all, within the 5 the team can make.');
    const budget = screen.getByRole('region', { name: 'Budget split' });
    expect(within(budget).getByRole('row', { name: /Meta ads/ })).toHaveTextContent('INR 15,000');
    expect(within(budget).getByRole('row', { name: /Total/ })).toHaveTextContent('INR 30,000');
    const campaigns = screen.getByRole('region', { name: 'Campaigns' });
    expect(campaigns).toHaveTextContent('Monsoon check-up');
    expect(campaigns).toHaveTextContent('Lead generation · Instagram · weeks 1–2 · INR 24,000');
    await open(user, 'Action');
    expect(screen.getByRole('region', { name: /^Week 1 · 28 Sept?–4 Oct$/ })).toHaveTextContent('Post the first reel');
  });

  it('checks each week against the plan, and this week sits beside it', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, 'GET /marketing-plan': page });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    const week = await screen.findByRole('region', { name: 'This week: planned vs actual' });
    expect(week).toHaveTextContent('Week 1 of 4');
    expect(week).toHaveTextContent('Posts published1 of 5');
    expect(week).toHaveTextContent('Leads1 of 10');
    await open(user, 'Control');
    const rows = within(screen.getByRole('region', { name: 'Planned against actual' })).getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-current', 'true');
    expect(rows[1]).toHaveTextContent('1 of 5');
    expect(rows[1]).toHaveTextContent('1 of 10');
    expect(rows[2]).toHaveTextContent('— of 5');
    expect(rows[2]).toHaveTextContent('— of 10');
  });

  it('accepting creates the campaigns as drafts', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, 'GET /marketing-plan': page, [acceptPath]: accepted });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    expect(await screen.findByText(/Accepting the plan creates its 2 draft campaigns in Campaigns/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Accept plan' }));
    const done = await screen.findByRole('status');
    expect(done).toHaveTextContent('Plan accepted: 2 draft campaigns in Campaigns.');
    expect(within(done).getByRole('link', { name: 'Open Campaigns' })).toHaveAttribute('href', '/app/campaigns');
    expect(screen.queryByRole('button', { name: 'Accept plan' })).not.toBeInTheDocument();
    expect(api.callsTo(acceptPath)).toHaveLength(1);
  });

  it('read-only roles see the plan but can’t accept it', async () => {
    mockApi({ 'GET /bootstrap': { ...ob.bootstrapCompleted, role: 'View-only' }, 'GET /marketing-plan': page });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    await screen.findByText(record.plan.summary);
    expect(screen.queryByRole('button', { name: 'Accept plan' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /write a new plan/i })).not.toBeInTheDocument();
  });

  it('a new plan arrives with its weekly check', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': ob.bootstrapCompleted,
      'GET /marketing-plan': { ...page, plan: null, progress: null },
      'POST /marketing-plan': written,
    });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    await user.click(await screen.findByRole('button', { name: /generate plan/i }));
    expect(await screen.findByRole('region', { name: 'This week: planned vs actual' })).toHaveTextContent('Posts published0 of 5');
  });

  it('an older plan keeps its own layout and says what it lacks', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted, 'GET /marketing-plan': { ...page, plan: ob.plan.plan, progress: null } });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    expect(await screen.findByRole('region', { name: 'Content pillars' })).toBeInTheDocument();
    expect(screen.getByText(/^Written before plans followed SOSTAC/)).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'This week: planned vs actual' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accept plan' })).not.toBeInTheDocument();
  });
});
