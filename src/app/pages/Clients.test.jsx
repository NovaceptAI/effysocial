import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Clients from './Clients';
import WorkspaceSelect from './WorkspaceSelect';
import { useWorkspace } from '../context/WorkspaceContext';
import { sinceLabel } from '../components/ClientFigures';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import clients from '../../test/fixtures/clients';

// Workspaces and client workspaces (G21). Payloads come from the engine's test flow:
// an agency whose two clients hold different data, then a third client added.
const row = (id) => screen.getByTestId(`client-${id}`);
const cell = (id, column) => {
  const headers = [...screen.getAllByRole('columnheader')].map((h) => h.textContent);
  return within(row(id)).getAllByRole('cell')[headers.indexOf(column)];
};

function Selected() {
  const { workspace } = useWorkspace();
  return <output aria-label="Selected workspace">{workspace?.name}</output>;
}

afterEach(() => { try { localStorage.clear(); } catch { /* ignore */ } });

describe('Clients table', () => {
  it('shows each client’s own figures, not defaults (TEN-008)', async () => {
    mockApi({ 'GET /bootstrap': clients.bootstrap, 'GET /workspaces/summary': clients.summary });
    renderApp(<Clients />, { route: '/app/clients' });
    await waitFor(() => expect(within(row('ws_1')).getByText('Asha Rao')).toBeInTheDocument());

    expect(cell('ws_1', 'Channels')).toHaveTextContent('2');
    expect(within(cell('ws_1', 'Channels')).getByTitle('Instagram, Meta Ads')).toBeInTheDocument();
    expect(cell('ws_1', 'Spend')).toHaveTextContent('₹4.0K');
    expect(cell('ws_1', 'Leads (30d)')).toHaveTextContent('3');
    expect(cell('ws_1', 'Approvals')).toHaveTextContent('1');
    expect(cell('ws_1', 'Alerts')).toHaveTextContent('0');
    expect(within(cell('ws_1', 'Organic')).getByRole('img')).toHaveAccessibleName('Organic: Good — 4 published in the last 30 days and 0 queued.');
    expect(within(cell('ws_1', 'Paid')).getByRole('img')).toHaveAccessibleName('Paid: Good — 1 live campaign on track.');

    expect(cell('ws_2', 'Manager')).toHaveTextContent('Unassigned');
    expect(cell('ws_2', 'Channels')).toHaveTextContent('0');
    expect(cell('ws_2', 'Spend')).toHaveTextContent('₹1.5K');
    expect(cell('ws_2', 'Leads (30d)')).toHaveTextContent('0');
    expect(within(cell('ws_2', 'Leads (30d)')).getByTitle('1 all time')).toBeInTheDocument();
    expect(cell('ws_2', 'Alerts')).toHaveTextContent('2');
    expect(within(cell('ws_2', 'Organic')).getByRole('img')).toHaveAccessibleName('Organic: Poor — 1 post failed to publish.');
    expect(within(cell('ws_2', 'Paid')).getByRole('img')).toHaveAccessibleName('Paid: Poor — “Always on” is spending with no leads in 30 days.');
  });

  it('adds a client, which is then listed with its figures (TEN-007)', async () => {
    const user = userEvent.setup();
    let boot = clients.bootstrap;
    let summary = clients.summary;
    const api = mockApi({
      'GET /bootstrap': () => boot,
      'GET /workspaces/summary': () => summary,
      'GET /team': clients.team,
      'POST /workspaces': () => { boot = clients.bootstrapAfterAdd; summary = clients.summaryAfterAdd; return clients.added; },
    });
    renderApp(<Clients />, { route: '/app/clients' });
    await user.click(await screen.findByRole('button', { name: /add client/i }));

    const dialog = screen.getByRole('dialog', { name: 'Add a client' });
    expect(within(dialog).getByLabelText('Manager')).toHaveValue(String(clients.bootstrap.user.id)); // the creator by default
    await user.type(within(dialog).getByLabelText('Client name'), 'Lakeview Homes');
    await user.type(within(dialog).getByLabelText('Industry'), 'Real estate');
    await user.type(within(dialog).getByLabelText('Location'), 'Pune');
    await user.click(within(dialog).getByRole('button', { name: 'Add client' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.callsTo('POST /workspaces').map((c) => c.body)).toEqual([
      { name: 'Lakeview Homes', industry: 'Real estate', location: 'Pune', managerId: clients.bootstrap.user.id },
    ]);
    const added = clients.added.workspace.id;
    await waitFor(() => expect(within(row(added)).getByText('Lakeview Homes')).toBeInTheDocument());
    await waitFor(() => expect(within(cell(added, 'Organic')).getByRole('img')).toHaveAccessibleName('Organic: No activity — No organic activity yet.'));
    expect(screen.getByText('3 workspaces under management')).toBeInTheDocument();
  });

  it('explains a missing or duplicate name instead of failing silently', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': clients.bootstrap,
      'GET /workspaces/summary': clients.summary,
      'GET /team': clients.team,
      'POST /workspaces': [clients.duplicate.status, clients.duplicate.body],
    });
    renderApp(<Clients />, { route: '/app/clients' });
    await user.click(await screen.findByRole('button', { name: /add client/i }));
    const dialog = screen.getByRole('dialog', { name: 'Add a client' });

    await user.click(within(dialog).getByRole('button', { name: 'Add client' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Give the client a name.');
    expect(api.callsTo('POST /workspaces')).toHaveLength(0);

    await user.type(within(dialog).getByLabelText('Client name'), 'sunrise motors');
    await user.click(within(dialog).getByRole('button', { name: 'Add client' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(clients.duplicate.body.message);
    expect(within(dialog).getByRole('button', { name: 'Add client' })).toBeEnabled();
  });

  it('edits a client’s manager', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': clients.bootstrap,
      'GET /workspaces/summary': clients.summary,
      'GET /team': clients.team,
      'PATCH /workspaces/ws_2': clients.edited,
    });
    renderApp(<Clients />, { route: '/app/clients' });
    await user.click(await screen.findByRole('button', { name: 'Edit Sunrise Motors' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit Sunrise Motors' });
    expect(within(dialog).getByLabelText('Client name')).toHaveValue('Sunrise Motors');
    expect(within(dialog).getByLabelText('Manager')).toHaveValue('');
    await waitFor(() => expect(within(dialog).getByRole('option', { name: 'Asha Rao' })).toBeInTheDocument());
    await user.selectOptions(within(dialog).getByLabelText('Manager'), 'Asha Rao');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(api.callsTo('PATCH /workspaces/ws_2').map((c) => c.body)).toEqual([
      { name: 'Sunrise Motors', industry: 'Automotive', location: 'Nashik', managerId: clients.bootstrap.user.id },
    ]));
  });

  it('read-only roles see the add button disabled with a reason and no edit buttons', async () => {
    mockApi({ 'GET /bootstrap': { ...clients.bootstrap, role: 'Copywriter' }, 'GET /workspaces/summary': clients.summary });
    renderApp(<Clients />, { route: '/app/clients' });
    const add = await screen.findByRole('button', { name: /add client/i });
    expect(add).toBeDisabled();
    expect(add).toHaveAttribute('title', 'Only owners and admins can add or edit clients.');
    expect(screen.queryByRole('button', { name: /^Edit / })).not.toBeInTheDocument();
  });

  it('says when figures could not load rather than showing zeros', async () => {
    mockApi({ 'GET /bootstrap': clients.bootstrap, 'GET /workspaces/summary': [500, { status: 'error', message: 'boom' }] });
    renderApp(<Clients />, { route: '/app/clients' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Client figures couldn’t load.');
    expect(cell('ws_1', 'Spend')).toHaveTextContent('—');
  });
});

describe('Choose a workspace', () => {
  const business = {
    ...bootstrapFixture,
    workspaces: [...bootstrapFixture.workspaces],
  };
  const second = { id: 'ws_7', dbId: 7, name: 'Rao Dental Mumbai', industry: 'Dental clinic', location: 'Mumbai', logo: '✦', accent: '#e84a33', managerId: 1 };
  const summaryFor = (list) => ({ status: 'ok', clients: list.map((w) => ({ ...clients.summaryAfterAdd.clients[2], id: w.id })) });

  it('creates a new workspace and switches to it (TEN-006)', async () => {
    const user = userEvent.setup();
    let boot = business;
    const api = mockApi({
      'GET /bootstrap': () => boot,
      'GET /workspaces/summary': () => summaryFor(boot.workspaces),
      'GET /team': clients.team,
      'POST /workspaces': () => { boot = { ...business, workspaces: [...business.workspaces, second] }; return { status: 'ok', workspace: second }; },
    });
    renderApp(<><WorkspaceSelect /><Selected /></>, { route: '/app/workspaces' });
    expect(await screen.findByLabelText('Selected workspace')).toHaveTextContent('Rao Dental Pune');

    await user.click(screen.getByRole('button', { name: /new workspace/i }));
    const dialog = screen.getByRole('dialog', { name: 'New workspace' });
    await user.type(within(dialog).getByLabelText('Workspace name'), 'Rao Dental Mumbai');
    await user.click(within(dialog).getByRole('button', { name: 'Create workspace' }));

    await waitFor(() => expect(screen.getByLabelText('Selected workspace')).toHaveTextContent('Rao Dental Mumbai'));
    expect(api.callsTo('POST /workspaces')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Open Rao Dental Mumbai' })).toBeInTheDocument();
  });

  it('remembers the chosen workspace across a reload', async () => {
    const user = userEvent.setup();
    const boot = { ...business, workspaces: [...business.workspaces, second] };
    mockApi({ 'GET /bootstrap': boot, 'GET /workspaces/summary': summaryFor(boot.workspaces) });
    const first = renderApp(<><WorkspaceSelect /><Selected /></>, { route: '/app/workspaces' });
    await user.click(await screen.findByRole('button', { name: 'Open Rao Dental Mumbai' }));
    await waitFor(() => expect(screen.getByLabelText('Selected workspace')).toHaveTextContent('Rao Dental Mumbai'));
    first.unmount();

    renderApp(<Selected />, { route: '/app' });
    await waitFor(() => expect(screen.getByLabelText('Selected workspace')).toHaveTextContent('Rao Dental Mumbai'));
  });

  it('ignores a remembered workspace that belongs to someone else', async () => {
    localStorage.setItem('effy.workspace', JSON.stringify({ user: 999, workspace: 'ws_7' }));
    const boot = { ...business, workspaces: [...business.workspaces, second] };
    mockApi({ 'GET /bootstrap': boot });
    renderApp(<Selected />, { route: '/app' });
    await screen.findByLabelText('Selected workspace');
    // Let the provider's selection effect settle before asserting it didn't switch.
    await act(() => new Promise((r) => { setTimeout(r, 30); }));
    expect(screen.getByLabelText('Selected workspace')).toHaveTextContent('Rao Dental Pune');
  });
});

describe('sinceLabel', () => {
  const now = new Date('2026-09-14T12:00:00Z');
  it('describes how recently a workspace was used', () => {
    expect(sinceLabel(null, now)).toBe('No activity yet');
    expect(sinceLabel('2026-09-14T08:00:00Z', now)).toBe('Today');
    expect(sinceLabel('2026-09-13T08:00:00Z', now)).toBe('Yesterday');
    expect(sinceLabel('2026-09-04T08:00:00Z', now)).toBe('10 days ago');
    expect(sinceLabel('2026-07-01T08:00:00Z', now)).toBe('1 Jul 2026');
  });
});
