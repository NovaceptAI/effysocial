import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppAuthProvider } from '../app/context/AppAuth';
import Onboarding from './Onboarding';
import { mockApi } from '../test/mockApi';
import ob from '../test/fixtures/onboarding';
import sources from '../test/fixtures/brandSources';

// Onboarding (G20; ONB-001..005). Payloads come from the engine's test flow: a
// business choosing both offers through to a plan, and a creation-only Agency & Creators profile.
function Where() {
  const { pathname } = useLocation();
  return <output aria-label="Current page">{pathname}</output>;
}

function open(route = '/onboarding') {
  return render(
    <AppAuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </AppAuthProvider>,
  );
}

const steps = () => within(screen.getByRole('list', { name: 'Onboarding steps' })).getAllByRole('listitem').map((li) => li.textContent.replace(/^\d+/, ''));
const current = () => within(screen.getByRole('list', { name: 'Onboarding steps' })).getAllByRole('listitem').find((li) => li.getAttribute('aria-current') === 'step').textContent.replace(/^\d+/, '');
const withStep = (payload, step) => ({ ...payload, onboarding: { ...payload.onboarding, step } });

afterEach(() => { vi.unstubAllGlobals(); });

describe('Onboarding answers (ONB-001)', () => {
  it('resumes at the saved step with every saved answer', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, 'GET /onboarding': ob.saved, 'GET /integrations': ob.integrations });
    open();
    expect(await screen.findByRole('heading', { name: 'Connect your accounts' })).toBeInTheDocument();
    expect(current()).toBe('Connect');

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByRole('button', { name: 'Generate leads' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Get phone calls' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Grow engagement' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByRole('radio', { name: /^Both/ })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByLabelText('Name')).toHaveValue('Roofseal Pune');
    expect(screen.getByLabelText('Website')).toHaveValue('https://roofseal.in');
    expect(screen.getByLabelText('Team size')).toHaveValue('1-5');
  });

  it('saves each step as the user continues, and checks answers before saving', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': ob.bootstrapFresh,
      'GET /onboarding': ob.fresh,
      'PATCH /onboarding': (body) => (body.details?.website === 'roofseal.in'
        ? [400, { status: 'error', message: 'Enter the website address, starting with https://.' }]
        : ob.savedPatch),
    });
    open();
    expect(await screen.findByRole('button', { name: /back/i })).toBeDisabled(); // ONB-005: no Back on step 1
    await user.click(screen.getByRole('radio', { name: /Agency & Creators/ }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'Tell us about your agency' });

    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your business or agency name.');
    await user.type(screen.getByLabelText('Name'), 'Northwind Digital');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose your industry, or pick Other and describe it.');
    await user.selectOptions(screen.getByLabelText('Industry'), 'Other — not listed');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tell us which business you’re in.');
    await user.type(screen.getByLabelText('Which business are you in?'), 'AI voice agents for banks');
    await user.type(screen.getByLabelText('Website'), 'roofseal.in');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter the website address, starting with https://.');
    expect(screen.getByRole('heading', { name: 'Tell us about your agency' })).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Website'));
    await user.type(screen.getByLabelText('Website'), 'https://northwind.in');
    await user.selectOptions(screen.getByLabelText('Currency'), 'USD');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'What do you want to do with EffySocial?' });

    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose what you want to do with EffySocial.');
    await user.click(screen.getByRole('radio', { name: /^Market and grow/ }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: 'What do you want to achieve?' });
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Pick at least one goal.');

    expect(api.callsTo('PATCH /onboarding').map((c) => c.body)).toEqual([
      { orgType: 'agency', step: 'details' },
      { details: { name: 'Northwind Digital', website: 'roofseal.in', industry: 'AI voice agents for banks', location: '', timezone: 'Asia/Kolkata', currency: 'INR', teamSize: '1-5' }, step: 'offer' },
      { details: { name: 'Northwind Digital', website: 'https://northwind.in', industry: 'AI voice agents for banks', location: '', timezone: 'Asia/Kolkata', currency: 'USD', teamSize: '1-5' }, step: 'offer' },
      { offer: 'marketing', step: 'goals' },
    ]);
  });

  it('the industry list covers many businesses, and a saved answer not on it comes back as Other', async () => {
    const user = userEvent.setup();
    const listed = withStep({ ...ob.saved, onboarding: { ...ob.saved.onboarding, details: { ...ob.saved.onboarding.details, industry: 'Dental clinic' } } }, 'details');
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, 'GET /onboarding': listed });
    const first = open();
    const select = await screen.findByLabelText('Industry');
    expect(select).toHaveValue('Dental clinic');
    expect(within(select).getAllByRole('option').length).toBeGreaterThan(120);
    expect(within(select).getByRole('option', { name: 'AI & automation services' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Which business are you in?')).not.toBeInTheDocument();
    expect(screen.getByText(/we’ll read your home page and main pages/)).toBeInTheDocument();
    first.unmount();

    const custom = withStep({ ...ob.saved, onboarding: { ...ob.saved.onboarding, details: { ...ob.saved.onboarding.details, industry: 'AI voice agents for banks' } } }, 'details');
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, 'GET /onboarding': custom });
    open();
    expect(await screen.findByLabelText('Which business are you in?')).toHaveValue('AI voice agents for banks');
    expect(screen.getByLabelText('Industry')).toHaveValue('__other');
    await user.selectOptions(screen.getByLabelText('Industry'), 'Software & SaaS');
    expect(screen.queryByLabelText('Which business are you in?')).not.toBeInTheDocument();
  });

  it('only owners and admins set up the organisation', async () => {
    mockApi({ 'GET /bootstrap': { ...ob.bootstrapFresh, role: 'Copywriter' }, 'GET /onboarding': ob.fresh });
    open();
    expect(await screen.findByRole('heading', { name: `${ob.fresh.org.name} is set up by its owner` })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument();
  });
});

