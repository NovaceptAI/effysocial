import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Reports from './Reports';
import PublicReport from '../../marketing/PublicReport';
import { buildReportPdf, reportFilename } from '../reportPdf';
import { mockApi } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/reports';

// Campaign reports as a PDF and a read-only share link (launch plan 5.10, G42; ANL-008).
// Payloads from the engine's test flow.
const monsoon = fx.campaigns.campaigns.find((c) => c.name === 'Monsoon Drive');
const diwali = fx.campaigns.campaigns.find((c) => c.name === 'Diwali Push');
const open = (handlers = {}) => {
  const api = mockApi({
    'GET /bootstrap': fx.bootstrap, 'GET /campaigns': fx.campaigns,
    [`GET /campaigns/${monsoon.id}/report`]: fx.report, [`GET /campaigns/${diwali.id}/report`]: fx.emptyReport,
    [`GET /campaigns/${monsoon.id}/report/shares`]: fx.shares, ...handlers,
  });
  renderApp(<Reports />, { route: '/app/reports' });
  return api;
};
const pickMonsoon = async () => {
  await screen.findByRole('option', { name: 'Monsoon Drive' });   // wait for the campaigns to load
  await userEvent.selectOptions(screen.getByLabelText('Campaign'), String(monsoon.id));
};

describe('Reports — the report', () => {
  it("shows the campaign's real numbers", async () => {
    open();
    await pickMonsoon();
    const results = await screen.findByRole('region', { name: 'Results' });
    expect(results).toHaveTextContent('₹12,000');
    expect(results).toHaveTextContent('of ₹40,000 budget (30%)');
    expect(results).toHaveTextContent('₹4,000');
    expect(results).toHaveTextContent('ROAS 4.17x');
    expect(screen.getByRole('region', { name: 'Top content' })).toHaveTextContent('Terrace before and after');
    expect(screen.getByRole('region', { name: 'What to do next' })).toHaveTextContent('No landing page attached');
    expect(screen.getByRole('link', { name: /Add landing page/ })).toHaveAttribute('href', '/app/landing');
  });

  it('a campaign with nothing yet shows dashes, not zeros it cannot know', async () => {
    open();
    const results = await screen.findByRole('region', { name: 'Results' });
    expect(within(results).getByText('Cost per lead').parentElement).toHaveTextContent('Cost per lead—needs spend and leads');
    expect(results).toHaveTextContent('ROAS needs spend');
    expect(results).toHaveTextContent('no published post has numbers yet');
  });
});

describe('Reports — share links', () => {
  it('creates a link, shows it once, and lists links with their state', async () => {
    const api = open({ [`POST /campaigns/${monsoon.id}/report/share`]: fx.shareCreated });
    await pickMonsoon();
    await userEvent.click(await screen.findByRole('button', { name: /Share link/ }));
    const dialog = screen.getByRole('dialog', { name: /Share “Monsoon Drive” report/ });
    await userEvent.selectOptions(within(dialog).getByLabelText('Link lasts'), '7');
    await userEvent.click(within(dialog).getByRole('button', { name: /Create link/ }));

    expect(api.callsTo(`POST /campaigns/${monsoon.id}/report/share`).map((c) => c.body)).toEqual([{ days: 7 }]);
    expect(await within(dialog).findByLabelText('Share link')).toHaveValue(`${window.location.origin}${fx.shareCreated.url}`);
    expect(within(dialog).getByText(/it can't be shown again/)).toBeInTheDocument();

    const links = within(dialog).getByRole('list', { name: 'Share links' });
    const [revoked, active] = within(links).getAllByRole('listitem');
    expect(active).toHaveTextContent('active');
    expect(active).toHaveTextContent('opened 1 time');
    expect(revoked).toHaveTextContent('revoked');
    expect(within(revoked).queryByRole('button', { name: 'End link' })).not.toBeInTheDocument();
  });

  it('ends a link', async () => {
    const active = fx.shares.shares.find((s) => s.state === 'active');
    const api = open({ [`DELETE /reports/shares/${active.id}`]: { status: 'ok', share: { ...active, state: 'revoked' } } });
    await pickMonsoon();
    await userEvent.click(await screen.findByRole('button', { name: /Share link/ }));
    const dialog = screen.getByRole('dialog', { name: /Share “Monsoon Drive” report/ });
    await userEvent.click(await within(dialog).findByRole('button', { name: 'End link' }));
    expect(api.callsTo(`DELETE /reports/shares/${active.id}`)).toHaveLength(1);
  });
});

describe('Shared report page', () => {
  const token = fx.shareCreated.url.split('/').pop();
  const openPublic = (payload) => {
    mockApi({ [`GET /public/reports/${token}`]: payload });
    render(<MemoryRouter initialEntries={[`/report/${token}`]}><Routes><Route path="/report/:token" element={<PublicReport />} /></Routes></MemoryRouter>);
  };

  it('shows the frozen report with the business name only', async () => {
    openPublic(fx.public);
    expect(await screen.findByRole('heading', { name: 'Monsoon Drive' })).toBeInTheDocument();
    expect(screen.getByText(/Figures as of .* shared .* This link ends/)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Results' })).toHaveTextContent('₹12,000');
    expect(screen.getByText(`Prepared by ${fx.public.report.business.preparedBy}`)).toBeInTheDocument();
    expect(screen.queryByText(/EffySocial/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Add landing page/ })).not.toBeInTheDocument();
  });

  it('an ended link says so', async () => {
    openPublic(fx.ended);
    expect(await screen.findByRole('alert')).toHaveTextContent('This report link has ended. Ask for a new one.');
  });

  it('a link that never existed says it is not valid', async () => {
    openPublic([404, { message: "This report link isn't valid." }]);
    expect(await screen.findByRole('alert')).toHaveTextContent('This report link isn’t valid.');
  });
});

describe('Report PDF', () => {
  it('holds the report in words and numbers, with INR instead of ₹', async () => {
    const doc = await buildReportPdf(fx.report.report, { sharedAt: fx.public.sharedAt });
    const pdf = doc.output();
    expect(pdf.startsWith('%PDF-')).toBe(true);
    for (const text of ['Campaign report: Monsoon Drive', 'INR 12,000', 'INR 4,000', 'ROAS 4.17x', 'Terrace before and after \\(reel\\)', 'No landing page attached', 'Prepared by']) {
      expect(pdf).toContain(text);
    }
    expect(pdf).not.toContain('₹');
    expect(reportFilename(fx.report.report)).toMatch(/-monsoon-drive-report\.pdf$/);
  });

  it('a campaign with nothing yet prints dashes and says why', async () => {
    const pdf = (await buildReportPdf(fx.emptyReport.report)).output();
    expect(pdf).toContain('needs spend and leads');
    expect(pdf).toContain('No published post in this campaign has numbers yet.');
    expect(pdf).not.toContain('INR 0 ');
  });
});
