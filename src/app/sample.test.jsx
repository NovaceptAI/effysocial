import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { SampleBanner } from './shell/AppShell';
import ReportView from './components/ReportView';
import { buildReportPdf } from './reportPdf';
import { mockApi, bootstrapFixture } from '../test/mockApi';
import { renderApp } from '../test/render';
import fx from '../test/fixtures/reports';

// A sample business for demos says so on every screen and in every report (engine sample.py).
const sampleBootstrap = {
  ...bootstrapFixture,
  workspaces: [{ ...bootstrapFixture.workspaces[0], name: 'Sample: Monsoon Shield Waterproofing', sample: true }],
};
const sampleReport = { ...fx.report.report, business: { ...fx.report.report.business, sample: true } };

describe('Sample workspace', () => {
  it('shows a banner saying its numbers are invented and nothing is published, sent or connected', async () => {
    mockApi({ 'GET /bootstrap': sampleBootstrap });
    renderApp(<SampleBanner />);
    expect(await screen.findByRole('status', { name: 'Sample workspace' }))
      .toHaveTextContent('The numbers here are invented for a demo, and nothing in it is published, sent or connected.');
  });

  it('shows no banner in a real workspace', async () => {
    mockApi({ 'GET /bootstrap': { ...bootstrapFixture, workspaces: [{ ...bootstrapFixture.workspaces[0], sample: false }] } });
    renderApp(<><SampleBanner /><p>Loaded</p></>);
    await screen.findByText('Loaded');
    expect(screen.queryByRole('status', { name: 'Sample workspace' })).not.toBeInTheDocument();
  });

  it('marks its reports as sample data, on screen and in the PDF', async () => {
    mockApi({ 'GET /bootstrap': bootstrapFixture });
    renderApp(<ReportView report={sampleReport} />);
    expect(await screen.findByRole('note')).toHaveTextContent('Sample data. This report is from a sample business');
    const pdf = (await buildReportPdf(sampleReport)).output();
    expect(pdf).toContain('Sample data: this report is from a sample business');
    expect(pdf).toContain(' · Sample data');
    expect((await buildReportPdf(fx.report.report)).output()).not.toContain('Sample data');
  });
});
