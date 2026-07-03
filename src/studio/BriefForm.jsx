import React from 'react';
import { PLATFORMS, TONES, INDUSTRIES, LANGUAGES } from './platforms';

export default function BriefForm({ brief, onChange, onTrends, onGenerate, trendsLoading, postLoading }) {
  const platform = PLATFORMS.find((p) => p.id === brief.platform) || PLATFORMS[0];

  const set = (field) => (event) => onChange({ ...brief, [field]: event.target.value });

  const setPlatform = (id) => {
    const next = PLATFORMS.find((p) => p.id === id);
    const keepType = next.postTypes.some((t) => t.id === brief.post_type);
    onChange({ ...brief, platform: id, post_type: keepType ? brief.post_type : next.postTypes[0].id });
  };

  const busy = trendsLoading || postLoading;
  const ready = brief.brand_name.trim().length > 0;

  return (
    <form className="brief" onSubmit={(e) => e.preventDefault()}>
      <h2>Brief</h2>

      <label>
        Brand name
        <input
          value={brief.brand_name}
          onChange={set('brand_name')}
          placeholder="e.g. Axis Bank"
          maxLength={60}
        />
      </label>

      <label>
        Industry
        <select value={brief.industry} onChange={set('industry')}>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>

      <div className="brief-field">
        <span className="brief-label">Platform</span>
        <div className="brief-platforms">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`brief-platform ${brief.platform === p.id ? 'is-active' : ''}`}
              style={brief.platform === p.id ? { borderColor: p.color, color: p.color } : undefined}
              onClick={() => setPlatform(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="brief-field">
        <span className="brief-label">Post type</span>
        <div className="brief-types">
          {platform.postTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`brief-type ${brief.post_type === t.id ? 'is-active' : ''}`}
              onClick={() => onChange({ ...brief, post_type: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label>
        Topic / message <span className="brief-optional">optional</span>
        <textarea
          value={brief.topic}
          onChange={set('topic')}
          placeholder="e.g. festive-season home loan offer"
          rows={2}
          maxLength={300}
        />
      </label>

      <label>
        Audience <span className="brief-optional">optional</span>
        <input
          value={brief.audience}
          onChange={set('audience')}
          placeholder="e.g. salaried 25-40, metro cities"
          maxLength={200}
        />
      </label>

      <label>
        Competitors <span className="brief-optional">comma-separated, optional</span>
        <input
          value={brief.competitors}
          onChange={set('competitors')}
          placeholder="e.g. HDFC, ICICI, SBI"
        />
      </label>

      <div className="brief-row">
        <label>
          Tone
          <select value={brief.tone} onChange={set('tone')}>
            {TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Language
          <select value={brief.language} onChange={set('language')}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="brief-actions">
        <button
          type="button"
          className="btn-secondary"
          disabled={!ready || busy}
          onClick={onTrends}
        >
          {trendsLoading ? 'Scanning trends…' : '📈 Check trends'}
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={!ready || busy}
          onClick={onGenerate}
        >
          {postLoading ? 'Creating…' : '✨ Generate post'}
        </button>
      </div>
      {!ready && <p className="brief-hint">Enter a brand name to start.</p>}
    </form>
  );
}
