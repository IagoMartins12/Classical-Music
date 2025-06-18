// utils/auth.ts - Updated with learning and favorites routes
export const AUTH_PAGES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export const PROTECTED_ROUTES = [
  '/profile',
  '/settings',
  '/favorites',
  '/learning', // ✅ Added learning route
  '/study-sessions',
  '/annotations',
] as const;

export const PUBLIC_ROUTES = [
  '/',
  '/composers',
  '/works',
  '/instruments',
  '/music-history',
  '/about-us',
  ...Object.values(AUTH_PAGES),
] as const;

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );
}

export function getRedirectPath(currentPath: string): string {
  if (isProtectedRoute(currentPath)) {
    return `${AUTH_PAGES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`;
  }
  return AUTH_PAGES.LOGIN;
}
