import React, { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/react';
import { API_BASE_URL } from '../config/api';
import { setToken, clearToken } from '../utils/tokenStore';
import { useTranslation } from '../context/LanguageContext';
import { currentPath, loginPath } from '../utils/routeReturn';

const AdminProtectedRoute = () => {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { signOut } = useClerk();
  const location = useLocation();
  const [status, setStatus] = useState('syncing');
  const [role, setRole] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;
    let aborted = false;
    setStatus('syncing');

    const sync = async () => {
      let controller;
      let timeoutId;
      try {
        let token = await getToken();
        if (!token) {
          for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 300));
            if (aborted) return;
            token = await getToken();
            if (token) break;
          }
        }
        if (!token) throw new Error('No token');
        setToken(token);
        if (aborted) return;
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`${API_BASE_URL}/api/auth/clerk-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: '{}',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (aborted) return;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const error = new Error(data.message || `HTTP ${res.status}`);
          error.response = { data, status: res.status };
          throw error;
        }
        const data = await res.json();
        try { localStorage.setItem('adminRole', data.role); } catch { /* incognito */ }
        setRole(data.role);
        setStatus('ready');
      } catch (err) {
        clearTimeout(timeoutId);
        if (aborted) return;
        if (err?.response?.status === 409) {
          clearToken();
          try { localStorage.removeItem('adminRole'); } catch { /* incognito */ }
          window.location.href = '/login?conflict=1';
          return;
        }
        setRole(null);
        setStatus('error');
      }
    };

    sync();
    return () => {
      aborted = true;
    };
  }, [isSignedIn, isLoaded, getToken, attempt]);

  if (!isLoaded) return <div style={{ padding: 24 }}>{t('loading')}</div>;
  if (!isSignedIn) {
    const target = currentPath(location);
    return <Navigate to={loginPath(target)} state={{ from: target }} replace />;
  }
  if (status === 'syncing') return <div style={{ padding: 24 }}>{t('login.syncing')}</div>;

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>{t('admin.sync.title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 420 }}>
          {t('admin.sync.message')}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={() => { setStatus('syncing'); setAttempt((value) => value + 1); }}>
            {t('admin.sync.retry')}
          </button>
          <button className="btn-outline" onClick={() => { clearToken(); signOut(); }}>
            {t('admin.sync.signOut')}
          </button>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>{t('admin.accessDenied.title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 420 }}>
          {t('admin.accessDenied.message')}
        </p>
        <Link className="btn-primary" to="/dashboard">{t('admin.accessDenied.back')}</Link>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
