import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { AppAuthProvider, useAppAuth } from './app/context/AppAuth';
import Landing from './marketing/Landing';
import Login from './marketing/Login';
import Onboarding from './marketing/Onboarding';
import Join from './marketing/Join';
import Verify from './marketing/Verify';
import Forgot from './marketing/Forgot';
import Reset from './marketing/Reset';
import PublicForm from './marketing/PublicForm';
import Pricing from './marketing/Pricing';
import Privacy from './marketing/Privacy';
import Terms from './marketing/Terms';
import PublicLanding from './marketing/PublicLanding';
import PublicSite from './marketing/PublicSite';
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
import BrightStyleGuide from './marketing/StyleGuide';

// Gate the product: unauthenticated visitors are sent to the login screen.
// Waits for the async session check so we don't flash a redirect on refresh.
// Dark full-screen loading — matches the app theme so the light marketing body
// (cream + coral blooms) never flashes through during auth / code-split loads.
function AppLoading({ label = 'Loading…' }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#0B0C0E', color: '#ECEDEF', display: 'grid', placeItems: 'center', fontFamily: 'Manrope, system-ui, sans-serif' }}>
      <div style={{ display: 'grid', placeItems: 'center', gap: 14 }}>
        <img src="/brand/effysocial-logo-trim.png" alt="EffySocial" style={{ height: 24, opacity: 0.92 }} />
        <span style={{ fontSize: 13, color: 'rgba(236,237,239,0.5)' }}>{label}</span>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAppAuth();
  if (loading) return <AppLoading />;
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
            <Route path="/join" element={<Join />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/f/:slug" element={<PublicForm />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/p/:slug" element={<PublicLanding />} />
            <Route path="/s/:slug" element={<PublicSite />} />
            <Route path="/s/:slug/:pageKey" element={<PublicSite />} />
            <Route path="/b/:slug" element={<PublicBio />} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

            {/* Authenticated product */}
            <Route
              path="/app/*"
              element={
                <RequireAuth>
                  <Suspense fallback={<AppLoading label="Loading EffySocial…" />}>
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
            <Route path="/style-guide" element={<BrightStyleGuide />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppAuthProvider>
    </AuthProvider>
  );
}
