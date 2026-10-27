import React, { useEffect, useState, useRef } from 'react';
import { SignIn, useAuth } from "@clerk/react";
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import useDocumentTitle from '../utils/useDocumentTitle';
import { getReturnTo, loginPath, signupPath } from '../utils/routeReturn';
import AuthLayout from '../components/AuthLayout';
import clerkAppearance from '../config/clerkAppearance';
import '../styles/teal-theme.css';
import '../styles/pagesStyle/login.css';

const Login = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('login.title'));
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = getReturnTo(searchParams, location);
  const [conflict] = useState(() => searchParams.get('conflict') === '1');
  const [waiting, setWaiting] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);
  const pollCountRef = useRef(0);
  const conflictHandledRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !conflict || conflictHandledRef.current) return;
    if (isSignedIn) {
      conflictHandledRef.current = true;
      signOut();
    }
  }, [isLoaded, isSignedIn, conflict, signOut]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const userId = (() => { try { return localStorage.getItem('userId'); } catch { return null; } })();
    if (userId) {
      navigate(returnTo, { replace: true });
    } else {
      setWaiting(true);
      pollCountRef.current = 0;
      const interval = setInterval(() => {
        pollCountRef.current++;
        const uid = (() => { try { return localStorage.getItem('userId'); } catch { return null; } })();
        if (uid) {
          clearInterval(interval);
          navigate(returnTo, { replace: true });
        } else if (pollCountRef.current >= 20) {
          clearInterval(interval);
          setWaiting(false);
          setSyncFailed(true);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoaded, isSignedIn, navigate, returnTo]);

  if (isSignedIn && syncFailed) {
    return (
      <AuthLayout title={t('login.syncFailed')} subtitle={t('login.subtitle')}>
        <button
          className="btn-primary"
          onClick={() => { setSyncFailed(false); navigate(loginPath(returnTo), { replace: true }); }}
        >
          {t('login.retry')}
        </button>
      </AuthLayout>
    );
  }

  if (isSignedIn && waiting) {
    return (
      <AuthLayout title={t('login.checking')} subtitle={t('login.syncing')}>
        <div className="login-loader" role="status" aria-label={t('login.syncing')} />
      </AuthLayout>
    );
  }

  if (isSignedIn) return null;

  return (
    <AuthLayout title={t('login.title')} subtitle={t('login.subtitle')}>
      {conflict && <div className="login-conflict">{t('login.sessionConflict')}</div>}
      <SignIn
        signUpUrl={signupPath(returnTo)}
        afterSignInUrl={returnTo}
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
};

export default Login;
