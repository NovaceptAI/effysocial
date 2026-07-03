import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import './campaign.css';

// AI Campaign Generator for Partners — compliance-guarded first drafts.
// Generate → edit inline → export. Library + approval are intentionally
// visual placeholders in this build (scope: generate + edit + export).

const FALLBACK = {
  segments: [
    'Young investors', 'Women investors', 'Business owners', 'HNIs',
    'Retirees', 'First-time demat users', 'PMS prospects',
  ],
  products: ['Equity', 'PMS', 'Mutual Funds', 'SIP', 'Bonds', 'IPOs', 'Advisory'],
  languages: [
    { code: 'hi', name: 'Hindi' }, { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' }, { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' }, { code: 'bn', name: 'Bengali' },
    { code: 'kn', name: 'Kannada' }, { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
  ],
};

function scriptToText(script) {
  if (!script?.scenes?.length) return '';
  const head = `30-SECOND VIDEO SCRIPT (~${script.duration_seconds}s)`;
  const rows = script.scenes.map(
    (s, i) =>
      `${i + 1}. ON SCREEN: ${s.on_screen}\n   VO: ${s.voiceover}\n   OVERLAY: ${s.text_overlay}`,
  );
  return [head, ...rows].join('\n');
}

function exportText(campaign, edits) {
  const v = (k, fallback) => (edits[k] != null ? edits[k] : fallback);
  return [
    `AI CAMPAIGN DRAFT — ${campaign.segment} · ${campaign.product}`,
    'STATUS: DRAFT ONLY — pending compliance approval',
    '',
    `CAMPAIGN CONCEPT:\n${v('concept', campaign.concept)}`,
    '',
    `WHATSAPP COPY:\n${v('whatsapp', campaign.whatsapp)}`,
    '',
    v('video_script', scriptToText(campaign.video_script)),
    '',
    `POSTER HEADLINE:\n${v('poster_headline', campaign.poster_headline)}`,
    '',
    `REGIONAL VARIANT (${campaign.regional_variant.language}):`,
    `WhatsApp: ${v('rv_whatsapp', campaign.regional_variant.whatsapp)}`,
    `Poster: ${v('rv_poster', campaign.regional_variant.poster_headline)}`,
    '',
    `COMPLIANCE: ${campaign.compliance.disclaimer}`,
  ].join('\n');
}

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function EditableBlock({ label, value, onChange, rows = 4 }) {
  return (
    <div className="cg-block">
      <div className="cg-block-head">
        <h3>{label}</h3>
        <button
          type="button"
          className="cg-copy"
          onClick={() => navigator.clipboard?.writeText(value || '')}
        >
          Copy
        </button>
      </div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} />
    </div>
  );
}

