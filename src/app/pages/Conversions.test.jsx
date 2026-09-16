import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadDetail, { eventLine } from './LeadDetail';
import Tracking from './Tracking';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/conversions';

// Lead outcomes keep a conversion event built for Meta and Google, and every screen
// says it is ready and not sent — never "sent" (launch plan 5.6, G37).
const lead = fx.lead.lead;
const openLead = (payload = fx.lead, handlers = {}) => {
  const api = mockApi({ 'GET /bootstrap': bootstrapFixture, [`GET /leads/${payload.lead.id}`]: payload, ...handlers });
  renderApp(<LeadDetail />, { route: `/app/pipeline/${payload.lead.id}`, path: '/app/pipeline/:id' });
  return api;
};

describe('Lead outcome — conversion events', () => {
  it('lists each event as ready for Meta and Google and not sent', async () => {
    openLead();
    const events = await screen.findByRole('list', { name: 'Conversion events' });
    const items = within(events).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Purchase completed');
    expect(items[0]).toHaveTextContent('Ready for Meta and Google — not sent, not connected yet (matched by email, phone, Meta click id).');
    expect(screen.queryByText(/mock/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Nothing is sent until they’re connected/)).toBeInTheDocument();
  });

  it('names ad click ids instead of calling them UTM tags', async () => {
    openLead();
    expect(await screen.findByText('Meta click id: IwAR2abc')).toBeInTheDocument();
    expect(screen.getByText('utm_source: facebook')).toBeInTheDocument();
    expect(screen.queryByText(/utm_fbclid/)).not.toBeInTheDocument();
  });

  it('an outcome recorded before events were built says nothing was sent', async () => {
    openLead(fx.legacyLead);
    const events = await screen.findByRole('list', { name: 'Conversion events' });
    expect(events).toHaveTextContent('Recorded before conversion events were built — nothing was sent.');
  });

  it('describes a sent event plainly once a platform is connected', () => {
    const s = { ...lead.offlineSignals[0], platforms: { meta: { status: 'sent' }, google: { status: 'not_connected' } } };
    expect(eventLine(s)).toBe('Sent to Meta. Ready for Google — not sent, not connected yet (matched by email, phone, Meta click id).');
    expect(eventLine({ ...s, matchedBy: [] })).toMatch(/\(nothing to match it to a person\)\.$/);
  });
});

describe('Tracking Centre — conversion events', () => {
  it('counts events as ready, with none sent', async () => {
    mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /tracking': fx.tracking });
    renderApp(<Tracking />, { route: '/app/tracking' });
    const card = await screen.findByRole('region', { name: 'Conversion events' });
    expect(card).toHaveTextContent('3ready for Meta and Google — 0 sent, as neither is connected yet.');
    expect(card).toHaveTextContent('2 carry an ad click id');
    expect(screen.getByText(/3 conversion events are ready to go when they are/)).toBeInTheDocument();
    expect(screen.queryByText(/Phase 3/)).not.toBeInTheDocument();
  });

  it('with none yet it says how to make one', async () => {
    mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /tracking': { ...fx.tracking, conversions: { ready: 0, sent: 0, withClickId: 0, lastAt: null } } });
    renderApp(<Tracking />, { route: '/app/tracking' });
    expect(await screen.findByRole('region', { name: 'Conversion events' })).toHaveTextContent('Mark a lead’s outcome in the pipeline to build one.');
  });
});
