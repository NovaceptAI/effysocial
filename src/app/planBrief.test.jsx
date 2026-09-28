import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketingPlan from './pages/MarketingPlan';
import WorkspaceDialog from './components/WorkspaceDialog';
import { mockApi, bootstrapFixture } from '../test/mockApi';
import { renderApp } from '../test/render';
import ob from '../test/fixtures/onboarding';

// A plan brief per workspace (launch plan 6.17). Shapes follow the engine's
// serialize_brief and briefOptions.
const OPTIONS = {
  kinds: [{ key: 'business', label: 'Business' }, { key: 'personal_brand', label: 'Personal Brand' }],
  metrics: [
    { key: 'leads', label: 'Leads', unit: 'leads a month' },
    { key: 'bookings', label: 'Bookings', unit: 'bookings a month' },
    { key: 'reach', label: 'Reach', unit: 'people reached a month' },
  ],
};
const EMPTY = {
  kind: 'business', kindLabel: 'Business', kindEditable: false,
  goal: { metric: null, label: null, unit: null, target: null },
  offer: '', customer: '', budget: null, currency: 'INR', capacity: null, website: '', updatedAt: null,
  missing: ['goal', 'target', 'offer', 'customer', 'budget', 'capacity'],
};
const FILLED = {
  ...EMPTY, goal: { metric: 'leads', label: 'Leads', unit: 'leads a month', target: 40 },
  offer: 'Terrace waterproofing', customer: 'Housing societies in Pune', budget: 25000, capacity: 4,
  website: 'https://roofseal.in', updatedAt: '2026-09-28T10:00:00+00:00', missing: [],
};
const page = (brief, plan = null) => ({ status: 'ok', plan, brief, briefOptions: OPTIONS });

describe('Plan brief', () => {
  it('asks for a goal before a plan can be written, then saves the brief', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': ob.bootstrapCompleted,
      'GET /marketing-plan': page(EMPTY),
      'PUT /marketing-plan/brief': (body) => ({ status: 'ok', brief: { ...FILLED, goal: { ...FILLED.goal, target: 40 } }, body }),
    });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    const brief = await screen.findByRole('region', { name: 'Plan brief' });
    expect(screen.getByRole('button', { name: /generate plan/i })).toBeDisabled();
    expect(within(brief).getByRole('note')).toHaveTextContent('Still to add: a goal, a target, what you offer, who it’s for, the ad budget, posts a week. A plan needs at least the goal.');
    expect(screen.getByText(/Start with the plan brief/)).toBeInTheDocument();

    await user.selectOptions(within(brief).getByLabelText('Goal'), 'leads');
    await user.type(within(brief).getByLabelText('Target'), '40');
    await user.type(within(brief).getByLabelText('What’s offered'), 'Terrace waterproofing');
    await user.type(within(brief).getByLabelText('Who it’s for'), 'Housing societies in Pune');
    await user.type(within(brief).getByLabelText('Ad budget'), '25000');
    await user.type(within(brief).getByLabelText('Posts a week'), '4');
    await user.type(within(brief).getByLabelText('Website'), 'https://roofseal.in');
    await user.click(within(brief).getByRole('button', { name: 'Save brief' }));
    expect(api.callsTo('PUT /marketing-plan/brief')[0].body).toEqual({
      workspace: ob.bootstrapCompleted.workspaces[0].id,
      goal: { metric: 'leads', target: '40' }, offer: 'Terrace waterproofing', customer: 'Housing societies in Pune',
      budget: '25000', capacity: '4', website: 'https://roofseal.in',
    });
    expect(await within(brief).findByRole('status')).toHaveTextContent('Brief saved.');
    expect(screen.getByRole('button', { name: /generate plan/i })).toBeEnabled();     // the goal is in now
  });

  it('shows why a brief can’t be saved', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': ob.bootstrapCompleted,
      'GET /marketing-plan': page(FILLED),
      'PUT /marketing-plan/brief': [400, { status: 'error', message: 'Enter the posts a week between 1 and 50.' }],
    });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    const brief = await screen.findByRole('region', { name: 'Plan brief' });
    await user.clear(within(brief).getByLabelText('Posts a week'));
    await user.type(within(brief).getByLabelText('Posts a week'), '99');
    await user.click(within(brief).getByRole('button', { name: 'Save brief' }));
    expect(await within(brief).findByRole('alert')).toHaveTextContent('Enter the posts a week between 1 and 50.');
  });

  it('is read-only for roles that can’t edit, and a personal brand is asked what you offer', async () => {
    mockApi({
      'GET /bootstrap': { ...ob.bootstrapCompleted, role: 'View-only' },
      'GET /marketing-plan': page({ ...FILLED, kind: 'personal_brand', kindLabel: 'Personal Brand' }),
    });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    const brief = await screen.findByRole('region', { name: 'Plan brief' });
    expect(within(brief).getByText('Personal Brand')).toBeInTheDocument();
    expect(within(brief).getByText('Follows your profile.')).toBeInTheDocument();
    expect(within(brief).getByText('What you offer')).toBeInTheDocument();
    expect(within(brief).getByLabelText('Goal')).toBeDisabled();
    expect(within(brief).queryByRole('button', { name: 'Save brief' })).not.toBeInTheDocument();
  });

  it('an agency’s client picks business or personal brand in the brief', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': ob.bootstrapCompleted,
      'GET /marketing-plan': page({ ...FILLED, kindEditable: true }),
      'PUT /marketing-plan/brief': { status: 'ok', brief: { ...FILLED, kindEditable: true, kind: 'personal_brand', kindLabel: 'Personal Brand' } },
    });
    renderApp(<MarketingPlan />, { route: '/app/plan' });
    const brief = await screen.findByRole('region', { name: 'Plan brief' });
    await user.click(within(brief).getByRole('radio', { name: /Personal Brand/ }));
    await user.click(within(brief).getByRole('button', { name: 'Save brief' }));
    expect(api.callsTo('PUT /marketing-plan/brief')[0].body.kind).toBe('personal_brand');
  });
});

describe('Adding a client', () => {
  it('an agency says whether the client is a business or a personal brand', async () => {
    const user = userEvent.setup();
    const agency = { ...bootstrapFixture, org: { ...bootstrapFixture.org, type: 'agency', profile: { clientFeatures: true, settings: { clientsPage: true } } } };
    const api = mockApi({
      'GET /bootstrap': agency, 'GET /team': { status: 'ok', members: [], invites: [], roles: [] },
      'POST /workspaces': { status: 'ok', workspace: { id: 'ws_9', name: 'Dr Asha Rao', brandKind: 'personal_brand' } },
    });
    renderApp(<WorkspaceDialog open onClose={() => {}} />);
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('e.g. Sunrise Motors'), 'Dr Asha Rao');
    await user.click(within(dialog).getByRole('radio', { name: 'A personal brand' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add client' }));
    expect(api.callsTo('POST /workspaces')[0].body).toMatchObject({ name: 'Dr Asha Rao', brandKind: 'personal_brand' });
  });

  it('a business doesn’t choose: its workspaces follow the profile', async () => {
    mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /team': { status: 'ok', members: [], invites: [], roles: [] } });
    renderApp(<WorkspaceDialog open onClose={() => {}} />);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('radiogroup', { name: 'What’s marketed here' })).not.toBeInTheDocument();
  });
});
