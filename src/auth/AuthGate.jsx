import React from 'react';
import { useAuth } from './AuthContext';

// novastudy no longer hosts its own login. When there's no session we bounce to
// the NovaceptAI platform login at the domain root (/login), outside this SPA's
// /novastudy basename — so we use a full-page redirect rather than react-router.
export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: 40, color: '#9aa3b2', fontFamily: 'system-ui, sans-serif' }}>
        Checking session…
      </div>
    );
  }

  if (!user) {
    const from = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?from=${from}`);
    return null;
  }

  return children;
}
