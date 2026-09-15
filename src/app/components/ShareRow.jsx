import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Check, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { followPublish, instagramCaptionProblem } from '../publishing';
import { Button } from '../../ui';
import { ChannelIcon } from './parts';

/* Share a finished image or video. Instagram publishes for real through the
   connected account, and every attempt becomes a post on Published with its
   outcome; Facebook/YouTube are honestly gated until their connections exist.
   Download always works. */
export default function ShareRow({ videoUrl, imageUrl, caption = '', title }) {
  const { workspace, canWrite } = useWorkspace();
  const queryClient = useQueryClient();
  const [state, setState] = useState('idle');   // idle|publishing|waiting|done|error
  const [msg, setMsg] = useState('');
  const [permalink, setPermalink] = useState('');
  const media = videoUrl || imageUrl;
  const kind = videoUrl ? 'video' : 'image';

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations', workspace?.id],
    queryFn: () => effyApi.listIntegrations(workspace.id),
    enabled: !!workspace,
    staleTime: 60_000,
  });
  const instagram = integrations.find((i) => i.provider === 'instagram');
  const igConnected = instagram?.state === 'connected';
  const igExpired = instagram?.state === 'expired';
  const captionProblem = instagramCaptionProblem(caption);

  // New media can be published again (a re-signed link to the same file isn't new).
  const mediaFile = (media || '').split('?')[0];
  useEffect(() => { setState('idle'); setMsg(''); setPermalink(''); }, [mediaFile]);

  const settle = (post) => {
    queryClient.invalidateQueries({ queryKey: ['posts', workspace.id] });
    if (post?.status === 'published') {
      setState('done'); setPermalink(post.permalink || ''); setMsg('');
    } else if (post?.status === 'failed') {
      setState('error'); setMsg(post.error || 'Publishing failed.');
    } else {
      // Still processing after every check: publishing again would post it twice.
      setState('waiting'); setMsg('Instagram is still processing this. It will show on Published once it’s live.');
    }
  };

  const publishIG = async () => {
    setState('publishing'); setPermalink('');
    setMsg(kind === 'video' ? 'Uploading to Instagram…' : 'Publishing to Instagram…');
    try {
      const started = kind === 'video'
        ? await effyApi.publishReelStart({ workspace: workspace.id, videoUrl, caption, title })
        : await effyApi.publishInstagram(workspace.id, imageUrl, caption, { title });
      if (started.post?.status === 'publishing') setMsg(`Instagram is processing the ${kind}…`);
      settle(await followPublish(started.post, effyApi.checkPublish));
    } catch (e) {
      if (e.data?.post) settle(e.data.post);
      else { setState('error'); setMsg(e.message || 'Publish failed.'); }
    }
  };

  if (!media) return null;

  return (
    <div className="mt-4 w-full rounded-xl bg-surface2/60 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-faint mr-1">Share</span>
        {igConnected ? (
          <Button size="sm" onClick={publishIG} disabled={!canWrite || !!captionProblem || ['publishing', 'waiting', 'done'].includes(state)}>
            {state === 'done' ? <Check className="w-3.5 h-3.5" />
              : ['publishing', 'waiting'].includes(state) ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <ChannelIcon channel="instagram" className="w-4 h-4" />}
            {{ done: 'Published', publishing: 'Publishing…', waiting: 'Processing on Instagram', error: 'Try again' }[state] || 'Publish to Instagram'}
          </Button>
        ) : (
          <Link to="/app/integrations">
            <Button size="sm" variant="secondary">
              <ChannelIcon channel="instagram" className="w-4 h-4" /> {igExpired ? 'Instagram — reconnect to publish' : 'Instagram — connect to enable'}
            </Button>
          </Link>
        )}
        <Link to="/app/integrations" title="Connect a Facebook Page to enable">
          <Button size="sm" variant="ghost"><ChannelIcon channel="facebook" className="w-4 h-4" /> Facebook</Button>
        </Link>
        <Link to="/app/integrations" title="YouTube upload needs Google connection — coming with Google OAuth">
          <Button size="sm" variant="ghost"><ChannelIcon channel="youtube" className="w-4 h-4" /> YouTube</Button>
        </Link>
        <div className="flex-1" />
        <a href={media} download>
          <Button size="sm" variant="secondary"><Download className="w-3.5 h-3.5" /> Download</Button>
        </a>
      </div>
      {igConnected && captionProblem && state !== 'done' && (
        <p role="alert" className="flex items-start gap-1.5 text-xs text-error mt-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" /> {captionProblem} Edit the caption to publish.
        </p>
      )}
      {msg && <p role={state === 'error' ? 'alert' : 'status'} className={state === 'error' ? 'text-xs text-error mt-2' : 'text-xs text-ink-faint mt-2'}>{msg}</p>}
      {state === 'done' && (
        <p role="status" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft mt-2">
          Published to Instagram.
          {permalink && (
            <a href={permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-coral-ink">
              View on Instagram <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link to="/app/published" className="font-bold text-coral-ink">See it on Published</Link>
        </p>
      )}
      {!igConnected && <p className="text-[0.7rem] text-ink-faint mt-2">Facebook needs a connected Page; YouTube upload arrives with Google sign-in. Download works everywhere.</p>}
    </div>
  );
}
