import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Team from './Team';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import team from '../../test/fixtures/team';

// Team (G23; SET-004, RBAC-009). Payloads come from the engine's test flow: an agency
// owner, a copywriter who joined, a pending client-approver invite and an expired one.
const rowFor = (email) => within(screen.getByRole('table', { name: 'Members' })).getByText(email).closest('tr');
const inviteRow = (email) => within(screen.getByRole('region', { name: 'Pending invites' })).getByText(email).closest('tr');

afterEach(() => { vi.unstubAllGlobals(); });

function openAs(boot = team.ownerBootstrap, extra = {}) {
  const api = mockApi({ 'GET /bootstrap': boot, 'GET /team': team.teamOwner, ...extra });
  renderApp(<Team />, { route: '/app/team' });
  return api;
}

describe('Team page', () => {
  it('lists the real members, their roles and pending invites (SET-004)', async () => {
    openAs();
    await screen.findByRole('table', { name: 'Members' });
    const owner = rowFor('asha@northwind.in');
    expect(owner).toHaveTextContent('Asha Rao');
    expect(owner).toHaveTextContent('You');
    expect(owner).toHaveTextContent('Agency owner');
    expect(within(owner).queryByRole('combobox')).not.toBeInTheDocument(); // the owner's role is fixed
    expect(within(owner).queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();

    const kiran = rowFor('kiran@northwind.in');
    expect(within(kiran).getByRole('combobox', { name: 'Role for kiran@northwind.in' })).toHaveValue('Copywriter');
    const options = within(within(kiran).getByRole('combobox')).getAllByRole('option').map((o) => o.textContent);
    expect(options).toContain('Agency admin');
    expect(options).not.toContain('Workspace admin'); // an agency's admin role only

    expect(inviteRow('meera@client.in')).toHaveTextContent('Client approver · invited by Asha Rao');
    expect(inviteRow('dev@northwind.in')).toHaveTextContent('expired');
  });

  it('invites a teammate with a role and hands over the link when email can’t be sent (RBAC-009)', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const api = openAs(team.ownerBootstrap, { 'POST /team/invites': team.invite });
    await user.click(await screen.findByRole('button', { name: /invite member/i }));
    const dialog = screen.getByRole('dialog', { name: 'Invite a teammate' });
    expect(within(dialog).getByRole('radio', { name: /Copywriter/ })).toBeChecked();
    expect(within(dialog).queryByRole('radio', { name: /Workspace admin/ })).not.toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('Email'), 'kiran@northwind.in');
    await user.click(within(dialog).getByRole('button', { name: /send invite/i }));

    const ready = await screen.findByRole('dialog', { name: 'Invite ready' });
    expect(ready).toHaveTextContent('the email couldn’t be sent. Copy the link and send it to them');
    expect(within(ready).getByLabelText('Invite link')).toHaveValue(team.invite.link);
    await user.click(within(ready).getByRole('button', { name: /copy link/i }));
    expect(writeText).toHaveBeenCalledWith(team.invite.link);
    expect(await within(ready).findByRole('button', { name: /copied/i })).toBeInTheDocument();
    expect(api.callsTo('POST /team/invites').map((c) => c.body)).toEqual([{ email: 'kiran@northwind.in', role: 'Copywriter' }]);
    await waitFor(() => expect(api.callsTo('GET /team').length).toBeGreaterThan(1)); // the list refreshes
  });

  it('shows why an invite was refused', async () => {
    const user = userEvent.setup();
    openAs(team.ownerBootstrap, { 'POST /team/invites': [team.alreadyInTeam.status, team.alreadyInTeam.body] });
    await user.click(await screen.findByRole('button', { name: /invite member/i }));
    const dialog = screen.getByRole('dialog', { name: 'Invite a teammate' });
    await user.type(within(dialog).getByLabelText('Email'), 'kiran@northwind.in');
    await user.click(within(dialog).getByRole('radio', { name: /View-only/ }));
    await user.click(within(dialog).getByRole('button', { name: /send invite/i }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(team.alreadyInTeam.body.message);
  });

  it('changes a role and removes a member after confirming', async () => {
    const user = userEvent.setup();
    const api = openAs(team.ownerBootstrap, { 'PATCH /team/members/2': team.changed, 'DELETE /team/members/2': { status: 'ok' } });
    await screen.findByRole('table', { name: 'Members' });
    await user.selectOptions(within(rowFor('kiran@northwind.in')).getByRole('combobox'), 'Account manager');
    await waitFor(() => expect(api.callsTo('PATCH /team/members/2').map((c) => c.body)).toEqual([{ role: 'Account manager' }]));

    await user.click(within(rowFor('kiran@northwind.in')).getByRole('button', { name: 'Remove kiran@northwind.in' }));
    expect(api.callsTo('DELETE /team/members/2')).toHaveLength(0);
    await user.click(within(rowFor('kiran@northwind.in')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(api.callsTo('DELETE /team/members/2')).toHaveLength(1));
  });

  it('resends an invite with a new link, and cancels one', async () => {
    const user = userEvent.setup();
    const api = openAs(team.ownerBootstrap, { 'POST /team/invites/2/resend': team.resent, 'DELETE /team/invites/3': { status: 'ok' } });
    await screen.findByRole('region', { name: 'Pending invites' });
    await user.click(screen.getByRole('button', { name: 'Resend invite to meera@client.in' }));
    const resent = await screen.findByRole('dialog', { name: 'Invite resent' });
    expect(within(resent).getByLabelText('Invite link')).toHaveValue(team.resent.link);
    await user.click(within(resent).getByRole('button', { name: 'Done' }));
    await user.click(screen.getByRole('button', { name: 'Cancel invite to dev@northwind.in' }));
    await waitFor(() => expect(api.callsTo('DELETE /team/invites/3')).toHaveLength(1));
  });

  it('teammates who aren’t admins see the team but can’t manage it', async () => {
    mockApi({ 'GET /bootstrap': team.accepted, 'GET /team': team.teamMember });
    renderApp(<Team />, { route: '/app/team' });
    await screen.findByRole('table', { name: 'Members' });
    const invite = screen.getByRole('button', { name: /invite member/i });
    expect(invite).toBeDisabled();
    expect(invite).toHaveAttribute('title', 'Only owners and admins can invite teammates.');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Remove / })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Pending invites' })).not.toBeInTheDocument();
  });
});
