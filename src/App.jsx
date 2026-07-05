import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { AppAuthProvider, useAppAuth } from './app/context/AppAuth';
import Landing from './marketing/Landing';
import Login from './marketing/Login';
import Onboarding from './marketing/Onboarding';
import Verify from './marketing/Verify';
import Forgot from './marketing/Forgot';
import Reset from './marketing/Reset';
import PublicForm from './marketing/PublicForm';
import PublicLanding from './marketing/PublicLanding';
import PublicBio from './marketing/PublicBio';
import Hub from './Hub';

// The full product app shell (Phase 0+). Code-split so the marketing site stays light.
const AppRoot = lazy(() => import('./app/AppRoot'));
import Studio from './studio/Studio';
import LipSync from './modules/lipsync/LipSync';
import VoiceCaller from './modules/caller/VoiceCaller';
import CampaignGenerator from './modules/campaign/CampaignGenerator';
import PhotoExperience from './modules/photo/PhotoExperience';
import StyleGuide from './styleguide/StyleGuide';

// Gate the product: unauthenticated visitors are sent to the login screen.
// Waits for the async session check so we don't flash a redirect on refresh.
function RequireAuth({ children }) {
  const { user, loading } = useAppAuth();
  if (loading) return <div style={{ padding: 40, fontFamily: 'system-ui', color: '#6f645c' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// EffySocial — `/` marketing landing → /login → /app product shell.
// The standalone demo tools live under /tools (and their own routes).
export default function App() {
  return (
    <AuthProvider>
      <AppAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/f/:slug" element={<PublicForm />} />
            <Route path="/p/:slug" element={<PublicLanding />} />
            <Route path="/b/:slug" element={<PublicBio />} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

            {/* Authenticated product */}
            <Route
              path="/app/*"
              element={
                <RequireAuth>
                  <Suspense fallback={<div style={{ padding: 40, fontFamily: 'system-ui' }}>Loading EffySocial…</div>}>
                    <AppRoot />
                  </Suspense>
                </RequireAuth>
              }
            />

            {/* Standalone demo tools (kept live) */}
            <Route path="/tools" element={<Hub />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/lipsync" element={<LipSync />} />
            <Route path="/caller" element={<VoiceCaller />} />
            <Route path="/campaign" element={<CampaignGenerator />} />
            <Route path="/photo" element={<PhotoExperience />} />
            <Route path="/style-guide" element={<StyleGuide />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppAuthProvider>
    </AuthProvider>
  );
}
