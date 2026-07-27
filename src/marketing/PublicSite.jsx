import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { effyApi } from '../app/api/effyApi';
import SiteRenderer from './SiteRenderer';

// Public hosted multi-page brand site (/s/:slug and /s/:slug/:pageKey) — no auth.
export default function PublicSite() {
  const { slug, pageKey } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let alive = true;
    effyApi.publicSite(slug)
      .then((s) => { if (alive) { setSite(s); setState('ok'); document.title = s.name?.replace(/ — website$/, '') || 'Website'; } })
      .catch(() => alive && setState('missing'));
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => { window.scrollTo(0, 0); }, [pageKey]);

  if (state === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0c0e', color: '#fff' }}><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }
  if (state === 'missing' || !site) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0c0e', color: '#9aa0a6', fontFamily: 'system-ui' }}>This site isn’t available.</div>;
  }

  const pages = site.pages || [];
  const active = pages.find((p) => p.key === pageKey)?.key || pages[0]?.key;
  const onNav = (key) => navigate(key === pages[0]?.key ? `/s/${slug}` : `/s/${slug}/${key}`);

  return <SiteRenderer site={site} activePage={active} onNav={onNav} />;
}
