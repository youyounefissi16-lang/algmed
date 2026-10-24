import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { ClerkProvider, useAuth, useClerk } from "@clerk/react";
import Home from './pages/Home';

import FooterPage from './components/Footer.jsx';
import ProtectedRoute from './components/protectedRoute';
import Sidebar from './components/adminSidebar';
import UserMenu from './components/UserMenu';
import { PageTransitionProvider, PageReady, PageTransitionVeil } from './components/PageTransition';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { ToastProvider } from './components/Toast.jsx';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { SoundProvider } from './context/SoundContext';
import { ThemeProvider } from './context/ThemeContext';
import CookieConsent from './components/CookieConsent';

import ProfileGuardModal from './components/ProfileGuardModal';
import GuestRoute from './components/GuestRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import AnimatedLoading from './components/AnimatedLoading';
import { logger } from './utils/logger';
import { API_BASE_URL, fetchWithAuth } from './config/api';
import { setToken } from './utils/tokenStore';
import useClerkToken from './hooks/useClerkToken';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// When set, ClerkJS routes every Frontend API call through this path instead of
// the clerk.<domain> host. Used where that host has no DNS record.

const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Help = lazy(() => import('./pages/Help'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const QuizPage = lazy(() => import('./pages/quizPage.jsx'));
const VoiceExamPage = lazy(() => import('./pages/VoiceExamPage.jsx'));
const QuizCard = lazy(() => import('./components/quizCard'));
const CourseViewPage = lazy(() => import('./pages/CourseViewPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Login = lazy(() => import('./pages/login'));
const Signup = lazy(() => import('./pages/Signup'));
const DisciplinePicker = lazy(() => import('./pages/DisciplinePicker'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const AdminDashboard = lazy(() => import('./pages/Dashboard'));
const QuizManagement = lazy(() => import('./pages/QuizManagement'));
const UserManagement = lazy(() => import('./pages/userManagement'));
const ModuleManagement = lazy(() => import('./pages/ModuleManagement'));
const AdminProfile = lazy(() => import('./pages/profile'));
const VoiceExamManagement = lazy(() => import('./pages/VoiceExamManagement'));
const AdminSetup = lazy(() => import('./pages/AdminSetup'));
const FeedbackManagement = lazy(() => import('./pages/FeedbackManagement'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AdminPricingPage = lazy(() => import('./pages/AdminPricingPage'));
const PdfManagement = lazy(() => import('./pages/PdfManagement'));
const ImageManagement = lazy(() => import('./pages/ImageManagement'));

const Fallback = () => {
  return <AnimatedLoading />;
};

const LoadingPage = () => {
  return <AnimatedLoading />;
};

const isMobile = () => window.innerWidth < 768;

const PUBLIC_PAGES = ['/about', '/help', '/contact', '/terms', '/privacy'];
const AUTH_PAGES = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];

const UserLayout = () => {
  const location = useLocation();
  const { isSignedIn } = useAuth();

  const path = location.pathname;
  const isHome = path === '/';
  const isPublic = PUBLIC_PAGES.includes(path);
  const isAuthPage = AUTH_PAGES.includes(path);
  const isImmersive = path.startsWith('/quiz/');
  const showMenu = Boolean(isSignedIn) && !isHome && !isAuthPage && !isImmersive;

  return (
    <PageTransitionProvider>
    <div style={isHome || location.pathname === '/login' ? {} : { background: 'linear-gradient(135deg, var(--teal-dark, #3F56E0) 0%, var(--teal-deeper, #2F43C4) 100%)', minHeight: '100vh' }}>
      <CookieConsent />

      <div className={`user-shell${showMenu ? ' user-shell--menu' : ''}`}>
        <Suspense fallback={<Fallback />}>
          <ErrorBoundary>
            <PageReady key={path}>
            <Routes>
            <Route path="/"         element={isSignedIn ? <Navigate to="/dashboard" replace /> : <Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/help"     element={<Help />} />
            <Route path="/contact"  element={<Contact />} />
            <Route path="/login"    element={<Login />} />
            <Route element={<GuestRoute />}>
              <Route path="/signup" element={<Signup />} />
            </Route>
            <Route path="/terms"    element={<Terms />} />
            <Route path="/privacy"  element={<Privacy />} />
            <Route path="/verify-email" element={<Navigate to="/login" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
            <Route path="/reset-password" element={<Navigate to="/login" replace />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"   element={<DashboardPage />} />
              <Route path="/discipline-picker" element={<DisciplinePicker />} />
              <Route path="/quizPage"    element={<ProfileGuardModal><QuizPage /></ProfileGuardModal>} />
              <Route path="/voice-exams" element={<ProfileGuardModal><VoiceExamPage /></ProfileGuardModal>} />
              <Route path="/review"      element={<ProfileGuardModal><ReviewPage /></ProfileGuardModal>} />
              <Route path="/profile"     element={<ProfilePage />} />
              <Route path="/quiz/:id"    element={<ProfileGuardModal><QuizCard /></ProfileGuardModal>} />
              <Route path="/course/:moduleId/:courseName" element={<ProfileGuardModal><CourseViewPage /></ProfileGuardModal>} />
              <Route path="/pricing"    element={<PricingPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
            </Routes>
            </PageReady>
          </ErrorBoundary>
        </Suspense>

        {isPublic && <FooterPage />}
      </div>

      {showMenu && <UserMenu />}
      <PageTransitionVeil />
    </div>
    </PageTransitionProvider>
  );
};


import './styles/adminTheme.css';
import './styles/adminStyles.css';
import './styles/sharedAdmin.css';
import './styles/userDashboard.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile());
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="admin-app">
      {!sidebarOpen && (
        <button className="admin-mobile-toggle" onClick={toggleSidebar} aria-label="Open sidebar">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      )}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
      <div className="main-content">
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="page-content" style={{ marginLeft: sidebarOpen ? 230 : 60, transition: 'margin-left 0.3s ease' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const SyncErrorPage = ({ error, onRetry, onSignOut }) => {
  const { t } = useTranslation();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{t('sync.title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 8, maxWidth: 400 }}>
          {t('sync.description')}
        </p>
        <p style={{ color: 'var(--text-light)', marginBottom: 24, maxWidth: 400, fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-word' }}>
          {error}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onRetry} style={{ padding: '10px 24px', background: 'var(--action-from)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
            {t('sync.retry')}
          </button>
          <button onClick={onSignOut} style={{ padding: '10px 24px', background: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
            {t('sync.signOut')}
          </button>
        </div>
      </div>
    );
};

const AppContent = () => {
  const ready = useClerkToken();
  const { isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  // Deliberately not pre-seeded from sessionStorage: clerk-sync has to run on
  // every app load so this device claims the single-session lock. A tab that
  // synced once used to skip it forever, which left the lock unarmed.
  const syncedRef = useRef(false);
  const [syncError, setSyncError] = useState(null);

  const syncRef = useRef(null);
  const sync = useCallback(async () => {
    setSyncError(null);
    const abort = new AbortController();
    syncRef.current = abort;
    let token = await getToken();
    if (!token) {
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 300));
        if (abort.signal.aborted) return;
        token = await getToken();
        if (token) break;
      }
    }
    if (!token || abort.signal.aborted) return;
    setToken(token);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/clerk-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: '{}',
        signal: abort.signal,
      });
      if (abort.signal.aborted) return;
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const error = new Error(data.message || `HTTP ${res.status}`);
        error.response = { data, status: res.status };
        throw error;
      }
      const data = await res.json();
      if (data.token) setToken(data.token);
      try { localStorage.setItem('userId', data.userId); } catch {}
      try { localStorage.setItem('userRole', data.role || 'user'); } catch {}
      try { localStorage.setItem('userName', data.name || ''); } catch {}
      try { localStorage.setItem('userDiscipline', data.discipline || ''); } catch {}
      try { localStorage.setItem('userYear', data.year?.toString() || ''); } catch {}
      syncedRef.current = true;
    } catch (err) {
      if (err?.name === 'AbortError') return;
      // A repeat sync only refreshes the single-session lock, so it must never
      // block the app. Only the first sync (no stored profile yet) is critical.
      let alreadySynced = false;
      try { alreadySynced = !!localStorage.getItem('userId'); } catch { alreadySynced = false; }
      if (alreadySynced) {
        logger.warn({ err }, 'AppContent sync refresh failed — continuing');
        return;
      }
      logger.error({ err }, 'AppContent sync failed');
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      setSyncError(msg);
    }
  }, [getToken]);

  useEffect(() => {
    // Admin routes run their own clerk-sync so the role check cannot race a
    // second sync. User routes still sync here before rendering the app.
    if (isAdminRoute || !ready || !isSignedIn || syncedRef.current) return;
    sync();
    return () => { syncRef.current?.abort(); };
  }, [ready, isSignedIn, sync, isAdminRoute]);

  useEffect(() => {
    if (!ready || !isSignedIn) return;
    const interval = setInterval(async () => {
      try {
        await fetchWithAuth(`${API_BASE_URL}/api/auth/verify`);
      } catch { /* network error — skip this cycle */ }
    }, 60_000);
    return () => clearInterval(interval);
  }, [ready, isSignedIn]);

  if (!ready) return <LoadingPage />;
  if (syncError) return <SyncErrorPage error={syncError} onRetry={sync} onSignOut={() => signOut()} />;

  if (isAdminRoute) {
    return (
      <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/module-management" element={<ModuleManagement />} />
            <Route path="/admin/quiz-management" element={<QuizManagement />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/voice-exam-management" element={<VoiceExamManagement />} />
            <Route path="/admin/feedback" element={<FeedbackManagement />} />
            <Route path="/admin/pricing" element={<AdminPricingPage />} />
            <Route path="/admin/pdfs" element={<PdfManagement />} />
            <Route path="/admin/images" element={<ImageManagement />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
      </Suspense>
      </ErrorBoundary>
    );
  }

  return <UserLayout />;
};

const App = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <LanguageProvider>
        <SoundProvider>
        <ToastProvider>
          <ErrorBoundary>
            <ScrollToTop />
            <AppContent />
          </ErrorBoundary>
        </ToastProvider>
        </SoundProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default App;
