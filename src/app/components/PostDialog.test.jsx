import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostDialog from './PostDialog';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/postActions';
import { usePosts } from '../api/hooks';
import { useWorkspace } from '../context/WorkspaceContext';

// New post and a post's details (launch plan 4.3, PUBL-017): what it saves, schedules
// and refuses, following the post's status. Payloads come from the engine's test flow.
const IMAGE = 'https://cdn.example.in/monsoon-offer.jpg';
const dialog = () => screen.findByRole('dialog');
const field = (d, name) => within(d).getByLabelText(name, { exact: false });

function open(props, handlers = {}) {
  const api = mockApi({ 'GET /bootstrap': fx.bootstrap, ...handlers });
  const onClose = vi.fn();
  renderApp(<PostDialog open onClose={onClose} {...props} />);
  return { api, onClose };
}

describe('PostDialog', () => {
  it('creates a post and schedules it in the organisation’s time', async () => {
    const user = userEvent.setup();
    const created = fx.createdApproved.post;
    const { api, onClose } = open({ initial: { date: '', time: '' } }, {
      'POST /posts': fx.createdApproved,
      [`POST /posts/${created.id}/schedule`]: fx.scheduled,
    });
    const d = await dialog();
    expect(within(d).getByRole('heading', { name: 'New post' })).toBeInTheDocument();
    expect(within(d).getByText(/Times are India time\./)).toBeInTheDocument();
    await user.type(field(d, 'Title'), 'Monsoon offer');
    await user.type(field(d, 'Caption'), 'Free roof check this week. #monsoon');
    await user.click(within(d).getByRole('button', { name: /use a link/i }));
    await user.type(within(d).getByLabelText('Media link'), IMAGE);
    await user.click(within(d).getByRole('button', { name: 'Use' }));
    expect(within(d).getByRole('img', { name: 'Chosen media' })).toHaveAttribute('src', IMAGE);
    const schedule = within(d).getByRole('button', { name: 'Schedule' });
    expect(schedule).toBeDisabled(); // needs a date and time
    fireEvent.change(field(d, 'Date'), { target: { value: created.date } });
    fireEvent.change(field(d, 'Time'), { target: { value: '10:00' } });
    await user.click(schedule);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.callsTo('POST /posts')[0].body).toEqual({
      workspace: 'ws_1', title: 'Monsoon offer', channel: 'instagram', type: 'post', caption: 'Free roof check this week. #monsoon',
      mediaUrl: IMAGE, date: created.date, time: '10:00', status: 'approved',
    });
    expect(api.callsTo(`POST /posts/${created.id}/schedule`)[0].body).toEqual({ date: created.date, time: '10:00' });
  });

  it('puts the scheduled post in the list at once, before any refetch lands', async () => {
    const user = userEvent.setup();
    const created = fx.createdApproved.post;
    let listed = 0;
    mockApi({
      'GET /bootstrap': fx.bootstrap,
      // The first list is empty; every refetch after a save is still under way.
      'GET /posts': () => (listed++ ? new Promise(() => {}) : { status: 'ok', posts: [] }),
      'POST /posts': fx.createdApproved,
      [`POST /posts/${created.id}/schedule`]: fx.scheduled,
    });
    function Listed() {
      const { workspace } = useWorkspace();
      const { data = [] } = usePosts(workspace);
      return <ul aria-label="Posts">{data.map((p) => <li key={p.id}>{p.title}: {p.status}</li>)}</ul>;
    }
    renderApp(<><PostDialog open onClose={() => {}} initial={{ date: created.date, time: '10:00' }} /><Listed /></>);
    const d = await dialog();
    await waitFor(() => expect(listed).toBe(1));
    await user.type(field(d, 'Title'), 'Monsoon offer');
    await user.click(within(d).getByRole('button', { name: 'Schedule' }));
    await waitFor(() => expect(screen.getByRole('list', { name: 'Posts' })).toHaveTextContent(`${fx.scheduled.post.title}: scheduled`));
  });

  it('keeps the post and says why when it can’t be scheduled', async () => {
    const user = userEvent.setup();
    const saved = { ...fx.createdApproved.post, mediaUrl: '', mediaKind: '' };
    const { onClose } = open({ initial: { date: fx.createdApproved.post.date, time: '09:00' } }, {
      'POST /posts': { status: 'ok', post: saved },
      [`POST /posts/${saved.id}/schedule`]: [fx.scheduleRefused.status, fx.scheduleRefused.body],
    });
    const d = await dialog();
    await user.type(field(d, 'Title'), 'Words only');
    await user.click(within(d).getByRole('button', { name: 'Schedule' }));
    expect(await within(d).findByRole('alert')).toHaveTextContent(
      'Saved as approved, not scheduled: Add an image or video to this post before publishing it to Instagram.');
    expect(onClose).not.toHaveBeenCalled();
    expect(within(d).getByText('Approved')).toBeInTheDocument(); // now editing the saved post
  });

  it('offers Reschedule and Unschedule on a scheduled post', async () => {
    const user = userEvent.setup();
    const post = fx.rescheduled.post;
    const { api } = open({ post }, { [`POST /posts/${post.id}/unschedule`]: fx.unscheduled, [`PATCH /posts/${post.id}`]: { status: 'ok', post } });
    const d = await dialog();
    expect(within(d).getByRole('heading', { name: 'Edit post' })).toBeInTheDocument();
    await waitFor(() => expect(within(d).getByRole('button', { name: 'Reschedule' })).toBeEnabled());
    await user.click(within(d).getByRole('button', { name: 'Unschedule' }));
    expect(await within(d).findByRole('status')).toHaveTextContent('Taken off the schedule. It stays approved.');
    expect(api.callsTo(`POST /posts/${post.id}/unschedule`)).toHaveLength(1);
    expect(within(d).queryByRole('button', { name: 'Unschedule' })).not.toBeInTheDocument();
  });

  it('won’t schedule a caption Instagram would refuse', async () => {
    const user = userEvent.setup();
    open({ post: fx.createdApproved.post });
    const d = await dialog();
    const caption = field(d, 'Caption');
    await user.clear(caption);
    fireEvent.change(caption, { target: { value: Array.from({ length: 31 }, (_, i) => `#t${i}`).join(' ') } });
    expect(within(d).getByRole('alert')).toHaveTextContent('Instagram allows up to 30 hashtags. This caption has 31.');
    expect(within(d).getByRole('button', { name: 'Schedule' })).toBeDisabled();
    expect(within(d).getByRole('button', { name: 'Publish now' })).toBeDisabled();
  });

  it('sends an idea for review', async () => {
    const user = userEvent.setup();
    const idea = fx.ideaPost.post;
    const { api, onClose } = open({ post: idea }, { [`PATCH /posts/${idea.id}`]: fx.ideaToReview });
    const d = await dialog();
    await user.click(within(d).getByRole('button', { name: 'Send for review' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.callsTo(`PATCH /posts/${idea.id}`)[0].body).toMatchObject({ title: idea.title, status: 'internal_review' });
    expect(api.callsTo(`POST /posts/${idea.id}/approve`)).toHaveLength(0);
  });

  it('is read-only for a client approver', async () => {
    mockApi({ 'GET /bootstrap': fx.approverBootstrap });
    renderApp(<PostDialog open onClose={() => {}} post={fx.createdApproved.post} />);
    const d = await dialog();
    expect(field(d, 'Title')).toBeDisabled();
    expect(within(d).queryByRole('button', { name: /schedule|save|publish/i })).not.toBeInTheDocument();
  });

  it('shows a published post with its Instagram link and nothing to change', async () => {
    open({ post: fx.publishedNow.post });
    const d = await dialog();
    expect(within(d).getByRole('heading', { name: fx.publishedNow.post.title })).toBeInTheDocument();
    expect(field(d, 'Caption')).toBeDisabled();
    expect(within(d).getByRole('link', { name: /view on instagram/i })).toHaveAttribute('href', fx.publishedNow.post.permalink);
    expect(within(d).queryByRole('button', { name: /schedule|save|publish/i })).not.toBeInTheDocument();
  });
});
