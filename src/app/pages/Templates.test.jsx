import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import Templates from './Templates';
import { TEMPLATES } from '../templates';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/creative';

// Templates are shapes, not words: picking one opens AI Studio in that format with the
// brief already written, so the copy comes from this workspace's Brand Brain (5.2, G39).
function Where() {
  const { pathname, search } = useLocation();
  return <output data-testid="where">{pathname + search}</output>;
}

const open = (bootstrap = fx.bootstrap) => {
  mockApi({ 'GET /bootstrap': bootstrap });
  renderApp(<><Templates /><Where /></>, { route: '/app/templates' });
};

describe('Templates', () => {
  it('shows the gallery with each template’s structure', async () => {
    open();
    const card = await screen.findByRole('article', { name: 'Before and after' });
    expect(within(card).getByText('Trust')).toBeInTheDocument();
    expect(within(card).getByText('Instagram Reel')).toBeInTheDocument();
    expect(within(card).getByText('Show the work happening')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(TEMPLATES.length);
  });

  it('filters by goal and by search', async () => {
    const user = userEvent.setup();
    open();
    await user.click(await screen.findByRole('button', { name: 'Offer' }));
    const offers = screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'));
    expect(offers).toContain('This week’s offer');
    expect(offers).not.toContain('Meet the team');

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.type(screen.getByLabelText('Search templates'), 'myth');
    expect(screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual(['Myth versus fact']);
  });

  it('a search that matches nothing offers to show them all', async () => {
    const user = userEvent.setup();
    open();
    await user.type(await screen.findByLabelText('Search templates'), 'zzzz');
    expect(screen.getByText('No templates match')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: `Show all ${TEMPLATES.length}` }));
    expect(screen.getAllByRole('article')).toHaveLength(TEMPLATES.length);
  });

  it('“Use this template” opens AI Studio in that format with the brief', async () => {
    const user = userEvent.setup();
    open();
    const card = await screen.findByRole('article', { name: 'Customer story' });
    await user.click(within(card).getByRole('button', { name: /Use this template/ }));
    const url = new URL(screen.getByTestId('where').textContent, 'https://x.test');
    expect(url.pathname).toBe('/app/studio');
    expect(url.searchParams.get('format')).toBe('ig_carousel');
    expect(url.searchParams.get('template')).toBe('proof-customer-story');
    expect(url.searchParams.get('topic')).toMatch(/short customer story carousel/);
  });

  it('roles that cannot write can browse but not start one', async () => {
    open({ ...fx.bootstrap, role: 'View-only' });
    const card = await screen.findByRole('article', { name: 'Before and after' });
    expect(within(card).getByRole('button', { name: /Use this template/ })).toBeDisabled();
  });
});
