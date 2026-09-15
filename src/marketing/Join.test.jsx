import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppAuthProvider } from '../app/context/AppAuth';
import Join from './Join';
import Login from './Login';
import { mockApi } from '../test/mockApi';
import team from '../test/fixtures/team';

// Accepting an invite (G23, RBAC-009). Payloads from the engine's test flow.
const TOKEN = 'invite-token-1';
const signedOut = [401, { status: 'error', message: 'Authentication required.' }];

function Where() {
  const { pathname, search } = useLocation();
  return <output aria-label="Current page">{pathname + search}</output>;
}

function open(route = `/join?token=${TOKEN}`, withLogin = false) {
  render(
    <AppAuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/join" element={<Join />} />
          {withLogin && <Route path="/login" element={<Login />} />}
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </AppAuthProvider>,
  );
}

describe('Join page', () => {
  it('a new teammate creates an account and lands in the app', async () => {
    const user = userEvent.setup();
    let signedIn = false;
    const api = mockApi({
      'GET /bootstrap': () => (signedIn ? team.accepted : signedOut),
      [`GET /invites/${TOKEN}`]: team.viewNew,
      [`POST /invites/${TOKEN}/accept`]: () => { signedIn = true; return team.accepted; },
    });
    open();
    expect(await screen.findByRole('heading', { name: 'Join Northwind on EffySocial' })).toBeInTheDocument();
    expect(screen.getByText(/Asha Rao invited you as/)).toHaveTextContent('Asha Rao invited you as Copywriter.');
    expect(screen.getByLabelText('Email')).toHaveValue('kiran@northwind.in');
    const submit = screen.getByRole('button', { name: /create account and join/i });
    await user.type(screen.getByLabelText('Your name'), 'Kiran Patil');
    await user.type(screen.getByLabelText('Choose a password'), 'short');
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText('Choose a password'), '-enough');
    await user.click(submit);
    expect(await screen.findByLabelText('Current page')).toHaveTextContent('/app');
    expect(api.callsTo(`POST /invites/${TOKEN}/accept`).map((c) => c.body)).toEqual([{ name: 'Kiran Patil', password: 'short-enough' }]);
  });

  it('someone with an account signs in first and comes back to the invite', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': signedOut,
      [`GET /invites/${TOKEN}`]: team.viewExisting,
      'POST /auth/login': team.removedBootstrap,
    });
    open(`/join?token=${TOKEN}`, true);
    await user.click(await screen.findByRole('button', { name: 'Sign in as kiran@northwind.in to join' }));
    expect(await screen.findByText('Log in to accept your invite.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@company.com')).toHaveValue('kiran@northwind.in');
    await user.type(screen.getByPlaceholderText('••••••••'), 'joining-123');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    // Back on the invite, now signed in as the invited email.
    expect(await screen.findByRole('button', { name: 'Join Northwind' })).toBeInTheDocument();
  });

  it('a signed-in teammate with the invited email joins with one click', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': team.removedBootstrap,
      [`GET /invites/${TOKEN}`]: team.viewExisting,
      [`POST /invites/${TOKEN}/accept`]: team.accepted,
    });
    open();
    await user.click(await screen.findByRole('button', { name: 'Join Northwind' }));
    expect(await screen.findByLabelText('Current page')).toHaveTextContent('/app');
    expect(api.callsTo(`POST /invites/${TOKEN}/accept`).map((c) => c.body)).toEqual([{}]);
  });

  it('a different signed-in account is asked to sign out first', async () => {
    const user = userEvent.setup();
    let signedIn = true;
    const api = mockApi({
      'GET /bootstrap': () => (signedIn ? team.ownerBootstrap : signedOut),
      [`GET /invites/${TOKEN}`]: team.viewNew,
      'POST /auth/logout': () => { signedIn = false; return { status: 'ok' }; },
    });
    open();
    expect(await screen.findByRole('alert')).toHaveTextContent('You’re signed in as asha@northwind.in, but this invite is for kiran@northwind.in.');
    await user.click(screen.getByRole('button', { name: 'Sign out and continue' }));
    expect(await screen.findByRole('button', { name: /create account and join/i })).toBeInTheDocument();
    expect(api.callsTo('POST /auth/logout')).toHaveLength(1);
  });

  it('a used or broken link says so', async () => {
    mockApi({ 'GET /bootstrap': signedOut, [`GET /invites/${TOKEN}`]: [team.usedInvite.status, team.usedInvite.body] });
    open();
    expect(await screen.findByRole('heading', { name: 'This invite can’t be used' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('This invite has already been used.');
  });

  it('if the account appears meanwhile, accepting sends them to sign in', async () => {
    const user = userEvent.setup();
    mockApi({
      'GET /bootstrap': signedOut,
      [`GET /invites/${TOKEN}`]: team.viewNew,
      [`POST /invites/${TOKEN}/accept`]: [team.needsSignIn.status, team.needsSignIn.body],
    });
    open();
    await user.type(await screen.findByLabelText('Your name'), 'Kiran');
    await user.type(screen.getByLabelText('Choose a password'), 'joining-123');
    await user.click(screen.getByRole('button', { name: /create account and join/i }));
    await waitFor(() => expect(screen.getByLabelText('Current page')).toHaveTextContent(
      `/login?next=${encodeURIComponent(`/join?token=${TOKEN}`)}&email=kiran%40northwind.in`,
    ));
  });
});

describe('Login after an invite', () => {
  it('only returns to invite links, never elsewhere', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': signedOut, 'POST /auth/login': team.ownerBootstrap });
    open(`/login?next=${encodeURIComponent('https://evil.example/')}`, true);
    expect(await screen.findByText('Log in to continue to your workspace.')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('you@company.com'), 'asha@northwind.in');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret-123');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByLabelText('Current page')).toHaveTextContent(/^\/app$/);
  });
});
