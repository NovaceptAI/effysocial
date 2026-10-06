import React, { Suspense, lazy, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
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
const ConnectResult = lazy(() => import('./marketing/ConnectResult'));
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

// Someone already signed in who opens / or /login goes straight to the app. Decided once, when
// the session check settles, so signing in or up here still lands where Login sends it.
// /login?next=… (an invite) is left alone.
export function SignedInGoesToApp({ children }) {
  const { user, loading } = useAppAuth();
  const { search } = useLocation();
  const signedIn = useRef(null);
  if (!loading && signedIn.current === null) signedIn.current = !!user;
  if (signedIn.current && !new URLSearchParams(search).has('next')) return <Navigate to="/app" replace />;
  return children;
}

// The marketing and public pages render outside .app-root, so their buttons get the button
// baseline in tailwind.css from this wrapper. display: contents leaves page layout untouched.
function SitePage() {
  return <div className="site-page contents"><Outlet /></div>;
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
            <Route element={<SitePage />}>
              <Route path="/" element={<SignedInGoesToApp><Landing /></SignedInGoesToApp>} />
              <Route path="/login" element={<SignedInGoesToApp><Login /></SignedInGoesToApp>} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/join" element={<Join />} />
              <Route path="/forgot" element={<Forgot />} />
              <Route path="/reset" element={<Reset />} />
              <Route path="/connected/:back" element={<ConnectResult />} />
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
            </Route>

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
