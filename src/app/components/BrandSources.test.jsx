import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrandSources from './BrandSources';
import { mockApi } from '../../test/mockApi';
import fx from '../../test/fixtures/brandSources';

// Websites are read and written briefs saved as brand sources, so the plan and Draft
// with AI know what the business does. Payloads come from the engine's test flow.
const ws = 'ws_1';
const sources = fx.brand.brain.sources.data;

function open(props = {}) {
  let changed = 0;
  render(<BrandSources workspaceId={ws} sources={sources} onChanged={() => { changed += 1; }} {...props} />);
  return { region: screen.getByRole('region', { name: 'Brand sources' }), changed: () => changed };
}

describe('Brand sources', () => {
  it('lists what was read from each source', () => {
    const { region } = open();
    const items = within(region).getAllByRole('listitem').map((li) => li.textContent);
    expect(items[0]).toContain('Nova Labs | AI services');
    expect(items[0]).toContain('https://nova.example/ · 545 characters of text');
    expect(items[1]).toContain('https://www.nova.example/ · link only — not read');
    expect(items[2]).toContain('Business brief');
    expect(items[2]).toContain('89 characters of text');
  });

  it('says how much of a website was read', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'POST /brand/source': fx.websiteRead });
    const { region, changed } = open();
    await user.type(within(region).getByLabelText('Website address'), 'https://nova.example/');
    await user.click(within(region).getByRole('button', { name: /add website/i }));
    expect(await within(region).findByRole('status')).toHaveTextContent('Read 3 pages from nova.example.');
    expect(api.callsTo('POST /brand/source').map((c) => c.body)).toEqual([{ workspace: ws, type: 'website', name: '', ref: 'https://nova.example/' }]);
    expect(changed()).toBe(1);
  });

  it('says when a website was already read', async () => {
    const user = userEvent.setup();
    mockApi({ 'POST /brand/source': fx.websiteAlreadyRead });
    const { region } = open();
    await user.type(within(region).getByLabelText('Website address'), 'https://nova.example/');
    await user.click(within(region).getByRole('button', { name: /add website/i }));
    expect(await within(region).findByRole('status')).toHaveTextContent('nova.example was already read.');
  });

  it('keeps the link but explains a website it couldn’t read', async () => {
    const user = userEvent.setup();
    mockApi({ 'POST /brand/source': fx.websiteUnreadable });
    const { region } = open();
    await user.type(within(region).getByLabelText('Website address'), 'https://www.nova.example/');
    await user.click(within(region).getByRole('button', { name: /add website/i }));
    expect(await within(region).findByRole('status')).toHaveTextContent(`Saved the link, but couldn’t read it: ${fx.websiteUnreadable.read.message}`);
  });

  it('saves a written brief', async () => {
    const user = userEvent.setup();
    const api = mockApi({ 'POST /brand/source': fx.brief });
    const { region, changed } = open();
    expect(within(region).queryByLabelText('Business brief')).not.toBeInTheDocument();
    await user.click(within(region).getByRole('button', { name: /write a brief/i }));
    const box = within(region).getByLabelText('Business brief');
    await user.type(box, 'AI voice');
    expect(within(region).getByRole('button', { name: 'Save brief' })).toBeDisabled();
    await user.type(box, ' agents that answer loan enquiries for cooperative banks.');
    await user.click(within(region).getByRole('button', { name: 'Save brief' }));
    await waitFor(() => expect(api.callsTo('POST /brand/source').map((c) => c.body)).toEqual([{
      workspace: ws, type: 'manual', name: 'Business brief', content: 'AI voice agents that answer loan enquiries for cooperative banks.',
    }]));
    await waitFor(() => expect(within(region).queryByLabelText('Business brief')).not.toBeInTheDocument());
    expect(changed()).toBe(1);
  });

  it('onboarding opens the brief box straight away and pre-fills the website', () => {
    const { region } = open({ briefOpen: true, defaultLink: 'https://nova.example/' });
    expect(within(region).getByLabelText('Business brief')).toBeInTheDocument();
    expect(within(region).getByLabelText('Website address')).toHaveValue('https://nova.example/');
  });
});
