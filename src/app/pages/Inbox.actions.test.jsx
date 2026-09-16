import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Inbox from './Inbox';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/inbox';

// Tag and Escalate in the Inbox (launch plan 5.8, G31). Payloads from the engine's test flow.
const convos = fx.conversations.conversations;
const meera = convos.find((c) => c.person === 'Meera Iyer');
const rahul = convos.find((c) => c.person === 'Rahul Mehta');
const open = (handlers = {}) => {
  const api = mockApi({ 'GET /bootstrap': fx.bootstrap, 'GET /conversations': fx.conversations, 'GET /team': fx.team, ...handlers });
  renderApp(<Inbox />, { route: '/app/inbox' });
  return api;
};
// A conversation in the list: its button's name holds the person's name (after the channel icon).
const row = (person) => new RegExp(person);
const pick = async (person) => userEvent.click(await screen.findByRole('button', { name: row(person) }));

describe('Inbox — tags', () => {
  it('shows tags on conversations and filters by them', async () => {
    open();
    const filters = await screen.findByRole('group', { name: 'Filter by tag' });
    expect(within(filters).getAllByRole('button').map((b) => b.textContent)).toEqual(['pricing', 'site visit', 'VIP']);
    await userEvent.click(within(filters).getByRole('button', { name: 'pricing' }));
    expect(screen.getByRole('button', { name: row('Rahul Mehta') })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: row('Priya Nair') })).not.toBeInTheDocument();
  });

  it('adds and removes tags and saves them', async () => {
    const api = open({ [`PUT /conversations/${rahul.id}/tags`]: { status: 'ok', conversation: { ...rahul, tags: ['follow up'] } } });
    await pick('Rahul Mehta');
    await userEvent.click(screen.getByRole('button', { name: /^Tag$/ }));
    const editor = screen.getByRole('dialog', { name: 'Tags for Rahul Mehta' });
    await userEvent.click(within(editor).getByRole('button', { name: 'Remove tag pricing' }));
    await userEvent.type(within(editor).getByLabelText('New tag'), '  follow   up {Enter}');
    await userEvent.click(within(editor).getByRole('button', { name: 'Save tags' }));
    expect(api.callsTo(`PUT /conversations/${rahul.id}/tags`).map((c) => c.body)).toEqual([{ tags: ['follow up'] }]);
  });

  it('refuses a tag that is too long before sending anything', async () => {
    const api = open();
    await pick('Priya Nair');
    await userEvent.click(screen.getByRole('button', { name: /^Tag$/ }));
    const editor = screen.getByRole('dialog', { name: 'Tags for Priya Nair' });
    await userEvent.type(within(editor).getByLabelText('New tag'), `${'x'.repeat(25)}{Enter}`);
    expect(within(editor).getByRole('alert')).toHaveTextContent('Keep each tag to 24 characters.');
    expect(api.callsTo(`PUT /conversations/${convos.find((c) => c.person === 'Priya Nair').id}/tags`)).toHaveLength(0);
  });
});

describe('Inbox — escalation', () => {
  it('shows who it was escalated to, why, and resolves it', async () => {
    const api = open({ [`DELETE /conversations/${meera.id}/escalate`]: { status: 'ok', conversation: { ...meera, escalation: null } } });
    await pick('Meera Iyer');
    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Escalated to Kiran Patil by');
    expect(banner).toHaveTextContent('Third leak — needs a site visit today');
    await userEvent.click(within(banner).getByRole('button', { name: 'Resolve' }));
    expect(api.callsTo(`DELETE /conversations/${meera.id}/escalate`)).toHaveLength(1);
  });

  it('has its own queue', async () => {
    open();
    await userEvent.click(await screen.findByRole('button', { name: /^Escalated/ }));
    expect(screen.getByRole('button', { name: row('Meera Iyer') })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: row('Rahul Mehta') })).not.toBeInTheDocument();
  });

  it('escalates to a chosen teammate with a note', async () => {
    const api = open({ [`POST /conversations/${rahul.id}/escalate`]: { status: 'ok', conversation: meera } });
    await pick('Rahul Mehta');
    await userEvent.click(screen.getByRole('button', { name: /^Escalate$/ }));
    const dialog = screen.getByRole('dialog', { name: 'Escalate Rahul Mehta' });
    const who = await within(dialog).findByLabelText('Who should deal with it');
    expect(within(who).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Choose a teammate…', `${fx.team.members[0].name} (you) — Workspace admin`, 'Kiran Patil — Copywriter']);

    await userEvent.click(within(dialog).getByRole('button', { name: 'Escalate' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Choose who should deal with it.');
    await userEvent.selectOptions(who, String(fx.mateId));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Escalate' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Say why it needs them — add a note.');
    await userEvent.type(within(dialog).getByLabelText('Why it needs them'), 'Big quote — call today');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Escalate' }));
    expect(api.callsTo(`POST /conversations/${rahul.id}/escalate`).map((c) => c.body)).toEqual([{ to: fx.mateId, note: 'Big quote — call today' }]);
  });

  it('says why an escalation was refused', async () => {
    open({ [`POST /conversations/${rahul.id}/escalate`]: [400, { message: 'Choose a teammate from your team to escalate to.' }] });
    await pick('Rahul Mehta');
    await userEvent.click(screen.getByRole('button', { name: /^Escalate$/ }));
    const dialog = screen.getByRole('dialog', { name: 'Escalate Rahul Mehta' });
    await userEvent.selectOptions(await within(dialog).findByLabelText('Who should deal with it'), String(fx.mateId));
    await userEvent.type(within(dialog).getByLabelText('Why it needs them'), 'x');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Escalate' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Choose a teammate from your team to escalate to.');
  });
});
