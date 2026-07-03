import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import './photo.css';

// CEO / Leadership Photo Experience.
// The guest captures or uploads their own photo; the backend cuts them out
// (rembg) and composites them next to the CEO on a branded backdrop, returning
// a finished "photo with the CEO".

const STATE_CAPTURE = 'capture';     // taking / choosing a source photo
const STATE_PROCESSING = 'processing';
const STATE_DONE = 'done';

export default function PhotoExperience() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [state, setState] = useState(STATE_CAPTURE);
  const [result, setResult] = useState(null);   // data URL of finished image
  const [error, setError] = useState('');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
    } catch {
      setError('Camera unavailable. You can upload a photo instead.');
    }
  };

  useEffect(() => () => stopCamera(), []);

  // Send a Blob/File of the guest photo to the backend pipeline.
  const submit = async (file) => {
    stopCamera();
    setError('');
    setState(STATE_PROCESSING);
    const { ok, body } = await api.createCeoPhoto(file);
    if (ok && body?.image) {
      setResult(body.image);
      setState(STATE_DONE);
    } else {
      setError(body?.message || 'Could not create the photo. Try again.');
      setState(STATE_CAPTURE);
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob((blob) => blob && submit(new File([blob], 'capture.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.95);
  };

  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) submit(file);
    e.target.value = '';
  };

  const reset = () => {
    setResult(null);
    setError('');
    setState(STATE_CAPTURE);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = result;
    a.download = 'effysocial-photo-with-ceo.jpg';
    a.click();
  };

  return (
    <div className="px">
      <header className="px-header">
        <div className="px-brand">
          <span className="px-logo">✦</span>
          <div>
            <h1>Leadership Photo Experience</h1>
            <span className="px-tagline">Get your photo with the CEO</span>
          </div>
        </div>
        <a className="px-link" href="/">← Apps</a>
      </header>

      <main className="px-main">
        <section className="px-stage">
          {state === STATE_CAPTURE && (
            <div className="px-capture">
              <div className={`px-camera ${cameraOn ? 'is-live' : ''}`}>
                <video ref={videoRef} playsInline muted className="px-video" />
                {!cameraOn && (
                  <div className="px-camera-placeholder">
                    <span className="px-camera-icon">📷</span>
                    <p>Take your photo or upload one — we'll place you with the CEO.</p>
                  </div>
                )}
              </div>
              <div className="px-capture-actions">
                {!cameraOn ? (
                  <button className="px-btn-primary" onClick={startCamera}>Start camera</button>
                ) : (
                  <button className="px-btn-primary" onClick={capture}>📸 Take photo</button>
                )}
                <button className="px-btn-secondary" onClick={() => fileRef.current?.click()}>
                  Upload photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
              </div>
            </div>
          )}

          {state === STATE_PROCESSING && (
            <div className="px-processing">
              <span className="px-spinner" />
              <p>Placing you with the CEO…</p>
              <span className="px-processing-sub">Removing the background and composing your photo.</span>
            </div>
          )}

          {state === STATE_DONE && result && (
            <div className="px-result">
              <img src={result} alt="Your photo with the CEO" className="px-output" />
              <div className="px-result-actions">
                <button className="px-btn-primary" onClick={download}>⬇ Download</button>
                <button className="px-btn-secondary" onClick={reset}>Take another</button>
              </div>
            </div>
          )}
        </section>

        <aside className="px-side">
          <h2>How it works</h2>
          <ol className="px-steps">
            <li>Take a clear, well-lit photo of yourself (or upload one).</li>
            <li>We automatically remove the background.</li>
            <li>You get a branded photo standing with the CEO — ready to download.</li>
          </ol>
          {error && <div className="px-error">{error}</div>}
          <div className="px-note">
            <strong>Note:</strong> The CEO image is a placeholder for now — drop in
            the approved leadership cutout to go live. All processing runs on our own
            server (no third-party AI service).
          </div>
        </aside>
      </main>

      <Link to="/" className="px-back">← Apps</Link>
    </div>
  );
}
