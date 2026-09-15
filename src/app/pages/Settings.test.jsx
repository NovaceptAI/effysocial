import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Settings from './Settings';
import Login from '../../marketing/Login';
import { AppAuthProvider } from '../context/AppAuth';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/settings';

// Settings and two-factor sign-in (G44; SET-001, SET-002, SET-003). Payloads come from the
// engine's test flow.
function openSettings(extra = {}, boot = fx.bootstrap) {
  const api = mockApi({
    'GET /bootstrap': boot, 'GET /auth/2fa': fx.statusOff, 'GET /onboarding': fx.onboarding, ...extra,
  });
  renderApp(<Settings />, { route: '/app/settings' });
  return api;
}
const section = (name) => screen.getByRole('region', { name });

describe('Settings that save (SET-001)', () => {
  it('saves notification choices and density to the account, and shows what was saved', async () => {
    const user = userEvent.setup();
    let boot = fx.bootstrap;
    const api = mockApi({
      'GET /bootstrap': () => boot, 'GET /auth/2fa': fx.statusOff, 'GET /onboarding': fx.onboarding,
      'PATCH /me/preferences': () => { boot = fx.bootstrapCompact; return fx.prefsSaved; },
    });
    renderApp(<Settings />, { route: '/app/settings' });
    const leads = await within(await screen.findByRole('region', { name: 'Notifications' })).findByRole('switch', { name: 'New leads' });
    expect(leads).toHaveAttribute('aria-checked', 'true');
    await user.click(leads);
    await waitFor(() => expect(within(section('Notifications')).getByRole('switch', { name: 'New leads' })).toHaveAttribute('aria-checked', 'false'));
    expect(within(section('Appearance')).getByRole('button', { name: 'compact' })).toHaveAttribute('aria-pressed', 'true');
    expect(api.callsTo('PATCH /me/preferences').map((c) => c.body)).toEqual([{ notifications: { leads: false } }]);
  });

  it('opens with the saved preferences after a reload', async () => {
    openSettings({}, fx.bootstrapCompact);
    const notifications = await screen.findByRole('region', { name: 'Notifications' });
    expect(within(notifications).getByRole('switch', { name: 'New leads' })).toHaveAttribute('aria-checked', 'false');
    expect(within(notifications).getByRole('switch', { name: 'Approval requests' })).toHaveAttribute('aria-checked', 'true');
    expect(within(section('Appearance')).getByRole('button', { name: 'compact' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('admins set the organisation’s time zone and currency', async () => {
    const user = userEvent.setup();
    const api = openSettings({ 'PATCH /onboarding': { status: 'ok', onboarding: {}, org: fx.onboarding.org } });
    const org = await screen.findByRole('region', { name: 'Organisation' });
    const tz = await within(org).findByRole('combobox', { name: 'Time zone' });
    expect(tz).toBeEnabled();
    await user.selectOptions(tz, 'Asia/Dubai');
    await user.selectOptions(within(org).getByRole('combobox', { name: 'Currency' }), 'USD');
    await waitFor(() => expect(api.callsTo('PATCH /onboarding').map((c) => c.body)).toEqual([
      { details: { timezone: 'Asia/Dubai' } }, { details: { currency: 'USD' } },
    ]));
  });

  it('other roles see the organisation settings but can’t change them', async () => {
    openSettings({}, { ...fx.bootstrap, role: 'Copywriter' });
    const tz = await within(await screen.findByRole('region', { name: 'Organisation' })).findByRole('combobox', { name: 'Time zone' });
    expect(tz).toBeDisabled();
  });

  it('saves your name', async () => {
    const user = userEvent.setup();
    const api = openSettings({ 'PATCH /auth/me': fx.renamed });
    const name = await within(await screen.findByRole('region', { name: 'Profile' })).findByLabelText('Your name');
    await user.clear(name);
    await user.type(name, 'Asha R.');
    await user.click(within(section('Profile')).getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Name saved.');
    expect(api.callsTo('PATCH /auth/me').map((c) => c.body)).toEqual([{ name: 'Asha R.' }]);
  });
});

describe('Password reset from Settings (SET-002)', () => {
  it('sends the link to your own email and says when it couldn’t be sent', async () => {
    const user = userEvent.setup();
    const api = openSettings({ 'POST /auth/reset-link': fx.resetLinkNotSent });
    await user.click(await within(await screen.findByRole('region', { name: 'Security' })).findByRole('button', { name: 'Send reset link' }));
    expect(await within(section('Security')).findByText('The email couldn’t be sent right now. Try again later.')).toBeInTheDocument();
    expect(api.callsTo('POST /auth/reset-link')).toHaveLength(1);
  });
});

describe('Two-factor sign-in (SET-003)', () => {
  it('turns on with a password, a QR code and a code, then shows recovery codes', async () => {
    const user = userEvent.setup();
    const api = openSettings({
      'POST /auth/2fa/setup': (body) => (body.password === 'secret123' ? fx.setup : [fx.setupWrongPassword.status, fx.setupWrongPassword.body]),
      'POST /auth/2fa/enable': (body) => (body.code === '000000' ? [fx.enableWrongCode.status, fx.enableWrongCode.body] : fx.enabled),
    });
    await user.click(await within(await screen.findByRole('region', { name: 'Security' })).findByRole('button', { name: 'Turn on' }));
    const dialog = screen.getByRole('dialog', { name: 'Turn on two-factor sign-in' });
    await user.type(within(dialog).getByLabelText('Your password'), 'wrong');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('That password isn\'t right.');
    await user.clear(within(dialog).getByLabelText('Your password'));
    await user.type(within(dialog).getByLabelText('Your password'), 'secret123');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));

    const qr = await within(dialog).findByRole('img', { name: 'QR code for your authenticator app' });
    expect(qr.querySelector('svg')).not.toBeNull();
    expect(within(dialog).getByLabelText('Setup key').textContent.replace(/ /g, '')).toBe(fx.setup.secret);
    const turnOn = within(dialog).getByRole('button', { name: 'Turn on' });
    await user.type(within(dialog).getByLabelText('Code from the app'), '000000');
    await user.click(turnOn);
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('That code doesn\'t match');
    await user.clear(within(dialog).getByLabelText('Code from the app'));
    await user.type(within(dialog).getByLabelText('Code from the app'), '123456');
    await user.click(within(dialog).getByRole('button', { name: 'Turn on' }));

    const codes = await within(dialog).findByRole('list', { name: 'Recovery codes' });
    expect(within(codes).getAllByRole('listitem').map((li) => li.textContent)).toEqual(fx.enabled.recoveryCodes);
    expect(api.callsTo('POST /auth/2fa/enable').map((c) => c.body)).toEqual([{ code: '000000' }, { code: '123456' }]);
  });

  it('turning it off asks for the password and a code', async () => {
    const user = userEvent.setup();
    const api = openSettings({ 'GET /auth/2fa': fx.statusOn, 'POST /auth/2fa/disable': fx.disabled }, fx.bootstrapTwoFactor);
    const security = await screen.findByRole('region', { name: 'Security' });
    expect(await within(security).findByText('On · 8 recovery codes left')).toBeInTheDocument();
    await user.click(within(security).getByRole('button', { name: 'Turn off' }));
    const dialog = screen.getByRole('dialog', { name: 'Turn off two-factor sign-in' });
    const confirm = within(dialog).getByRole('button', { name: 'Confirm' });
    await user.type(within(dialog).getByLabelText('Authenticator or recovery code'), '654321');
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByLabelText('Your password'), 'secret123');
    await user.click(confirm);
    await waitFor(() => expect(api.callsTo('POST /auth/2fa/disable').map((c) => c.body)).toEqual([{ password: 'secret123', code: '654321' }]));
  });
});

describe('Signing in with two-factor on', () => {
  function Where() {
    const { pathname } = useLocation();
    return <output aria-label="Current page">{pathname}</output>;
  }
  const signedOut = [401, { status: 'error', message: 'Authentication required.' }];
  const openLogin = () => render(
    <AppAuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes><Route path="/login" element={<Login />} /><Route path="*" element={<Where />} /></Routes>
      </MemoryRouter>
    </AppAuthProvider>,
  );

  it('asks for the code after the password, and a wrong code says so', async () => {
    const user = userEvent.setup();
    const api = mockApi({
      'GET /bootstrap': signedOut,
      'POST /auth/login': fx.loginNeedsTwoFactor,
      'POST /auth/2fa/verify': (body) => (body.code === '000000' ? [fx.verifyWrong.status, fx.verifyWrong.body] : fx.verified),
    });
    openLogin();
    await user.type(await screen.findByPlaceholderText('you@company.com'), 'asha@northwind.in');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByRole('heading', { name: 'Two-factor sign-in' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Authentication code'), '000000');
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(fx.verifyWrong.body.message);
    await user.click(screen.getByRole('button', { name: 'Use a recovery code' }));
    await user.type(screen.getByLabelText('Recovery code'), fx.enabled.recoveryCodes[0]);
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(await screen.findByLabelText('Current page')).toHaveTextContent('/app');
    expect(api.callsTo('POST /auth/2fa/verify').map((c) => c.body)).toEqual([{ code: '000000' }, { code: fx.enabled.recoveryCodes[0] }]);
  });

  it('an expired sign-in goes back to the password', async () => {
    const user = userEvent.setup();
    mockApi({ 'GET /bootstrap': signedOut, 'POST /auth/login': fx.loginNeedsTwoFactor, 'POST /auth/2fa/verify': [fx.verifyExpired.status, fx.verifyExpired.body] });
    openLogin();
    await user.type(await screen.findByPlaceholderText('you@company.com'), 'asha@northwind.in');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    await user.type(await screen.findByLabelText('Authentication code'), '123456');
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your sign-in expired.');
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('');
  });
});
