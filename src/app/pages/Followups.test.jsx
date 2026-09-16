import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Followups from './Followups';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/followups';

// Follow-ups wait for real and say what really went out (launch plan 5.5, G36).
// Payloads come from the engine's test flow.
const wf = fx.workflows.workflows[0];
const open = (handlers = {}) => {
  const api = mockApi({
    'GET /bootstrap': bootstrapFixture, 'GET /followups': fx.workflows,
    [`GET /followups/${wf.id}/runs`]: fx.runs, ...handlers,
  });
  renderApp(<Followups />, { route: '/app/followups' });
  return api;
};
// A run's card: its heading line starts with the lead's name, then the date.
const runOf = (name) => screen.getByText(new RegExp(`^${name}`)).closest('div.rounded-lg');

describe('Follow-ups — runs that wait', () => {
  it('shows where each run is, and when a waiting one carries on', async () => {
    open();
    await userEvent.click(await screen.findByRole('button', { name: /Runs/ }));

    await screen.findByText(/^Meera Iyer/);
    const waiting = runOf('Meera Iyer');
    expect(within(waiting).getByText('Waiting')).toBeInTheDocument();
    expect(waiting).toHaveTextContent(/carries on \d{1,2} Sept/);
    expect(waiting).toHaveTextContent('Waiting 2 hours');

    expect(within(runOf('Asha Rao')).getByText('Finished')).toBeInTheDocument();
    expect(runOf('Asha Rao')).toHaveTextContent('Email sent to asha@example.in');
    expect(within(runOf('Vikram Shah')).getByText('Stopped')).toBeInTheDocument();
    expect(runOf('Vikram Shah')).toHaveTextContent("Stopped: stage is 'contacted', needs 'new'");
  });

  it('never shows a channel that is not connected as sent', async () => {
    open();
    await userEvent.click(await screen.findByRole('button', { name: /Runs/ }));
    await screen.findByText(/^Meera Iyer/);
    expect(screen.getAllByText("WhatsApp not sent — WhatsApp isn't connected yet")).toHaveLength(3);
    expect(screen.queryByText(/via mock/)).not.toBeInTheDocument();
    expect(screen.getByText('Email not sent — the lead has no email address')).toBeInTheDocument();
  });
});

describe('Follow-ups — the builder says what each step really does', () => {
  it('email has a subject and says where replies go; WhatsApp says it is not connected', async () => {
    open();
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Email subject')).toHaveValue('Thanks, {name}');
    expect(screen.getByText(/Replies go to your organisation owner’s email/)).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp isn’t connected yet — this step is recorded on the lead as not sent/)).toBeInTheDocument();
    expect(screen.getByText(/The run waits here, then carries on/)).toBeInTheDocument();
  });

  it('the subject is saved with the step', async () => {
    const api = open({ [`PATCH /followups/${wf.id}`]: { status: 'ok', workflow: wf } });
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const subject = screen.getByLabelText('Email subject');
    await userEvent.clear(subject);
    await userEvent.type(subject, 'Your quote');
    await userEvent.click(screen.getByRole('button', { name: /Save/ }));
    const sent = api.callsTo(`PATCH /followups/${wf.id}`)[0].body;
    expect(sent.steps[0]).toMatchObject({ kind: 'action', type: 'email', subject: 'Your quote' });
  });

  it('the preview says what would happen, and that nothing is sent', async () => {
    open({ [`PATCH /followups/${wf.id}`]: { status: 'ok', workflow: wf }, [`POST /followups/${wf.id}/dry-run`]: fx.dryRun });
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: /Preview run/ }));
    expect(await screen.findByText('Would wait 2 hours, then carry on')).toBeInTheDocument();
    expect(screen.getByText('Would send Email to sample@example.com')).toBeInTheDocument();
    expect(screen.getByText("Would not send WhatsApp — WhatsApp isn't connected yet")).toBeInTheDocument();
  });
});
