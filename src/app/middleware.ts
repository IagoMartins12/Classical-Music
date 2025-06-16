// middleware.ts (if needed for route protection)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './utils/auth';

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Require authentication for protected routes
        if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
          return !!token;
        }

        // Default to allowing access
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
