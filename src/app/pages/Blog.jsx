import React, { useState } from 'react';
import { BookOpen, ArrowLeft, Clock } from 'lucide-react';
import { PageHeader, EmptyState, Card, Badge, Button } from '../../ui';
import { cn } from '../../lib/cn';
import NotifyMe from '../components/NotifyMe';
import { BLOG_POSTS, BLOG_CATEGORIES, newestFirst } from '../blogPosts';

// The marketing and education blog. Articles live in blogPosts.js because they go out
// under EffySocial's name — the owner writes and approves them. Until one is added the
// page says so honestly and people can ask to hear when it lands (G49).
const readable = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Blog() {
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(null);
  const posts = newestFirst(BLOG_POSTS).filter((p) => !category || p.category === category);
  const article = open && BLOG_POSTS.find((p) => p.slug === open);

  if (article) {
    return (
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => setOpen(null)}>
          <ArrowLeft className="w-3.5 h-3.5" /> All articles
        </Button>
        <PageHeader title={article.title} subtitle={`${readable(article.date)} · ${article.readingMinutes} min read`} />
        <article className="space-y-4 text-[0.95rem] text-ink-soft leading-relaxed">
          {article.body.map((para, i) => <p key={i}>{para}</p>)}
        </article>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Blog" subtitle="Playbooks, growth guides and product stories for Indian SMBs." />

      {posts.length === 0 && !category ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="Coming soon"
          body="We're putting together practical guides on content, ads and growth."
          action={<NotifyMe feature="blog" />}
        />
      ) : (
        <>
          {BLOG_CATEGORIES.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {['All', ...BLOG_CATEGORIES].map((c) => {
                const on = c === 'All' ? !category : category === c;
                return (
                  <button key={c} onClick={() => setCategory(c === 'All' ? '' : c)} aria-pressed={on}
                    className={cn('px-4 py-1.5 rounded-full text-sm font-semibold transition',
                      on ? 'bg-rail-active text-rail-active-ink' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                    {c}
                  </button>
                );
              })}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Card key={p.slug} className="p-5 flex flex-col text-left cursor-pointer hover:shadow-e3 transition-shadow"
                role="article" aria-label={p.title} onClick={() => setOpen(p.slug)}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge tone="new">{p.category}</Badge>
                  <span className="inline-flex items-center gap-1 text-[0.7rem] text-ink-faint"><Clock className="w-3 h-3" /> {p.readingMinutes} min</span>
                </div>
                <h2 className="font-display text-lg font-semibold tracking-tight">{p.title}</h2>
                <p className="text-sm text-ink-soft mt-2 flex-1">{p.summary}</p>
                <span className="text-[0.7rem] text-ink-faint mt-3">{readable(p.date)}</span>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
