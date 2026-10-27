import React from 'react';
import { SignUp } from "@clerk/react";
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import useDocumentTitle from '../utils/useDocumentTitle';
import { getReturnTo, loginPath, onboardingPath } from '../utils/routeReturn';
import AuthLayout from '../components/AuthLayout';
import clerkAppearance from '../config/clerkAppearance';
import '../styles/pagesStyle/login.css';
import '../styles/teal-theme.css';

const Signup = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('signup.title'));
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const returnTo = getReturnTo(searchParams, location);

  return (
    <AuthLayout title={t('signup.title')} subtitle={t('signup.subtitle')}>
      <SignUp
        fallbackRedirectUrl="/dashboard"
        afterSignUpUrl={onboardingPath(returnTo)}
        signInUrl={loginPath(returnTo)}
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
};

export default Signup;
