import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Real EffySocial auth against the backend (/api/effy). Session is a signed
// cookie (effy_uid) set by the server; we just track the user object. Module
// data still comes from the mock layer until each module's API lands.
const Ctx = createContext(null);
const API = '/api/effy';

async function post(path, body) {
  const r = await fetch(API + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, data };
}
async function get(path) {
  const r = await fetch(API + path, { credentials: 'include' });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, data };
}

export function AppAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrap, setBootstrap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { ok, data } = await get('/bootstrap');
      if (ok && data.user) { setUser(data.user); setBootstrap(data); }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { ok, data } = await post('/auth/login', { email, password });
    if (ok && data.user) { setUser(data.user); setBootstrap(data); return { ok: true }; }
    if (data.needs_verification) return { ok: false, needsVerification: true, email: data.email };
    return { ok: false, message: data.message || 'Login failed.' };
  }, []);

  const register = useCallback(async (payload) => {
    const { ok, data } = await post('/auth/register', payload);
    if (ok && data.user) { setUser(data.user); setBootstrap(data); return { ok: true }; }
    if (ok && data.needs_verification) return { ok: false, needsVerification: true, email: data.email, devLink: data.dev_link };
    return { ok: false, message: data.message || 'Sign up failed.' };
  }, []);

  const logout = useCallback(async () => {
    await post('/auth/logout');
    setUser(null);
    setBootstrap(null);
  }, []);

  const refresh = useCallback(async () => {
    const { ok, data } = await get('/bootstrap');
    if (ok && data.user) { setUser(data.user); setBootstrap(data); }
    return ok;
  }, []);

  const verifyEmail = useCallback(async (token) => {
    const { ok, data } = await post('/auth/verify', { token });
    if (ok && data.user) { setUser(data.user); setBootstrap(data); }  // auto sign-in on verify
    return { ok, data };
  }, []);
  const resendVerification = useCallback(() => post('/auth/resend-verification'), []);
  const resendPublic = useCallback((email) => post('/auth/resend-public', { email }), []);
  const forgotPassword = useCallback((email) => post('/auth/forgot', { email }), []);
  const resetPassword = useCallback((token, password) => post('/auth/reset', { token, password }), []);

  return (
    <Ctx.Provider value={{
      user, bootstrap, loading, login, register, logout, refresh,
      verifyEmail, resendVerification, resendPublic, forgotPassword, resetPassword,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppAuth must be used inside AppAuthProvider');
  return ctx;
}
