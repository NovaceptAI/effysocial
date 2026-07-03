import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Room, RoomEvent, Track, ConnectionState } from 'livekit-client';
import { api } from '../../api/client';
import './VoiceCaller.css';

// EffySocial AI Caller — public browser voice demo (sales / lead-qualifier
// persona). Faithful port of the NovaConnect in-house caller's browser half;
// outbound phone dialing is deliberately not exposed publicly.

const IDLE = 'idle';
const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const ENDED = 'ended';

export default function VoiceCaller() {
  const [state, setState] = useState(IDLE);
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState(null);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const roomRef = useRef(null);
  const audioElRef = useRef(null);
  const timerRef = useRef(null);

  const teardown = async () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const room = roomRef.current;
    roomRef.current = null;
    if (room) { try { await room.disconnect(); } catch { /* noop */ } }
    if (audioElRef.current) audioElRef.current.innerHTML = '';
    setAgentSpeaking(false);
    setUserSpeaking(false);
  };

  // Cleanup on unmount — don't leave a phantom LiveKit connection.
  useEffect(() => () => { teardown(); }, []);

  // Call timer.
  useEffect(() => {
    if (state === CONNECTED && !timerRef.current) {
      const t0 = Date.now();
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    } else if (state !== CONNECTED && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [state]);

  const connect = async () => {
    setError('');
    setElapsed(0);
    setState(CONNECTING);

    const { ok, body } = await api.startVoiceSession();
    if (!ok || !body?.session) {
      setError(body?.message || 'Could not start the call. Please try again.');
      setState(IDLE);
      return;
    }
    const { token, ws_url: wsUrl, job_id } = body.session;
    if (job_id) setJobId(job_id);

    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    room.on(RoomEvent.ConnectionStateChanged, (cs) => {
      if (cs === ConnectionState.Disconnected) {
        setState((prev) => (prev === CONNECTING ? IDLE : ENDED));
      }
    });
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        const el = track.attach();
        el.setAttribute('autoplay', '');
        if (audioElRef.current) {
          audioElRef.current.innerHTML = '';
          audioElRef.current.appendChild(el);
        }
      }
    });
    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach().forEach((el) => el.remove());
    });
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const local = room.localParticipant;
      setUserSpeaking(speakers.some((s) => s.identity === local.identity));
      setAgentSpeaking(speakers.some((s) => s.identity !== local.identity));
    });
    room.on(RoomEvent.ParticipantDisconnected, () => {
      teardown();
      setState(ENDED);
    });

    try {
      await room.connect(wsUrl, token);
    } catch (e) {
      setError(`Connection failed: ${e.message || e}`);
      await teardown();
      setState(IDLE);
      return;
    }
    try {
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch {
      setError('Microphone access denied. Allow microphone access and try again.');
      await teardown();
      setState(IDLE);
      return;
    }
    setState(CONNECTED);
  };

  const hangUp = async () => {
    const id = jobId;
    await Promise.all([
      id ? api.endVoiceSession(id).catch(() => null) : Promise.resolve(),
      teardown(),
    ]);
    setJobId(null);
    setState(ENDED);
  };

  const mmss = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const live = state === CONNECTED || state === CONNECTING;

  return (
    <div className="vc">
      <div className="vc-top">
        <div className="vc-eyebrow">EffySocial · AI Caller</div>
        <h1>Talk to your AI sales agent</h1>
        <p className="vc-lead">
          A live demo of EffySocial's AI voice agent — it answers, qualifies leads,
          and follows up around the clock. Press call and speak into your microphone.
        </p>
      </div>

      <div className="vc-card">
        <div
          className={`vc-orb ${live ? 'is-live' : ''} ${agentSpeaking ? 'is-agent' : ''} ${userSpeaking ? 'is-user' : ''}`}
        >
          <span className="vc-orb-core" />
        </div>

        <div className="vc-status">
          {state === IDLE && 'Ready to call'}
          {state === CONNECTING && 'Connecting…'}
          {state === CONNECTED && (agentSpeaking
            ? 'EffySocial AI is speaking…'
            : userSpeaking ? 'Listening to you…' : `On call · ${mmss(elapsed)}`)}
          {state === ENDED && 'Call ended'}
        </div>

        {error && <div className="vc-error">{error}</div>}

        <div className="vc-actions">
          {(state === IDLE || state === ENDED) && (
            <button type="button" className="vc-btn vc-btn-call" onClick={connect}>
              {state === ENDED ? 'Call again' : 'Start call'}
            </button>
          )}
          {(state === CONNECTING || state === CONNECTED) && (
            <button type="button" className="vc-btn vc-btn-end" onClick={hangUp}>
              End call
            </button>
          )}
        </div>

        <p className="vc-hint">Uses your microphone · ~4 min max · live demo</p>
        <div ref={audioElRef} className="vc-audio" aria-hidden="true" />
      </div>

      <Link to="/" className="vc-back">← Apps</Link>
    </div>
  );
}
