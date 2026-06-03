import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = new Set(['/login', '/register', '/forgot-password']);
const PROTECTED_ROUTE_PREFIXES = [
  '/onboarding',
  '/create-profile',
  '/dashboard',
  '/settings',
  '/profile',
  '/favorites',
  '/chat',
  '/programs/compare-universities'
];
const IGNORED_PATHS = ['/static', '/_next', '/assets', '/favicon.ico', '/api'];

function redirectToLogin(req: NextRequest): NextResponse {
  const url = new URL('/login', req.url);
  const returnUrl = req.nextUrl.pathname + req.nextUrl.search;
  url.searchParams.set('redirect', returnUrl);
  url.searchParams.set('auth_required', 'true');
  return NextResponse.redirect(url);
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode base64url
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    const currentTime = Math.floor(Date.now() / 1000);

    return !!payload.exp && payload.exp > currentTime;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  if (IGNORED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isComingSoon = false;

  if (pathname === '/coming-soon') {
    if (!isComingSoon) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (isComingSoon) {
    return NextResponse.redirect(new URL('/coming-soon', req.url));
  }

  const token = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;

  const hasValidAccess = isTokenValid(token);
  // We check if refresh token exists and is valid (if it's a JWT) or simply exists
  // If it's a JWT, isTokenValid checks expiration. If it's not a JWT, we just rely on its presence.
  const hasValidRefresh = refreshToken
    ? refreshToken.includes('.')
      ? isTokenValid(refreshToken)
      : true
    : false;

  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // If it's a protected route and we have NO valid access AND NO valid refresh token, redirect to login
  if (isProtectedRoute && !hasValidAccess && !hasValidRefresh) {
    return redirectToLogin(req);
  }

  // If user has valid tokens and tries to access public routes, redirect to dashboard
  if ((hasValidAccess || hasValidRefresh) && PUBLIC_ROUTES.has(pathname)) {
    const redirectTo = req.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // Let baseQueryWithReauth handle complex token validation and refresh
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
