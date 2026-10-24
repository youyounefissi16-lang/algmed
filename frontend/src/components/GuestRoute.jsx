import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import AnimatedLoading from './AnimatedLoading';
import { getReturnTo } from '../utils/routeReturn';

const GuestRoute = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) return <AnimatedLoading />;

  if (isSignedIn) {
    const returnTo = getReturnTo(new URLSearchParams(location.search), location);
    return <Navigate to={returnTo} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
