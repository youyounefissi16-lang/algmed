import React from 'react';
import { SignUp } from "@clerk/react";
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import useDocumentTitle from '../utils/useDocumentTitle';
import { getReturnTo, loginPath, onboardingPath } from '../utils/routeReturn';
import BrandLogo from '../components/BrandLogo';
import '../styles/pagesStyle/login.css';
import '../styles/teal-theme.css';

const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: 'var(--action-from)',
    colorBackground: 'transparent',
    colorText: '#F2F5FF',
    colorTextSecondary: '#8B95B8',
    colorInputBackground: '#151D31',
    colorInputText: '#F2F5FF',
    colorNeutral: '#F2F5FF',
    colorDanger: '#EF4444',
    colorSuccess: '#34D399',
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    borderRadius: '10px',
  },
  elements: {
    rootBox: { display: 'flex', justifyContent: 'center', width: '100%' },
    card: { boxShadow: 'none', border: 'none', background: 'transparent' },
    cardBox: { boxShadow: 'none', background: 'transparent' },
    headerTitle: { display: 'none' },
    headerSubtitle: { display: 'none' },
    socialButtonsBlockButton: { border: '1px solid var(--border-light, #e2e8f0)', borderRadius: '10px', padding: '10px 16px', backgroundColor: 'var(--card-bg, #fff)', color: 'var(--text-dark, #1a202c)' },
    socialButtonsBlockButtonText: { fontWeight: '500' },
    dividerLine: { backgroundColor: 'var(--border-light, #e2e8f0)' },
    dividerText: { color: 'var(--text-muted, #718096)', fontSize: '0.85rem' },
    formFieldLabel: { fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-dark, #1a202c)' },
    formFieldInput: { borderRadius: '10px', border: '1px solid var(--border-light, #e2e8f0)', padding: '11px 14px', fontSize: '0.95rem', backgroundColor: 'var(--card-bg, #fff)', color: 'var(--text-dark, #1a202c)' },
    formButtonPrimary: { backgroundColor: 'var(--action-from)', color: '#FFFFFF', borderRadius: '10px', padding: '12px', fontSize: '0.95rem', textTransform: 'none', boxShadow: '0 6px 18px color-mix(in srgb, var(--action-from) 28%, transparent)', fontWeight: '600' },
    footer: { background: 'transparent', paddingBottom: 0 },
    footerAction: { marginTop: '8px', background: 'transparent' },
    footerActionText: { color: '#8B95B8' },
    footerActionLink: { color: 'var(--teal-dark, #3F56E0)', fontSize: '0.9rem' },
    badge: { display: 'none' },
  },
};

const Signup = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('signup.title'));
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const returnTo = getReturnTo(searchParams, location);
  return (
    <div className="login-page page-teal">
      <div className="login-card">
        <div className="login-brand">
          <BrandLogo width={48} height={30} />
          <h1 className="login-brand-name brand-name">algmed</h1>
        </div>

        <div className="login-form">
          <SignUp fallbackRedirectUrl="/dashboard" afterSignUpUrl={onboardingPath(returnTo)} signInUrl={loginPath(returnTo)} appearance={CLERK_APPEARANCE} />
        </div>
      </div>
    </div>
  );
};

export default Signup;