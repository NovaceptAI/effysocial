import React from 'react';

function initials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function handle(name) {
  return '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
}

function Visual({ image, aspect, label }) {
  const ratioMap = { '9:16': '9 / 16', '16:9': '16 / 9', '4:5': '4 / 5', '1.91:1': '1.91 / 1' };
  const first = (aspect || '1:1').split(' or ')[0].trim();
  const ratio = ratioMap[first] || '1 / 1';
  return image ? (
    <img className="pv-image" style={{ aspectRatio: ratio }} src={image} alt="Generated visual" />
  ) : (
    <div className="pv-image pv-placeholder" style={{ aspectRatio: ratio }}>
      <span>{label || 'Generate a visual →'}</span>
    </div>
  );
}

export default function PlatformPreview({ post, image, brandName }) {
  const caption = Array.isArray(post.caption) ? post.caption[0] : post.caption;

  if (post.platform === 'twitter') {
    return (
      <div className="pv pv-x">
        <div className="pv-head">
          <span className="pv-avatar" style={{ background: '#0f1419' }}>{initials(brandName)}</span>
          <div>
            <strong>{brandName}</strong>
            <span className="pv-handle">{handle(brandName)}</span>
          </div>
        </div>
        <p className="pv-text">{caption}</p>
        <Visual image={image} aspect={post.aspect} />
        <div className="pv-bar">💬 · 🔁 · ♥ · 👁</div>
      </div>
    );
  }

  if (post.platform === 'youtube') {
    return (
      <div className="pv pv-yt">
        <Visual image={image} aspect={post.aspect} label="Thumbnail" />
        <div className="pv-yt-meta">
          <span className="pv-avatar" style={{ background: '#FF0000' }}>{initials(brandName)}</span>
          <div>
            <strong>{post.title || caption?.slice(0, 80)}</strong>
            <span className="pv-handle">{brandName} · just now</span>
          </div>
        </div>
      </div>
    );
  }

  if (post.platform === 'facebook') {
    return (
      <div className="pv pv-fb">
        <div className="pv-head">
          <span className="pv-avatar" style={{ background: '#1877F2' }}>{initials(brandName)}</span>
          <div>
            <strong>{brandName}</strong>
            <span className="pv-handle">Sponsored · 🌐</span>
          </div>
        </div>
        <p className="pv-text">{caption}</p>
        <Visual image={image} aspect={post.aspect} />
        <div className="pv-bar">👍 Like · 💬 Comment · ↗ Share</div>
      </div>
    );
  }

  // Instagram default
  return (
    <div className="pv pv-ig">
      <div className="pv-head">
        <span className="pv-avatar pv-avatar-ig">{initials(brandName)}</span>
        <strong>{handle(brandName).slice(1)}</strong>
      </div>
      <Visual image={image} aspect={post.aspect} />
      <div className="pv-bar">♥ · 💬 · ✈ &nbsp;&nbsp;&nbsp; 🔖</div>
      <p className="pv-text">
        <strong>{handle(brandName).slice(1)}</strong> {caption}
      </p>
      {post.hashtags?.length > 0 && (
        <p className="pv-tags">{post.hashtags.map((h) => `#${h}`).join(' ')}</p>
      )}
    </div>
  );
}
