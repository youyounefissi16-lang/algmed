import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from "@clerk/react";
import { useTranslation } from '../context/LanguageContext';
import { currentPath, loginPath } from '../utils/routeReturn';

const ProtectedRoute = () => {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  if (!isLoaded) return <div className="page-teal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>{t('loading')}</div>;
  if (isSignedIn) return <Outlet />;

  const target = currentPath(location);
  return <Navigate to={loginPath(target)} state={{ from: target }} replace />;
};

export default ProtectedRoute;
