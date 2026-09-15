import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Approvals from './Approvals';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/postActions';

// Approvals (launch plan 4.3): bulk approve (PUBL-017), a real preview and signed
// comments (PUBL-002), and a client approver's own queue (PUBL-019). Payloads come
// from the engine's test flow.
const open = (handlers) => {
  const api = mockApi({ 'GET /campaigns': { status: 'ok', campaigns: [] }, ...handlers });
  renderApp(<Approvals />, { route: '/app/approvals' });
  return api;
};

describe('Approvals', () => {
  it('approves the selected posts together and says what it skipped', async () => {
    const user = userEvent.setup();
    let posts = fx.posts;
    const api = open({
      'GET /bootstrap': fx.bootstrap,
      'GET /posts': () => posts,
      'POST /posts/bulk-approve': () => { posts = fx.postsAfterBulk; return fx.bulkApproved; },
    });
    const bulk = await screen.findByRole('button', { name: 'Bulk approve' });
    expect(bulk).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: 'Select Team check' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Client check' }));
    await user.click(screen.getByRole('button', { name: 'Approve selected (2)' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Approved 2.');
    const [call] = api.callsTo('POST /posts/bulk-approve');
    expect(call.body.ids).toEqual(fx.posts.posts.filter((p) => ['Team check', 'Client check'].includes(p.title)).map((p) => p.id));
    await waitFor(() => expect(screen.queryByRole('checkbox', { name: 'Select Client check' })).not.toBeInTheDocument());
  });

  it('shows what is being reviewed and who said what', async () => {
    const user = userEvent.setup();
    open({ 'GET /bootstrap': fx.bootstrap, 'GET /posts': fx.posts });
    await user.click(await screen.findByRole('button', { name: /Client check/ }));
    const review = screen.getByRole('region', { name: 'Review Client check' });
    expect(within(review).getByRole('img', { name: 'Client check visual' })).toHaveAttribute('src', 'https://cdn.example.in/monsoon-offer.jpg');
    expect(within(review).getByText('Ready for the client')).toBeInTheDocument();
    expect(within(review).getByText(/Planned for .* at 12:00 \(India time\)/)).toBeInTheDocument();
    expect(within(review).getByText('Looks good to me').parentElement).toHaveTextContent('Asha Rao · Workspace admin');
    expect(within(review).queryByText(/Due in 2 days/)).not.toBeInTheDocument();
  });

  it('gives a client approver the client stage only', async () => {
    const user = userEvent.setup();
    const api = open({
      'GET /bootstrap': fx.approverBootstrap,
      'GET /posts': fx.approverPosts,
      [`POST /posts/${fx.approverApproved.post.id}/approve`]: fx.approverApproved,
    });
    await screen.findByRole('button', { name: /Client proof/ });
    expect(screen.queryByRole('button', { name: /Team proof/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Customer story/ })).not.toBeInTheDocument(); // internal review
    await user.click(screen.getByRole('button', { name: /Client proof/ }));
    await user.click(within(screen.getByRole('region', { name: 'Review Client proof' })).getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(api.callsTo(`POST /posts/${fx.approverApproved.post.id}/approve`)).toHaveLength(1));
  });

  it('shows the engine’s reason when an action is refused', async () => {
    const user = userEvent.setup();
    const team = fx.approverPosts.posts.find((p) => p.title === 'Team proof');
    open({
      'GET /bootstrap': fx.bootstrap,
      'GET /posts': fx.approverPosts,
      [`POST /posts/${team.id}/approve`]: [fx.approverRefused.status, fx.approverRefused.body],
    });
    await user.click(await screen.findByRole('button', { name: /Team proof/ }));
    await user.click(within(screen.getByRole('region', { name: 'Review Team proof' })).getByRole('button', { name: 'Approve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Client approvers review posts at the client review stage.');
  });
});
