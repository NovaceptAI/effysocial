import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrandBrain from './BrandBrain';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/brandAndShots';

// Brand voice test (BRAND-004) and brand sources (BRAND-005). Payloads come from the
// engine's test flow: a text PDF of brand guidelines and a website link.
const ws = bootstrapFixture.workspaces[0].id;
const open = (handlers = {}) => {
  const api = mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /brand': fx.brand, ...handlers });
  renderApp(<BrandBrain />, { route: '/app/brand' });
  return api;
};

describe('Brand Brain — voice test and sources', () => {
  it('tests the brand voice and says what grounded it (BRAND-004)', async () => {
    const user = userEvent.setup();
    const api = open({ 'POST /brand/test': fx.voiceTest });
    const card = await screen.findByRole('region', { name: 'Test the brand voice' });
    const tryIt = within(card).getByRole('button', { name: /try it/i });
    expect(tryIt).toBeDisabled();
    await user.type(within(card).getByLabelText('What should Effy write?'), 'Diwali caption');
    await user.click(tryIt);
    expect(await within(card).findByTestId('voice-output')).toHaveTextContent(fx.voiceTest.output);
    expect(within(card).getByText('Grounded in: tone, approved words, words to avoid, Brand guidelines.pdf')).toBeInTheDocument();
    expect(api.callsTo('POST /brand/test')[0].body).toEqual({ workspace: ws, prompt: 'Diwali caption' });
  });

  it('lists sources and uploads, refuses and removes documents (BRAND-005)', async () => {
    const user = userEvent.setup();
    let refuse = false;
    const api = open({
      'POST /brand/source': () => (refuse ? [400, fx.unreadable] : fx.addedDocument),
      'DELETE /brand/source/1': { status: 'ok' },
    });
    const card = await screen.findByRole('region', { name: 'Brand sources' });
    expect(within(card).getByText('Brand guidelines.pdf')).toBeInTheDocument();
    expect(within(card).getByText(/84 characters of text/)).toBeInTheDocument();
    expect(within(card).getByText(/https:\/\/clinic\.example/)).toBeInTheDocument();

    const input = card.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [new File(['%PDF'], 'guidelines.pdf', { type: 'application/pdf' })] } });
    await waitFor(() => expect(api.callsTo('POST /brand/source')).toHaveLength(1));
    await waitFor(() => expect(api.callsTo('GET /brand').length).toBeGreaterThan(1)); // list refreshed

    refuse = true;
    fireEvent.change(input, { target: { files: [new File(['%PDF'], 'scan.pdf', { type: 'application/pdf' })] } });
    expect(await within(card).findByRole('alert')).toHaveTextContent('scanned PDF');

    await user.click(within(card).getByRole('button', { name: 'Remove Brand guidelines.pdf' }));
    await waitFor(() => expect(api.callsTo('DELETE /brand/source/1')).toHaveLength(1));
  });

  it('adds a website link', async () => {
    const user = userEvent.setup();
    const api = open({ 'POST /brand/source': fx.addedLink });
    const card = await screen.findByRole('region', { name: 'Brand sources' });
    await user.type(within(card).getByLabelText('Website name'), 'Clinic website');
    await user.type(within(card).getByLabelText('Website address'), 'https://clinic.example');
    await user.click(within(card).getByRole('button', { name: /add website/i }));
    await waitFor(() => expect(api.callsTo('POST /brand/source').map((c) => c.body))
      .toEqual([{ workspace: ws, type: 'website', name: 'Clinic website', ref: 'https://clinic.example' }]));
    expect(within(card).getByLabelText('Website address')).toHaveValue('');
  });

  it('Draft with AI names the document it drew on', async () => {
    const user = userEvent.setup();
    open({ 'POST /brand/suggest': fx.suggest });
    const heading = await screen.findByRole('heading', { name: /words to use/i });
    const section = heading.closest('div').parentElement;
    await user.click(within(section).getByRole('button', { name: /draft with ai/i }));
    expect(await within(section).findByText('Drafted from: Brand guidelines.pdf')).toBeInTheDocument();
    expect(within(section).getByRole('textbox')).toHaveValue('smile makeover, painless care');
  });
});
