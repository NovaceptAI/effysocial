import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // The EffySocial product uses AppAuth (/api/effy). This legacy platform auth
  // exists only for the standalone demo tools, which are public — so we do NOT
  // auto-probe /api/auth/me here (it isn't proxied on this domain and 404s).
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const { ok, body } = await api.me();
    setUser(ok && body?.user ? body.user : null);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { ok, body } = await api.login(email, password);
    if (ok && body?.user) {
      setUser(body.user);
      return { ok: true };
    }
    return { ok: false, message: body?.message || 'Login failed.' };
  }, []);

  const loginWithUserid = useCallback(async (userid) => {
    const { ok, body } = await api.loginWithUserid(userid);
    if (ok && body?.user) {
      setUser(body.user);
      return { ok: true };
    }
    return { ok: false, message: body?.message || 'Login failed.' };
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    // Tools delegate auth to the platform — land on the platform login (full page
    // load, outside the /novastudy basename) so state is rebuilt from scratch.
    window.location.assign('/login');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithUserid, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
