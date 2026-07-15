import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button } from '../../ui';
import { ChannelIcon } from './parts';

/* Share a finished AI video. Instagram Reels publishes for real via the
   connected account; Facebook/YouTube are honestly gated until their
   connections exist. Download always works. */
export default function ShareRow({ videoUrl, caption = '' }) {
  const { workspace } = useWorkspace();
  const [state, setState] = useState('idle');   // idle|publishing|done|error
  const [msg, setMsg] = useState('');
  const [permalink, setPermalink] = useState('');

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations', workspace?.id],
    queryFn: () => effyApi.listIntegrations(workspace.id),
    enabled: !!workspace,
    staleTime: 60_000,
  });
  const igConnected = integrations.some((i) => i.provider === 'instagram' && i.state === 'connected');

  const publishIG = async () => {
    setState('publishing'); setMsg('Uploading to Instagram…');
    try {
      const { creationId } = await effyApi.publishReelStart({ workspace: workspace.id, videoUrl, caption });
      setMsg('Instagram is processing the video…');
      for (let i = 0; i < 24; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 5000));
        // eslint-disable-next-line no-await-in-loop
        const st = await effyApi.publishReelFinish({ workspace: workspace.id, creationId });
        if (st.status === 'ok') { setState('done'); setPermalink(st.permalink || ''); setMsg(''); return; }
      }
      setState('error'); setMsg('Still processing — check your Instagram in a minute.');
    } catch (e) {
      setState('error'); setMsg(e.message || 'Publish failed.');
    }
  };

  if (!videoUrl) return null;

  return (
    <div className="mt-4 w-full rounded-xl bg-surface2/60 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-faint mr-1">Share</span>
        {igConnected ? (
          <Button size="sm" onClick={publishIG} disabled={state === 'publishing' || state === 'done'}>
            {state === 'done' ? <Check className="w-3.5 h-3.5" />
              : state === 'publishing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <ChannelIcon channel="instagram" className="w-4 h-4" />}
            {state === 'done' ? 'Published' : state === 'publishing' ? 'Publishing…' : 'Publish to Instagram'}
          </Button>
        ) : (
          <Link to="/app/integrations">
            <Button size="sm" variant="secondary"><ChannelIcon channel="instagram" className="w-4 h-4" /> Instagram — connect to enable</Button>
          </Link>
        )}
        <Link to="/app/integrations" title="Connect a Facebook Page to enable">
          <Button size="sm" variant="ghost"><ChannelIcon channel="facebook" className="w-4 h-4" /> Facebook</Button>
        </Link>
        <Link to="/app/integrations" title="YouTube upload needs Google connection — coming with Google OAuth">
          <Button size="sm" variant="ghost"><ChannelIcon channel="youtube" className="w-4 h-4" /> YouTube</Button>
        </Link>
        <div className="flex-1" />
        <a href={videoUrl} download>
          <Button size="sm" variant="secondary"><Download className="w-3.5 h-3.5" /> Download</Button>
        </a>
      </div>
      {msg && <p className="text-xs text-ink-faint mt-2">{msg}</p>}
      {state === 'done' && permalink && (
        <a href={permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-coral-ink mt-2">
          View on Instagram <ExternalLink className="w-3 h-3" />
        </a>
      )}
      {!igConnected && <p className="text-[0.7rem] text-ink-faint mt-2">Facebook needs a connected Page; YouTube upload arrives with Google sign-in. Download works everywhere.</p>}
    </div>
  );
}
