import React from 'react';
import { Link } from 'react-router-dom';

// Shared centered card for the small auth screens (verify / reset / forgot).
export default function AuthScreen({ title, children }) {
  return (
    <div className="min-h-dvh bg-canvas text-ink font-sans grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 font-extrabold text-lg mb-8">
          <span className="grid place-items-center w-8 h-8 rounded-[9px] bg-coral text-white">✦</span> EffySocial
        </Link>
        <div className="bg-surface border border-line rounded-2xl shadow-e2 p-7">
          <h1 className="text-xl font-extrabold tracking-tight mb-1">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