describe('Connect step (ONB-002)', () => {
  it('shows every channel’s real state and starts the real flow', async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const api = mockApi({
      'GET /bootstrap': ob.bootstrapFresh,
      'GET /onboarding': ob.saved,
      'GET /integrations': ob.integrations,
      'POST /integrations/meta_ads/connect': ob.connectPending,
      'POST /integrations/linkedin/connect': ob.connectRedirect,
    });
    open();
    const list = await screen.findByRole('list', { name: 'Channels' });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(ob.integrations.integrations.length);
    expect(within(list).queryByText('Connected')).not.toBeInTheDocument();
    for (const it of ob.integrations.integrations) {
      expect(within(list).getByRole('button', { name: `Connect ${it.label}` })).toBeEnabled();
    }

    await user.click(within(list).getByRole('button', { name: 'Connect Meta Ads' }));
    expect(await within(list).findByText(/Not available yet/)).toBeInTheDocument();
    await user.click(within(list).getByRole('button', { name: 'Connect LinkedIn' }));
    await waitFor(() => expect(assign).toHaveBeenCalledWith(ob.connectRedirect.redirect));
    expect(api.callsTo('POST /integrations/linkedin/connect').map((c) => c.body)).toEqual([{ workspace: ob.saved.workspace.id, returnTo: 'onboarding' }]);
  });

  it('says whether a connection worked when the provider sends the user back', async () => {
    const connected = { ...ob.integrations, integrations: ob.integrations.integrations.map((i) => (i.provider === 'linkedin' ? { ...i, state: 'connected', account: 'Asha Rao' } : i)) };
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, 'GET /onboarding': ob.saved, 'GET /integrations': connected });
    open('/onboarding?connected=linkedin&status=success');
    expect(await screen.findByRole('status')).toHaveTextContent('LinkedIn connected.');
    const row = within(screen.getByRole('list', { name: 'Channels' })).getByText('LinkedIn').closest('li');
    expect(within(row).getByText('Connected')).toBeInTheDocument();
    expect(within(row).getByText('Asha Rao')).toBeInTheDocument();
  });

  it('explains a cancelled connection', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, 'GET /onboarding': ob.saved, 'GET /integrations': ob.integrations });
    open('/onboarding?connected=linkedin&status=denied');
    expect(await screen.findByRole('status')).toHaveTextContent('LinkedIn was cancelled on its sign-in screen.');
  });
});

