import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import './LipSync.css';

const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov';
const AUDIO_ACCEPT = 'audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a';
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_AUDIO_BYTES = 50 * 1024 * 1024;
const POLL_INTERVAL_MS = 3000;

const STATE_IDLE = 'idle';
const STATE_UPLOADING = 'uploading';
const STATE_PROCESSING = 'processing';
const STATE_COMPLETED = 'completed';
const STATE_FAILED = 'failed';
const STATE_DRY_RUN_OK = 'dry_run_ok';

function formatBytes(b) {
  if (b == null) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FilePicker({ label, hint, accept, file, onPick, onClear, maxBytes, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handle = (f) => {
    if (!f) return;
    if (f.size > maxBytes) {
      alert(`File too large (${formatBytes(f.size)}). Max ${formatBytes(maxBytes)}.`);
      return;
    }
    onPick(f);
  };

  return (
    <div
      className={`ns-ls-drop ${dragOver ? 'is-over' : ''} ${file ? 'has-file' : ''} ${disabled ? 'is-disabled' : ''}`}
      onDragOver={(e) => { if (!disabled) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handle(e.dataTransfer.files?.[0]);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handle(e.target.files?.[0])}
        disabled={disabled}
      />
      {file ? (
        <div className="ns-ls-file">
          <div className="ns-ls-file-label">{label}</div>
          <div className="ns-ls-file-name">{file.name}</div>
          <div className="ns-ls-file-meta">{formatBytes(file.size)}</div>
          {!disabled && (
            <button
              type="button"
              className="ns-ls-file-clear"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
            >
              Replace
            </button>
          )}
        </div>
      ) : (
        <div className="ns-ls-drop-prompt">
          <div className="ns-ls-drop-label">{label}</div>
          <strong>Drop a file here</strong>
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
}

const MODE_MANUAL = 'manual';
const MODE_AUTODUB = 'auto_dub';

export default function LipSync() {
  const [video, setVideo] = useState(null);
  const [audio, setAudio] = useState(null);
  const [mode, setMode] = useState(MODE_MANUAL);
  const [dubOptions, setDubOptions] = useState(null);   // { languages, voices, default_voice_id }
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [voiceId, setVoiceId] = useState(null);
  const [state, setState] = useState(STATE_IDLE);
  const [jobId, setJobId] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [dryRun, setDryRun] = useState(true);
  const [dryRunResult, setDryRunResult] = useState(null);
  const startedAtRef = useRef(null);
  const pollRef = useRef(null);
  const tickRef = useRef(null);

  // Load language + voice options the first time the page mounts.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { ok, body } = await api.getDubOptions();
      if (!ok || cancelled) return;
      setDubOptions(body);
      if (body?.default_voice_id) setVoiceId(body.default_voice_id);
    })();
    return () => { cancelled = true; };
  }, []);

  // Poll status while processing.
  useEffect(() => {
    if (state !== STATE_PROCESSING || !jobId) return;
    let cancelled = false;
    const tick = async () => {
      const { ok, body } = await api.getLipSyncStatus(jobId);
      if (cancelled) return;
      if (!ok) {
        setError(body?.message || 'Status check failed.');
        setState(STATE_FAILED);
        return;
      }
      const job = body?.job;
      const s = job?.job_status;
      if (s === 'completed') {
        setOutputUrl(job.output_url);
        setState(STATE_COMPLETED);
      } else if (s === 'failed' || s === 'rejected' || s === 'canceled') {
        setError(job?.error || `Job ${s}.`);
        setState(STATE_FAILED);
      }
    };
    pollRef.current = setInterval(tick, POLL_INTERVAL_MS);
    tick();
    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [state, jobId]);

  // Elapsed timer while uploading or processing.
  useEffect(() => {
    if (state !== STATE_UPLOADING && state !== STATE_PROCESSING) {
      clearInterval(tickRef.current);
      return;
    }
    if (startedAtRef.current == null) startedAtRef.current = Date.now();
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [state]);

  const canSubmit = video && (
    mode === MODE_MANUAL ? !!audio : (!!targetLanguage && !!voiceId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setOutputUrl(null);
    setJobId(null);
    setDryRunResult(null);
    setElapsed(0);
    startedAtRef.current = Date.now();
    setState(STATE_UPLOADING);

    const { ok, body } = await api.submitLipSync(video, audio, {
      dryRun,
      mode,
      targetLanguage,
      voiceId,
    });
    if (!ok) {
      setError(body?.message || 'Submission failed.');
      setState(STATE_FAILED);
      return;
    }
    if (body.dry_run) {
      setDryRunResult(body);
      setState(body.all_ok ? STATE_DRY_RUN_OK : STATE_FAILED);
      if (!body.all_ok) {
        setError('One or more pre-flight checks failed. See details below.');
      }
      return;
    }
    setJobId(body.job_id);
    setState(STATE_PROCESSING);
  };

  const handleReset = () => {
    setVideo(null);
    setAudio(null);
    setJobId(null);
    setOutputUrl(null);
    setError('');
    setElapsed(0);
    setDryRunResult(null);
    startedAtRef.current = null;
    setState(STATE_IDLE);
  };

  const isBusy = state === STATE_UPLOADING || state === STATE_PROCESSING;

  return (
    <div className="ns-lipsync">
      <div className="ns-ls-top">
        <div className="ns-ls-eyebrow">EffySocial · Lip Sync</div>
        <h1>Multilingual avatar &amp; spokesperson studio</h1>
        <p className="ns-ls-lead">
          Turn a talking-head video into a perfectly lip-synced spokesperson — a
          CEO greeting in another language, a localized marketing clip, or a
          personalized message. Upload a video plus new audio (or auto-dub it),
          and we'll re-sync the lip movement to the new track.
        </p>
      </div>

      <form className="ns-ls-card" onSubmit={handleSubmit}>
        <div className="ns-ls-mode" role="tablist" aria-label="Audio source">
          <button
            type="button"
            role="tab"
            aria-selected={mode === MODE_MANUAL}
            className={`ns-ls-mode-btn ${mode === MODE_MANUAL ? 'is-active' : ''}`}
            onClick={() => !isBusy && setMode(MODE_MANUAL)}
            disabled={isBusy}
          >
            Bring your own audio
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === MODE_AUTODUB}
            className={`ns-ls-mode-btn ${mode === MODE_AUTODUB ? 'is-active' : ''}`}
            onClick={() => !isBusy && setMode(MODE_AUTODUB)}
            disabled={isBusy}
          >
            Auto-dub to another language
          </button>
        </div>

        <div className="ns-ls-grid">
          <FilePicker
            label="Video"
            hint="MP4, WebM, or MOV up to 100 MB"
            accept={VIDEO_ACCEPT}
            file={video}
            onPick={setVideo}
            onClear={() => setVideo(null)}
            maxBytes={MAX_VIDEO_BYTES}
            disabled={isBusy}
          />
          {mode === MODE_MANUAL ? (
            <FilePicker
              label="Audio"
              hint="MP3, WAV, or M4A up to 50 MB"
              accept={AUDIO_ACCEPT}
              file={audio}
              onPick={setAudio}
              onClear={() => setAudio(null)}
              maxBytes={MAX_AUDIO_BYTES}
              disabled={isBusy}
            />
          ) : (
            <div className="ns-ls-drop has-file">
              <div className="ns-ls-file">
                <div className="ns-ls-file-label">Auto-dub</div>
                <label className="ns-ls-field">
                  <span className="ns-ls-field-label">Target language</span>
                  <select
                    className="ns-ls-select"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    disabled={isBusy || !dubOptions}
                  >
                    {(dubOptions?.languages || []).map((l) => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </label>
                <label className="ns-ls-field">
                  <span className="ns-ls-field-label">Voice</span>
                  <select
                    className="ns-ls-select"
                    value={voiceId || ''}
                    onChange={(e) => setVoiceId(e.target.value)}
                    disabled={isBusy || !dubOptions}
                  >
                    {(dubOptions?.voices || []).map((v) => (
                      <option key={v.id} value={v.id}>{v.name} ({v.gender})</option>
                    ))}
                  </select>
                </label>
                <div className="ns-ls-file-meta">
                  We'll transcribe with Groq, translate, and synthesize via ElevenLabs.
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="ns-ls-error">{error}</div>}

        <label className="ns-ls-checkbox">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            disabled={isBusy}
          />
          <span>
            <strong>Dry run</strong> — upload + verify presigned URLs but skip the
            Sync Labs call (no credit used)
          </span>
        </label>

        <div className="ns-ls-actions">
          {state === STATE_IDLE && (
            <button type="submit" className="ns-ls-btn is-primary" disabled={!canSubmit}>
              {dryRun ? 'Run pre-flight check' : (mode === MODE_AUTODUB ? 'Auto-dub and lip sync' : 'Generate lip sync')}
            </button>
          )}
          {state === STATE_UPLOADING && (
            <button type="button" className="ns-ls-btn is-primary" disabled>
              Uploading… ({elapsed}s)
            </button>
          )}
          {state === STATE_PROCESSING && (
            <>
              <span className="ns-ls-status">
                <span className="ns-ls-spinner" /> Processing on Sync Labs… ({elapsed}s)
              </span>
              {jobId && <span className="ns-ls-jobid">job: {jobId}</span>}
            </>
          )}
          {(state === STATE_COMPLETED || state === STATE_FAILED || state === STATE_DRY_RUN_OK) && (
            <button type="button" className="ns-ls-btn is-secondary" onClick={handleReset}>
              Start over
            </button>
          )}
        </div>
      </form>

      {dryRunResult && (
        <section className="ns-ls-card ns-ls-result">
          <header className="ns-ls-result-head">
            <div>
              <div className="ns-ls-subtle">Pre-flight check</div>
              <h2>{dryRunResult.all_ok ? '✓ All systems go' : '✗ Issues detected'}</h2>
            </div>
          </header>
          <dl className="ns-ls-checks">
            <div>
              <dt>Sync Labs API key</dt>
              <dd className={dryRunResult.api_key_configured ? 'is-ok' : 'is-bad'}>
                {dryRunResult.api_key_configured ? 'configured' : (dryRunResult.api_key_error || 'missing')}
              </dd>
            </div>
            {['video', 'audio'].map((k) => {
              const c = dryRunResult.url_checks?.[k] || {};
              return (
                <div key={k}>
                  <dt>{k} presigned URL</dt>
                  <dd className={c.ok ? 'is-ok' : 'is-bad'}>
                    {c.ok
                      ? `HTTP ${c.status_code} · ${c.content_type || '?'} · ${c.content_length || '?'} bytes`
                      : (c.error || `HTTP ${c.status_code}`)}
                  </dd>
                </div>
              );
            })}
          </dl>
          <details className="ns-ls-urls">
            <summary>Show presigned URLs</summary>
            <pre>video: {dryRunResult.video_url}{'\n\n'}audio: {dryRunResult.audio_url}</pre>
          </details>
          <p className="ns-ls-note">
            Next step would have been a POST to <code>{dryRunResult.would_post_to}</code>.
            Uncheck "Dry run" above and resubmit to actually generate the video.
          </p>
        </section>
      )}

      {state === STATE_COMPLETED && outputUrl && (
        <section className="ns-ls-card ns-ls-result">
          <header className="ns-ls-result-head">
            <div>
              <div className="ns-ls-subtle">Result</div>
              <h2>Lip-sync ready</h2>
            </div>
            <a href={outputUrl} target="_blank" rel="noreferrer" className="ns-ls-download" download>
              Download mp4
            </a>
          </header>
          <video src={outputUrl} controls playsInline className="ns-ls-video" />
        </section>
      )}

      <Link to="/" className="ns-ls-back">← Apps</Link>
    </div>
  );
}
