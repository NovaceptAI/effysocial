import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Forms from './Forms';
import { toCsv, columnsFor } from '../components/FormSubmissions';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';
import fx from '../../test/fixtures/formSubmissions';

// Forms list every submission with where its lead is now (launch plan 5.7, G38; LEAD-011).
// Payloads come from the engine's test flow.
const monsoon = fx.forms.forms.find((f) => f.name === 'Monsoon enquiry');
const draft = fx.forms.forms.find((f) => f.name === 'Quote request');
const open = (handlers = {}) => {
  const api = mockApi({
    'GET /bootstrap': bootstrapFixture, 'GET /forms': fx.forms,
    [`GET /forms/${monsoon.id}/submissions`]: fx.submissions,
    [`GET /forms/${draft.id}/submissions`]: fx.emptySubmissions, ...handlers,
  });
  renderApp(<Forms />, { route: '/app/forms' });
  return api;
};
const showSubmissions = async (form) =>
  userEvent.click(await screen.findByRole('button', { name: new RegExp(`submissions to ${form.name}`) }));

describe('Form submissions', () => {
  it('lists what each person sent, newest first, with a column per field', async () => {
    open();
    await showSubmissions(monsoon);
    const panel = await screen.findByRole('region', { name: 'Submissions to Monsoon enquiry' });
    const headers = within(panel).getAllByRole('columnheader').map((h) => h.textContent);
    expect(headers).toEqual(['Submitted', 'Your name', 'Phone', 'Roof type', 'budget (removed field)', 'Came from', 'Lead']);

    const rows = within(panel).getAllByRole('row').slice(1);
    expect(rows.map((r) => within(r).getAllByRole('cell')[1].textContent)).toEqual(['Vikram Shah', 'Gone Later', 'Asha Rao']);
    expect(rows[0]).toHaveTextContent('₹50,000');
    expect(rows[0]).toHaveTextContent(/16 Sept.*pm/);   // shown in the organisation's time zone
    expect(panel).toHaveTextContent('3 submissions.');
  });

  it('shows where each came from and where its lead is now', async () => {
    open();
    await showSubmissions(monsoon);
    const panel = await screen.findByRole('region', { name: 'Submissions to Monsoon enquiry' });
    const [vikram, gone, asha] = within(panel).getAllByRole('row').slice(1);

    expect(within(vikram).getByText('facebook · monsoon')).toBeInTheDocument();
    expect(within(vikram).getByText('Meta ad')).toBeInTheDocument();
    expect(within(gone).getByText('Direct')).toBeInTheDocument();

    const won = within(asha).getByRole('link', { name: /Asha Rao/ });
    expect(won).toHaveAttribute('href', `/app/pipeline/${fx.submissions.submissions[2].lead.id}`);
    expect(won).toHaveTextContent('won');
    expect(within(gone).getByText('Lead deleted')).toBeInTheDocument();
  });

  it('says when only the latest submissions are shown', async () => {
    open({ [`GET /forms/${monsoon.id}/submissions`]: { ...fx.submissions, total: 250, shown: 3 } });
    await showSubmissions(monsoon);
    const panel = await screen.findByRole('region', { name: 'Submissions to Monsoon enquiry' });
    expect(panel).toHaveTextContent('Showing the latest 3 of 250 submissions.');
    expect(within(panel).getByRole('button', { name: /Export CSV \(latest 3\)/ })).toBeInTheDocument();
  });

  it('a form with none says how to get some', async () => {
    open();
    await showSubmissions(draft);
    expect(await screen.findByText(/Publish the form and share its link to start receiving them/)).toBeInTheDocument();
  });

  it('says why submissions could not be loaded', async () => {
    open({ [`GET /forms/${monsoon.id}/submissions`]: [500, { message: 'Forms are having a moment.' }] });
    await showSubmissions(monsoon);
    expect(await screen.findByRole('alert')).toHaveTextContent('Forms are having a moment.');
  });
});

describe('Form submissions — CSV export', () => {
  const { submissions } = fx.submissions;

  it('has a row per submission with the lead where it is now', () => {
    const lines = toCsv(monsoon, submissions, 'Asia/Kolkata').split('\r\n');
    expect(lines[0]).toBe('Submitted,Your name,Phone,Roof type,budget (removed field),UTM source,UTM medium,UTM campaign,Meta click id,Google click id,Lead,Stage,Outcome');
    expect(lines).toHaveLength(4);
    expect(lines[1]).toContain('Vikram Shah,98765 22222,Terrace,"₹50,000",facebook,,monsoon,IwAR2abc,,Vikram Shah,new,');
    expect(lines[2]).toMatch(/,Deleted,,$/);
    expect(lines[3]).toMatch(/,Asha Rao,won,purchase_completed$/);
  });

  it('never lets an answer run as a spreadsheet formula, and quotes what needs it', () => {
    const risky = [{ ...submissions[0], data: { name: '=HYPERLINK("http://x","click")', phone: '+91 98765', roof: 'Flat, "old"' } }];
    const row = toCsv(monsoon, risky, 'Asia/Kolkata').split('\r\n')[1];
    expect(row).toContain(`"'=HYPERLINK(""http://x"",""click"")"`);
    expect(row).toContain(",'+91 98765,");
    expect(row).toContain(',"Flat, ""old""",');
  });

  it('columns follow the form, with removed fields last', () => {
    expect(columnsFor(monsoon, submissions).map((c) => c.id)).toEqual(['name', 'phone', 'roof', 'budget']);
  });
});
