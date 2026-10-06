import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppAuthProvider } from '../app/context/AppAuth';
import Login from './Login';
import { SignedInGoesToApp } from '../App';
import { mockApi } from '../test/mockApi';
import ob from '../test/fixtures/onboarding';

// Log in and Create account are two tabs, each with its own button, so pressing Enter does
// what the open tab says. A first-time visitor who types into Log in is pointed to sign-up.
const signedOut = [401, { status: 'error', message: 'Authentication required.' }];
const wrong = [401, { status: 'error', message: 'Invalid email or password.' }];

function Where() {
  const { pathname, search } = useLocation();
  return <output aria-label="Current page">{pathname + search}</output>;
}

function open(route = '/login') {
  render(
    <AppAuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={<SignedInGoesToApp><h1>Landing page</h1></SignedInGoesToApp>} />
          <Route path="/login" element={<SignedInGoesToApp><Login /></SignedInGoesToApp>} />
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </AppAuthProvider>,
  );
}

async function type(user, email, password) {
  await user.type(screen.getByPlaceholderText('you@company.com'), email);
  await user.type(screen.getByPlaceholderText('••••••••'), `${password}{Enter}`);
}

describe('Log in / Create account', () => {
  it('Enter on Log in signs in; a wrong password points a newcomer to Create account', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'GET /bootstrap': signedOut, 'POST /auth/login': wrong, 'POST /auth/register': ob.bootstrapFresh });
    open();
    expect(await screen.findByRole('tab', { name: 'Log in' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    await type(user, 'asha@roofseal.in', 'secret-123');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid email or password. New to EffySocial? Create your free account');
    expect(api.callsTo('POST /auth/register')).toHaveLength(0);
    // One click moves to Create account, keeping what was typed.
    await user.click(within(alert).getByRole('button', { name: 'Create your free account' }));
    expect(screen.getByRole('tab', { name: 'Create account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('you@company.com')).toHaveValue('asha@roofseal.in');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(api.callsTo('POST /auth/register').map((c) => c.body)).toEqual([{ email: 'asha@roofseal.in', password: 'secret-123', name: 'asha' }]);
    expect(await screen.findByRole('status', { name: 'Current page' })).toHaveTextContent('/onboarding');
  });

  it('sign-up links open Create account, where Enter creates the account', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'GET /bootstrap': signedOut, 'POST /auth/register': ob.bootstrapFresh });
    open('/login?mode=signup');
    expect(await screen.findByRole('tab', { name: 'Create account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Create your free account' })).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Forgot password?' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
    await type(user, 'meera@northwind.in', 'secret-123');
    expect(api.callsTo('POST /auth/register')).toHaveLength(1);
    expect(api.callsTo('POST /auth/login')).toHaveLength(0);
    expect(await screen.findByRole('status', { name: 'Current page' })).toHaveTextContent('/onboarding');
  });

  it('a short password is caught before anything is sent', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'GET /bootstrap': signedOut });
    open('/login?mode=signup');
    await screen.findByRole('tab', { name: 'Create account' });
    await type(user, 'meera@northwind.in', 'short');
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter an email and a password of at least 8 characters to sign up.');
    expect(api.callsTo('POST /auth/register')).toHaveLength(0);
  });

  it('an invite link always opens Log in', async () => {
    mockApi({ 'GET /bootstrap': signedOut });
    open('/login?mode=signup&next=%2Fjoin%3Ftoken%3Dabc');
    expect(await screen.findByRole('tab', { name: 'Log in' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Log in to accept your invite.')).toBeInTheDocument();
  });
});

// Someone already signed in skips the landing page and the login screen.
describe('Signed in already', () => {
  it('the landing page opens the app', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted });
    open('/');
    expect(await screen.findByRole('status', { name: 'Current page' })).toHaveTextContent('/app');
    expect(screen.queryByRole('heading', { name: 'Landing page' })).not.toBeInTheDocument();
  });

  it('the login screen opens the app', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted });
    open('/login');
    expect(await screen.findByRole('status', { name: 'Current page' })).toHaveTextContent('/app');
  });

  it('an invite link still opens Log in', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapCompleted });
    open('/login?next=%2Fjoin%3Ftoken%3Dabc');
    expect(await screen.findByText('Log in to accept your invite.')).toBeInTheDocument();
  });

  it('signed out, the landing page stays', async () => {
    const api = mockApi({ 'GET /bootstrap': signedOut });
    open('/');
    expect(await screen.findByRole('heading', { name: 'Landing page' })).toBeInTheDocument();
    await waitFor(() => expect(api.callsTo('GET /bootstrap')).toHaveLength(1));
    expect(screen.getByRole('heading', { name: 'Landing page' })).toBeInTheDocument();
  });
});