describe('First plan and finishing (ONB-003, ONB-005)', () => {
  it('generates a real plan, then finishing is allowed', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': ob.bootstrapFresh,
      'GET /onboarding': withStep(ob.saved, 'plan'),
      'POST /marketing-plan': ob.plan,
      'POST /onboarding/complete': ob.complete,
    });
    open();
    const finish = await screen.findByRole('button', { name: /go to dashboard/i });
    expect(finish).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /generate first plan/i }));
    expect(await screen.findByText('Your plan is ready')).toBeInTheDocument();
    expect(api.callsTo('POST /marketing-plan').map((c) => c.body)).toEqual([{ workspace: ob.saved.workspace.id, source: 'onboarding' }]);
    const pillars = screen.getByRole('region', { name: 'Content pillars' });
    expect(within(pillars).getAllByRole('listitem').map((li) => li.textContent)).toEqual(ob.plan.plan.plan.pillars.map((p) => `${p.name}${p.share}%${p.why}`));
    expect(screen.getByRole('region', { name: '12 post ideas' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /go to dashboard/i }));
    expect(await screen.findByLabelText('Current page')).toHaveTextContent(/^\/app$/);
    expect(api.callsTo('POST /onboarding/complete')).toHaveLength(1);
    expect(api.callsTo('GET /bootstrap').length).toBeGreaterThan(1); // the app sees onboarding as finished
  });

  it('keeps Finish locked and says so when the plan can’t be written', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': ob.bootstrapFresh,
      'GET /onboarding': withStep(ob.saved, 'plan'),
      'POST /marketing-plan': [ob.planFailed.status, ob.planFailed.body],
    });
    open();
    await user.click(await screen.findByRole('button', { name: /generate first plan/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(ob.planFailed.body.message);
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeDisabled();
  });

  it('marketing only lands on the Performance Marketing dashboard', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': ob.bootstrapFresh,
      'GET /onboarding': { ...withStep(ob.saved, 'plan'), onboarding: { ...ob.saved.onboarding, offer: 'marketing', step: 'plan' }, plan: ob.plan.plan },
      'POST /onboarding/complete': ob.complete,
    });
    open();
    await user.click(await screen.findByRole('button', { name: /go to dashboard/i }));
    expect(await screen.findByLabelText('Current page')).toHaveTextContent('/app/home');
  });
});

describe('Telling EffySocial what the business does', () => {
  it('the Brand Brain step says a brief goes a long way and that the website will be read', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, 'GET /onboarding': withStep(ob.saved, 'brand'), 'GET /brand': ob.brand });
    open();
    const note = await screen.findByRole('note', { name: 'Why a brief helps' });
    expect(note).toHaveTextContent('A brief goes a long way.');
    expect(note).toHaveTextContent('We’ll also read your website.');
    expect(await screen.findByLabelText('Business brief')).toBeInTheDocument();
  });

  it('the plan step nudges for a brief first, and says when the website couldn’t be used', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': ob.bootstrapFresh,
      'GET /onboarding': withStep(ob.saved, 'plan'),
      'POST /marketing-plan': sources.planWebsiteUnread,
    });
    open();
    expect(await screen.findByText(/No brief or document yet\?/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /generate first plan/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(`We couldn’t use your website for this plan: ${sources.planWebsiteUnread.plan.inputs.websiteNote}`);
  });
});

describe('Creation only (ONB-004)', () => {
  it('skips goals, connections and the plan, and lands in AI Studio', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': ob.bootstrapFresh,
      'GET /onboarding': ob.creation,
      'GET /brand': ob.brand,
      'PATCH /onboarding': ob.savedPatch,
      'POST /onboarding/complete': ob.creationComplete,
    });
    open();
    await screen.findByRole('heading', { name: 'Build your Brand Brain' });
    expect(steps()).toEqual(['Organisation', 'Details', 'What you need', 'Brand Brain', 'Start creating']);

    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(await screen.findByRole('button', { name: /open ai studio/i }));
    expect(await screen.findByLabelText('Current page')).toHaveTextContent('/app/studio');
    expect(api.callsTo('GET /integrations')).toHaveLength(0);
    expect(api.callsTo('POST /marketing-plan')).toHaveLength(0);
    expect(api.callsTo('PATCH /onboarding').map((c) => c.body)).toEqual([{ step: 'start' }]);
  });

  it('switching the offer changes the steps', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, 'GET /onboarding': withStep(ob.saved, 'offer') });
    open();
    await screen.findByRole('heading', { name: 'What do you want to do with EffySocial?' });
    expect(steps()).toContain('First plan');
    await user.click(screen.getByRole('radio', { name: /^Create content/ }));
    expect(steps()).toEqual(['Organisation', 'Details', 'What you need', 'Brand Brain', 'Start creating']);
  });
});
