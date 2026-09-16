import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, bootstrapFixture } from '../../test/mockApi';
import { renderApp } from '../../test/render';

// The Blog shell renders whatever articles blogPosts.js holds. It ships empty — articles
// go out under EffySocial's name, so they are the owner's to write — and says so (G49).
const shell = { 'GET /bootstrap': bootstrapFixture, 'GET /interest': { status: 'ok', features: [] } };
const openBlog = async () => {
  const { default: Blog } = await import('./Blog');
  mockApi(shell);
  renderApp(<Blog />, { route: '/app/blog' });
};

describe('Blog', () => {
  it('says coming soon while there are no articles, and takes names', async () => {
    vi.resetModules();
    await openBlog();
    expect(await screen.findByText('Coming soon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notify me when ready/i })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('renders articles once they are written, newest first, and opens one', async () => {
    const user = userEvent.setup();
    vi.resetModules();
    vi.doMock('../blogPosts', () => {
      const BLOG_POSTS = [
        { slug: 'older', title: 'Five posts a week', summary: 'A cadence that holds.', category: 'Content',
          date: '2026-08-04', readingMinutes: 6, body: ['Pick a cadence you can keep.', 'Then keep it.'] },
        { slug: 'newer', title: 'What a lead really costs', summary: 'Counting the rupees.', category: 'Growth',
          date: '2026-09-01', readingMinutes: 4, body: ['Spend divided by leads.'] },
      ];
      return { BLOG_POSTS, BLOG_CATEGORIES: ['Content', 'Growth'], newestFirst: (p = BLOG_POSTS) => [...p].sort((a, b) => b.date.localeCompare(a.date)) };
    });
    await openBlog();

    const cards = await screen.findAllByRole('article');
    expect(cards.map((c) => c.getAttribute('aria-label'))).toEqual(['What a lead really costs', 'Five posts a week']);
    expect(within(cards[0]).getByText('1 Sept 2026')).toBeInTheDocument();
    expect(screen.queryByText('Coming soon')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Content' }));
    expect(screen.getAllByRole('article').map((c) => c.getAttribute('aria-label'))).toEqual(['Five posts a week']);

    await user.click(screen.getByRole('article', { name: 'Five posts a week' }));
    expect(screen.getByRole('heading', { name: 'Five posts a week' })).toBeInTheDocument();
    expect(screen.getByText('Then keep it.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /All articles/ }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    vi.doUnmock('../blogPosts');
  });
});
