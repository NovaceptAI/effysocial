import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calendar from './Calendar';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/postActions';

// The Calendar (launch plan 4.3): posts on their dates in month and list views, today
// in the organisation's timezone (PUBL-015, PUBL-016), New post and Fill gaps (PUBL-017).
// The clock is set to when the engine's payloads were captured.
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(fx.capturedAt));
});
afterEach(() => vi.useRealTimers());

const setup = (handlers = {}) => {
  const api = mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /posts': fx.posts, ...handlers });
  renderApp(<Calendar />, { route: '/app/calendar' });
  return api;
};
const cell = (date) => document.querySelector(`[data-date="${date}"]`);

describe('Calendar', () => {
  it('puts posts on their dates and marks today by the organisation’s clock', async () => {
    setup();
    await screen.findByText(fx.createdDraft.post.title);
    expect(document.querySelectorAll('[aria-current="date"]')).toHaveLength(1);
    expect(cell(fx.today)).toHaveAttribute('aria-current', 'date');
    for (const post of fx.posts.posts.filter((p) => p.date.slice(0, 7) === fx.today.slice(0, 7))) {
      expect(within(cell(post.date)).getByRole('button', { name: new RegExp(post.title) })).toBeInTheDocument();
    }
  });

  it('keeps the same dates in the list view', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup();
    await user.click(await screen.findByRole('button', { name: 'List' }));
    const row = screen.getByRole('button', { name: new RegExp(fx.createdDraft.post.title) });
    expect(row).toHaveTextContent(`${fx.updated.post.date} ${fx.updated.post.time}`);
  });

  it('opens New post on the chosen day, and a post’s details from the calendar', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup();
    const day = fx.createdDraft.post.date;
    await user.click(await screen.findByRole('button', { name: new RegExp(`New post on .*${Number(day.slice(8))}`) }));
    let d = await screen.findByRole('dialog');
    expect(within(d).getByRole('heading', { name: 'New post' })).toBeInTheDocument();
    expect(within(d).getByLabelText('Date')).toHaveValue(day);
    await user.click(within(d).getByRole('button', { name: 'Close' }));

    await user.click(screen.getAllByRole('button', { name: new RegExp(fx.createdDraft.post.title) })[0]);
    d = await screen.findByRole('dialog');
    expect(within(d).getByLabelText('Title')).toHaveValue(fx.updated.post.title);
    expect(within(d).getByLabelText(/^Caption/)).toHaveValue(fx.updated.post.caption);
  });

  it('Fill gaps suggests posts for the empty days and adds the ones kept as ideas', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const created = [];
    const api = setup({
      'POST /posts/fill-gaps': fx.fillGaps,
      'POST /posts': (body) => { created.push(body); return fx.ideaCreated; },
    });
    await user.click(await screen.findByRole('button', { name: /fill gaps/i }));
    const d = await screen.findByRole('dialog', { name: /fill gaps/i });
    const items = await within(d).findAllByRole('checkbox');
    expect(items).toHaveLength(fx.fillGaps.suggestions.length);
    expect(within(d).getByText('Before-and-after terrace reel').closest('label')).toHaveTextContent('Marketing plan');
    expect(within(d).getByText('Why terraces leak').closest('label')).toHaveTextContent('Ideas board');
    expect(within(d).getByText('Monsoon myth 1').closest('label')).toHaveTextContent('AI suggestion');

    await user.click(items[1]);
    const keep = fx.fillGaps.suggestions.length - 1;
    await user.click(within(d).getByRole('button', { name: `Add ${keep} to calendar` }));
    await waitFor(() => expect(created).toHaveLength(keep));
    const plan = fx.fillGaps.suggestions[0];
    expect(created[0]).toEqual({ workspace: 'ws_1', status: 'idea', title: plan.title, channel: plan.channel, type: plan.type, date: plan.date, time: plan.time, caption: plan.angle });
    expect(created.map((c) => c.title)).not.toContain('Why terraces leak');
    const [ask] = api.callsTo('POST /posts/fill-gaps');
    expect(ask.body.from > fx.today).toBe(true);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('says how many days still need an idea when AI can’t help', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setup({ 'POST /posts/fill-gaps': fx.fillGapsNoAi });
    await user.click(await screen.findByRole('button', { name: /fill gaps/i }));
    const d = await screen.findByRole('dialog', { name: /fill gaps/i });
    expect(await within(d).findByText(/2 more empty days need an idea/)).toBeInTheDocument();
    expect(within(d).getByRole('link', { name: 'Ideas board' })).toHaveAttribute('href', '/app/ideas');
  });
});