export default function CampaignGenerator() {
  const [opts, setOpts] = useState(FALLBACK);
  const [segment, setSegment] = useState(FALLBACK.segments[0]);
  const [product, setProduct] = useState(FALLBACK.products[0]);
  const [language, setLanguage] = useState('hi');
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [edits, setEdits] = useState({});

  useEffect(() => {
    (async () => {
      const { ok, body } = await api.getCampaignOptions();
      if (ok && body?.segments) {
        setOpts({ segments: body.segments, products: body.products, languages: body.languages });
      }
    })();
  }, []);

  const generate = async () => {
    setError('');
    setLoading(true);
    setCampaign(null);
    setEdits({});
    const { ok, body } = await api.generateCampaign({ segment, product, language, objective });
    setLoading(false);
    if (ok && body?.campaign) {
      setCampaign(body.campaign);
    } else {
      setError(body?.message || 'Generation failed. Try again.');
    }
  };

  const set = (k) => (val) => setEdits((e) => ({ ...e, [k]: val }));
  const val = (k, fallback) => (edits[k] != null ? edits[k] : fallback);

  const flags = campaign?.compliance?.flags || [];
  const filename = useMemo(
    () => campaign && `campaign-${campaign.segment}-${campaign.product}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    [campaign],
  );

  return (
    <div className="cg">
      <header className="cg-header">
        <div className="cg-brand">
          <span className="cg-logo">✦</span>
          <div>
            <h1>AI Campaign Generator</h1>
            <span className="cg-tagline">Marketing Utility · Partner drafts</span>
          </div>
        </div>
        <a className="cg-link" href="/">← Apps</a>
      </header>

      <main className="cg-main">
        <aside className="cg-left">
          <form className="cg-form" onSubmit={(e) => { e.preventDefault(); generate(); }}>
            <h2>Campaign brief</h2>

            <label>
              Target segment
              <select value={segment} onChange={(e) => setSegment(e.target.value)}>
                {opts.segments.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label>
              Product area
              <select value={product} onChange={(e) => setProduct(e.target.value)}>
                {opts.products.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <label>
              Regional language
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {opts.languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </label>

            <label>
              Objective <span className="cg-optional">optional</span>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. promote tax-saving ELSS SIP before March deadline"
                rows={3}
                maxLength={300}
              />
            </label>

            <button type="submit" className="cg-btn-primary" disabled={loading}>
              {loading ? 'Generating…' : '✨ Generate campaign'}
            </button>
            <p className="cg-compliance-hint">
              ⚠ Outputs are <strong>draft only</strong> and must be routed through compliance
              approval before publishing.
            </p>
          </form>
        </aside>

        <section className="cg-right">
          {error && <div className="cg-error">{error}</div>}

          {loading && (
            <div className="cg-panel cg-loading">Drafting compliant campaign assets…</div>
          )}

          {!campaign && !loading && !error && (
            <div className="cg-empty">
              <div className="cg-empty-icon">🗂️</div>
              <h2>Generate a compliant campaign draft</h2>
              <p>
                Pick a segment, product and language, then <strong>Generate</strong> to draft a
                concept, WhatsApp copy, a 30-second video script, a poster headline and a
                regional-language variant — all with compliance guardrails.
              </p>
            </div>
          )}

          {campaign && (
            <div className="cg-result">
              <div className="cg-result-head">
                <div>
                  <span className="cg-status-badge">DRAFT ONLY</span>
                  <span className="cg-meta">{campaign.segment} · {campaign.product}</span>
                </div>
                <div className="cg-result-actions">
                  <button className="cg-btn-secondary" onClick={() => download(`${filename}.txt`, exportText(campaign, edits), 'text/plain')}>
                    ⬇ .txt
                  </button>
                  <button className="cg-btn-secondary" onClick={() => download(`${filename}.doc`, exportText(campaign, edits), 'application/msword')}>
                    ⬇ .doc
                  </button>
                  <button className="cg-btn-ghost" disabled title="Routes to compliance — placeholder">
                    Send for approval
                  </button>
                </div>
              </div>

              {flags.length > 0 && (
                <div className="cg-flags">
                  <strong>⚠ Compliance check flagged {flags.length} phrase(s):</strong>{' '}
                  {flags.join(', ')} — review and edit before approval.
                </div>
              )}

              <EditableBlock label="Campaign concept" value={val('concept', campaign.concept)} onChange={set('concept')} rows={3} />
              <EditableBlock label="WhatsApp copy" value={val('whatsapp', campaign.whatsapp)} onChange={set('whatsapp')} rows={5} />
              <EditableBlock
                label={`30-second video script (~${campaign.video_script.duration_seconds}s)`}
                value={val('video_script', scriptToText(campaign.video_script))}
                onChange={set('video_script')}
                rows={8}
              />
              <EditableBlock label="Poster headline" value={val('poster_headline', campaign.poster_headline)} onChange={set('poster_headline')} rows={2} />

              <div className="cg-variant">
                <h3>Regional variant · {campaign.regional_variant.language}</h3>
                <EditableBlock label="WhatsApp (regional)" value={val('rv_whatsapp', campaign.regional_variant.whatsapp)} onChange={set('rv_whatsapp')} rows={4} />
                <EditableBlock label="Poster headline (regional)" value={val('rv_poster', campaign.regional_variant.poster_headline)} onChange={set('rv_poster')} rows={2} />
              </div>

              <div className="cg-disclaimer">
                <strong>Mandatory disclaimer:</strong> {campaign.compliance.disclaimer}
              </div>
            </div>
          )}
        </section>
      </main>

      <Link to="/" className="cg-back">← Apps</Link>
    </div>
  );
}
