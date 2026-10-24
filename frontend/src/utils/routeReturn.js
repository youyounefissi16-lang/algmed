const NON_RETURN_PATHS = new Set([
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/discipline-picker',
]);

export function safeReturnPath(value, fallback = '/dashboard') {
  if (typeof value !== 'string') return fallback;
  const path = value.trim();
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback;

  const pathname = path.split(/[?#]/, 1)[0];
  if (NON_RETURN_PATHS.has(pathname)) return fallback;
  return path;
}

export function currentPath(location) {
  return `${location?.pathname || '/'}${location?.search || ''}${location?.hash || ''}`;
}

export function getReturnTo(searchParams, location, fallback = '/dashboard') {
  const fromState = location?.state?.from;
  const fromQuery = searchParams?.get?.('redirect');
  return safeReturnPath(fromQuery || fromState, fallback);
}

export function loginPath(returnTo) {
  return `/login?redirect=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export function signupPath(returnTo) {
  return `/signup?redirect=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export function onboardingPath(returnTo) {
  return `/discipline-picker?redirect=${encodeURIComponent(safeReturnPath(returnTo))}`;
}
