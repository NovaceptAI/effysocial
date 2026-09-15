import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import Admin from './Admin';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/scheduler';

// Platform admins can see that the minute scheduler is running and how each job's
// last run went (launch plan 4.2). Payloads come from the engine's test flow.
const usage = { status: 'ok', month: '2026-09-01', totals: { veo_video: 0, image: 0, tts_chars: 0, est_usd: 0 }, workspaces: [], platform: { users: 1, orgs: 1, workspaces: 1 }, limits: { veo_video: 20, image: 300 }, recent: [] };
const open = (scheduler) => {
  mockApi({ 'GET /bootstrap': bootstrapFixture, 'GET /admin/usage': usage, 'GET /admin/scheduler': scheduler });
  renderApp(<Admin />, { route: '/app/admin' });
  return screen.findByRole('region', { name: 'Scheduler' });
};

afterEach(() => vi.useRealTimers());

describe('Admin — scheduler', () => {
  it('shows it running, when it last ran and each job', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(new Date(fx.running.lastRunAt).getTime() + 30_000));
    const section = within(await open(fx.running));
    expect(section.getByText('Running')).toBeInTheDocument();
    expect(section.getByText(/^Last run 30 s ago\./)).toBeInTheDocument();
    const publish = section.getByText("Publish scheduled posts when they're due").closest('li');
    expect(publish).toHaveTextContent('1 runs · 0 failed');
    expect(section.getByText('Finish uploads Instagram is still processing')).toBeInTheDocument();
  });

  it('says so when a job failed or the scheduler has stopped', async () => {
    const failing = within(await open(fx.failing));
    expect(failing.getByText('Finish uploads Instagram is still processing').closest('li'))
      .toHaveTextContent('Last run failed: ConnectionError: could not reach the database');
  });

  it('flags a scheduler that has never run', async () => {
    const section = within(await open(fx.neverRun));
    expect(section.getByText('Not running')).toBeInTheDocument();
    expect(section.getByText(/^It hasn’t run yet\./)).toBeInTheDocument();
  });
});
