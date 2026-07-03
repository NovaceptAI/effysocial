import React from 'react';

export default function TrendPanel({ trends, loading, brandName, onUseAngle }) {
  if (loading) {
    return (
      <div className="panel trend-panel">
        <h2>Trend radar</h2>
        <div className="panel-loading">Scanning live signals (news, video, playbooks)…</div>
      </div>
    );
  }
  if (!trends) return null;

  const live = trends.live_sources?.length > 0;

  return (
    <div className="panel trend-panel">
      <div className="panel-head">
        <h2>Trend radar</h2>
        <span className={`trend-badge ${live ? 'is-live' : ''}`}>
          {live ? `LIVE · ${trends.live_sources.join(' + ')}` : 'playbook'}
        </span>
      </div>

      {trends.trending_now?.length > 0 && (
        <div className="trend-block">
          <h3>Trending in your industry now</h3>
          <ul>
            {trends.trending_now.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {trends.peer_activity?.length > 0 && (
        <div className="trend-block">
          <h3>What peers are doing</h3>
          <ul>
            {trends.peer_activity.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {trends.suggestions?.length > 0 && (
        <div className="trend-block">
          <h3>Suggested angles for {brandName || 'your brand'}</h3>
          <div className="trend-suggestions">
            {trends.suggestions.map((s, i) => (
              <div className="trend-card" key={i}>
                <strong>{s.angle}</strong>
                <p className="trend-why">{s.why_now}</p>
                <p className="trend-format">{s.format}</p>
                <button className="btn-primary btn-small" onClick={() => onUseAngle(s.angle)}>
                  Use this angle →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {trends.platform_tips?.length > 0 && (
        <details className="trend-tips">
          <summary>Platform best practice</summary>
          <ul>
            {trends.platform_tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
