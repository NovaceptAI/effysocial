import React, { useCallback, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import { SITE_NAME, SHOW_PLATFORM_CHROME, PLATFORM_NAME, CONSOLE_URL, ENGINES_TAG } from '../config/brand';
import BriefForm from './BriefForm';
import TrendPanel from './TrendPanel';
import PostResult from './PostResult';
import './studio.css';

const INITIAL_BRIEF = {
  brand_name: '',
  industry: 'Banking',
  platform: 'instagram',
  post_type: 'post',
  topic: '',
  audience: '',
  tone: 'professional yet friendly',
  competitors: '',
  language: 'English',
};

function toPayload(brief, angle) {
  return {
    ...brief,
    competitors: brief.competitors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    ...(angle ? { angle } : {}),
  };
}

export default function Studio() {
  const { user, logout } = useAuth();
  const [brief, setBrief] = useState(INITIAL_BRIEF);
  const [trends, setTrends] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const [usedAngle, setUsedAngle] = useState('');
  const [error, setError] = useState('');

  const loadTrends = useCallback(async () => {
    setError('');
    setTrendsLoading(true);
    setTrends(null);
    const { ok, body } = await api.getTrends(toPayload(brief));
    setTrendsLoading(false);
    if (ok && body?.trends) {
      setTrends(body.trends);
    } else {
      setError(body?.message || 'Could not load trends. Try again.');
    }
  }, [brief]);

  const generate = useCallback(
    async (angle = '') => {
      setError('');
      setPostLoading(true);
      setPost(null);
      setUsedAngle(angle);
      const { ok, body } = await api.generatePost(toPayload(brief, angle));
      setPostLoading(false);
      if (ok && body?.post) {
        setPost(body.post);
      } else {
        setError(body?.message || 'Generation failed. Try again.');
      }
    },
    [brief]
  );

  return (
    <div className="studio">
      <header className="studio-header">
        <div className="studio-brand">
          <span className="studio-logo">✦</span>
          <div>
            <h1>{SITE_NAME}</h1>
            <span className="studio-tagline">AI Social Post Studio</span>
          </div>
          {SHOW_PLATFORM_CHROME && <span className="studio-engines">{ENGINES_TAG}</span>}
        </div>
        <div className="studio-user">
          <a className="studio-console-link" href="/">← Apps</a>
          {SHOW_PLATFORM_CHROME && (
            <>
              <a className="studio-console-link" href={CONSOLE_URL}>Console</a>
              <span className="studio-email">{user?.email || user?.userid}</span>
              <button className="studio-logout" onClick={logout}>Log out</button>
            </>
          )}
        </div>
      </header>

      <main className="studio-main">
        <aside className="studio-left">
          <BriefForm
            brief={brief}
            onChange={setBrief}
            onTrends={loadTrends}
            onGenerate={() => generate('')}
            trendsLoading={trendsLoading}
            postLoading={postLoading}
          />
        </aside>

        <section className="studio-right">
          {error && <div className="studio-error">{error}</div>}

          <TrendPanel
            trends={trends}
            loading={trendsLoading}
            brandName={brief.brand_name}
            onUseAngle={(angle) => generate(angle)}
          />

          <PostResult
            post={post}
            loading={postLoading}
            usedAngle={usedAngle}
            brandName={brief.brand_name || 'Your Brand'}
          />

          {!trends && !post && !trendsLoading && !postLoading && !error && (
            <div className="studio-empty">
              <div className="studio-empty-icon">🪄</div>
              <h2>Create a trend-aware post</h2>
              <p>
                Fill the brief, then <strong>Check trends</strong> to see what's working in your
                industry right now — or jump straight to <strong>Generate</strong>.
              </p>
            </div>
          )}
        </section>
      </main>

      {SHOW_PLATFORM_CHROME && (
        <footer className="studio-footer">
          {SITE_NAME} is a {PLATFORM_NAME} NovaConnect product.
        </footer>
      )}
    </div>
  );
}
