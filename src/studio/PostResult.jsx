import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import PlatformPreview from './PlatformPreview';
import { VIDEO_TYPES } from './platforms';

function captionText(post) {
  if (Array.isArray(post.caption)) {
    return post.caption.map((p, i) => `${i + 1}/ ${p}`).join('\n\n');
  }
  return post.caption || '';
}

function exportText(post) {
  const parts = [];
  if (post.title) parts.push(`TITLE: ${post.title}`);
  parts.push(captionText(post));
  if (post.description) parts.push(`\nDESCRIPTION:\n${post.description}`);
  if (post.hashtags?.length) parts.push('\n' + post.hashtags.map((h) => `#${h}`).join(' '));
  if (post.cta) parts.push(`\nCTA: ${post.cta}`);
  return parts.join('\n');
}

export default function PostResult({ post, loading, usedAngle, brandName }) {
  const [image, setImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setImage(null);
    setImageError('');
    setCopied(false);
  }, [post]);

  if (loading) {
    return (
      <div className="panel">
        <h2>Your post</h2>
        <div className="panel-loading">Writing platform-shaped copy…</div>
      </div>
    );
  }
  if (!post) return null;

  const isVideo = VIDEO_TYPES.has(post.post_type) && post.script;

  const makeImage = async () => {
    setImageLoading(true);
    setImageError('');
    const { ok, body } = await api.generateImage(post.image_prompt, post.aspect);
    setImageLoading(false);
    if (ok && body?.image) {
      setImage({ src: body.image, provider: body.provider });
    } else {
      setImageError(body?.message || 'Image generation unavailable.');
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(exportText(post));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setImageError('Clipboard unavailable — select and copy manually.');
    }
  };

  return (
    <div className="panel result-panel">
      <div className="panel-head">
        <h2>Your post</h2>
        <span className="result-meta">
          {post.platform} · {post.post_type}
          {usedAngle ? ` · angle: ${usedAngle}` : ''}
        </span>
      </div>

      <div className="result-grid">
        <div className="result-copy">
          {post.title && (
            <div className="copy-block">
              <h3>Title</h3>
              <p>{post.title}</p>
            </div>
          )}

          <div className="copy-block">
            <h3>{Array.isArray(post.caption) ? 'Thread' : 'Caption'}</h3>
            {Array.isArray(post.caption) ? (
              <ol className="thread-list">
                {post.caption.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            ) : (
              <p className="copy-caption">{post.caption}</p>
            )}
          </div>

          {post.hashtags?.length > 0 && (
            <div className="copy-block">
              <h3>Hashtags</h3>
              <div className="hashtags">
                {post.hashtags.map((h) => (
                  <span key={h} className="hashtag">#{h}</span>
                ))}
              </div>
            </div>
          )}

          {post.cta && (
            <div className="copy-block">
              <h3>Call to action</h3>
              <p>{post.cta}</p>
            </div>
          )}

          {post.description && (
            <div className="copy-block">
              <h3>Description</h3>
              <p className="copy-caption">{post.description}</p>
            </div>
          )}

          {isVideo && (
            <div className="copy-block">
              <h3>Script · ~{post.script.duration_seconds}s</h3>
              <table className="script-table">
                <thead>
                  <tr><th>On screen</th><th>Voiceover</th><th>Overlay</th></tr>
                </thead>
                <tbody>
                  {(post.script.scenes || []).map((s, i) => (
                    <tr key={i}>
                      <td>{s.on_screen}</td>
                      <td>{s.voiceover}</td>
                      <td>{s.text_overlay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="script-hint">
                Tip: turn this script into a talking-head reel with Avatar Studio (script →
                voiceover → lip-synced avatar).
              </p>
            </div>
          )}

          {post.alt_text && (
            <div className="copy-block">
              <h3>Alt text</h3>
              <p className="copy-alt">{post.alt_text}</p>
            </div>
          )}
        </div>

        <div className="result-visual">
          <PlatformPreview post={post} image={image?.src} brandName={brandName} />

          <div className="visual-actions">
            <button className="btn-secondary" onClick={makeImage} disabled={imageLoading}>
              {imageLoading ? 'Painting…' : image ? '🎨 Regenerate visual' : '🎨 Generate visual'}
            </button>
            {image && (
              <a className="btn-secondary" href={image.src} download={`${post.platform}-${post.post_type}.jpg`}>
                ⬇ Download image
              </a>
            )}
            <button className="btn-primary" onClick={copyAll}>
              {copied ? '✓ Copied' : '📋 Copy text'}
            </button>
          </div>
          {image?.provider && <p className="visual-provider">visual by {image.provider}</p>}
          {imageError && <p className="visual-error">{imageError}</p>}
        </div>
      </div>
    </div>
  );
}
