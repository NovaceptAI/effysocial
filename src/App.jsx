import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { AppAuthProvider, useAppAuth } from './app/context/AppAuth';
import Landing from './marketing/Landing';

// The full product app shell (Phase 0+). Code-split so the marketing site stays light.
const AppRoot = lazy(() => import('./app/AppRoot'));
// Everything but the landing page loads on demand, so / stays small (G45).
const Login = lazy(() => import('./marketing/Login'));
const Onboarding = lazy(() => import('./marketing/Onboarding'));
const Join = lazy(() => import('./marketing/Join'));
const Verify = lazy(() => import('./marketing/Verify'));
const Forgot = lazy(() => import('./marketing/Forgot'));
const Reset = lazy(() => import('./marketing/Reset'));
const PublicForm = lazy(() => import('./marketing/PublicForm'));
const PublicReviews = lazy(() => import('./marketing/PublicReviews'));
const PublicReport = lazy(() => import('./marketing/PublicReport'));
const Pricing = lazy(() => import('./marketing/Pricing'));
const Privacy = lazy(() => import('./marketing/Privacy'));
const Terms = lazy(() => import('./marketing/Terms'));
const PublicLanding = lazy(() => import('./marketing/PublicLanding'));
const PublicSite = lazy(() => import('./marketing/PublicSite'));
const PublicBio = lazy(() => import('./marketing/PublicBio'));
const Hub = lazy(() => import('./Hub'));
const Studio = lazy(() => import('./studio/Studio'));
const LipSync = lazy(() => import('./modules/lipsync/LipSync'));
const VoiceCaller = lazy(() => import('./modules/caller/VoiceCaller'));
const CampaignGenerator = lazy(() => import('./modules/campaign/CampaignGenerator'));
const PhotoExperience = lazy(() => import('./modules/photo/PhotoExperience'));
const BrightStyleGuide = lazy(() => import('./marketing/StyleGuide'));

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
          <Suspense fallback={<AppLoading />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/join" element={<Join />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/f/:slug" element={<PublicForm />} />
            <Route path="/r/:slug" element={<PublicReviews />} />
            <Route path="/report/:token" element={<PublicReport />} />
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
          </Suspense>
        </BrowserRouter>
      </AppAuthProvider>
    </AuthProvider>
  );
}
