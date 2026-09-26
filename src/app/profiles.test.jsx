import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppAuthProvider } from './context/AppAuth';
import Onboarding from '../marketing/Onboarding';
import { WorkEmailBanner } from './shell/AppShell';
import WorkEmailForm from './components/WorkEmailForm';
import { mockApi, bootstrapFixture } from '../test/mockApi';
import { renderApp } from '../test/render';
import ob from '../test/fixtures/onboarding';

// Account profiles (launch plan 6.14): three profiles named for what they do; a Business
// confirms itself with a work email and is asked to until it has.
const PROFILES = {
  business: { type: 'business', label: 'Business', desc: 'We market our own company or shop.', clientFeatures: true },
  personal_brand: { type: 'personal_brand', label: 'Personal Brand', desc: 'I market myself — my expertise, practice or profile.', clientFeatures: false },
  agency: { type: 'agency', label: 'Agency & Creators', desc: 'I create and run marketing for other brands.', clientFeatures: true },
};
const withProfile = (profile) => ({ ...bootstrapFixture, org: { ...bootstrapFixture.org, type: profile.type, profile } });
const unverified = { email: null, verified: false, verifiedAt: null, pending: null };

describe('Onboarding — the three profiles', () => {
  it('offers Business, Personal Brand and Agency & Creators, each saying what it does', async () => {
    mockApi({ 'GET /bootstrap': ob.bootstrapFresh, 'GET /onboarding': ob.fresh, 'PATCH /onboarding': ob.savedPatch });
    render(
      <AppAuthProvider>
        <MemoryRouter initialEntries={['/onboarding']}><Routes><Route path="/onboarding" element={<Onboarding />} /></Routes></MemoryRouter>
      </AppAuthProvider>,
    );
    const radios = await screen.findAllByRole('radio');
    expect(radios.map((r) => r.textContent)).toEqual([
      'BusinessWe market our own company or shop.',
      'Personal BrandI market myself — my expertise, practice or profile.',
      'Agency & CreatorsI create and run marketing for other brands.',
    ]);
    await userEvent.click(screen.getByRole('radio', { name: /Personal Brand/ }));
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByRole('heading', { name: 'Tell us about yourself' })).toBeInTheDocument();
  });
});

describe('Confirm this business', () => {
  it('asks an unverified Business for its work email', async () => {
    mockApi({ 'GET /bootstrap': withProfile({ ...PROFILES.business, workEmail: { ...unverified, pending: 'owner@northwind.in' } }) });
    renderApp(<WorkEmailBanner />);
    const banner = await screen.findByRole('status', { name: 'Work email' });
    expect(banner).toHaveTextContent('Confirm this business. Verify a work email at your company’s own domain — we sent a code to owner@northwind.in.');
    expect(screen.getByRole('link', { name: 'Verify now' })).toHaveAttribute('href', '/app/settings#work-email');
  });

  it('says nothing once verified, or for the other profiles', async () => {
    for (const bootstrap of [
      withProfile({ ...PROFILES.business, workEmail: { email: 'owner@northwind.in', verified: true, verifiedAt: '2026-09-26T10:00:00+00:00', pending: null } }),
      withProfile(PROFILES.personal_brand),
      withProfile(PROFILES.agency),
    ]) {
      mockApi({ 'GET /bootstrap': bootstrap });
      const { unmount } = renderApp(<><WorkEmailBanner /><p>Loaded</p></>);
      await screen.findByText('Loaded');
      expect(screen.queryByRole('status', { name: 'Work email' })).not.toBeInTheDocument();
      unmount();
    }
  });
});

describe('WorkEmailForm', () => {
  it('sends a code to the work email, then verifies it', async () => {
    const api = mockApi({
      'POST /profile/work-email': { status: 'ok', verified: false, sent: true, email: 'owner@northwind.in' },
      'POST /profile/work-email/verify': { status: 'ok', verified: true },
    });
    const onChanged = vi.fn();
    render(<WorkEmailForm workEmail={unverified} canManage onChanged={onChanged} />);
    await userEvent.type(screen.getByLabelText('Work email'), 'owner@northwind.in');
    await userEvent.click(screen.getByRole('button', { name: /Send code/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('We sent a code to owner@northwind.in.');
    const verify = screen.getByRole('button', { name: 'Verify' });
    expect(verify).toBeDisabled();                                   // six digits first
    await userEvent.type(screen.getByLabelText('Code'), '12a34 56');
    expect(screen.getByLabelText('Code')).toHaveValue('123456');     // digits only
    await userEvent.click(verify);
    expect(api.callsTo('POST /profile/work-email/verify')[0].body).toEqual({ code: '123456' });
    expect(onChanged).toHaveBeenCalled();
  });

  it('shows why a free-mail address is refused', async () => {
    mockApi({ 'POST /profile/work-email': [400, { status: 'error', message: 'Use your company email — an address at your business’s own domain, not Gmail, Outlook or Yahoo.' }] });
    render(<WorkEmailForm workEmail={unverified} canManage />);
    await userEvent.type(screen.getByLabelText('Work email'), 'asha@gmail.com');
    await userEvent.click(screen.getByRole('button', { name: /Send code/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Use your company email');
    expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
  });

  it('shows the verified address, and read-only roles can’t change it', () => {
    const { rerender } = render(<WorkEmailForm workEmail={{ email: 'owner@northwind.in', verified: true }} canManage />);
    expect(screen.getByText('owner@northwind.in — verified')).toBeInTheDocument();
    rerender(<WorkEmailForm workEmail={unverified} canManage={false} />);
    expect(screen.getByText('Not verified yet. An owner or admin can verify it.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Work email')).not.toBeInTheDocument();
  });
});
