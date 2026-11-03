import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Skip Next.js internal files, static assets and auth APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || // e.g. logo.png, favicon.ico
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Read the session cookie
  const sessionCookie = request.cookies.get('nh_session')?.value;
  let sessionUser = null;

  if (sessionCookie) {
    try {
      let val = sessionCookie;
      if (val.includes('%')) {
        val = decodeURIComponent(val);
      }
      if (val.includes('%')) {
        val = decodeURIComponent(val);
      }
      sessionUser = JSON.parse(val);
    } catch (e) {
      try {
        sessionUser = JSON.parse(sessionCookie);
      } catch (e2) {
        sessionUser = null;
      }
    }
  }

  const isAuthenticated = Boolean(sessionUser && sessionUser.id);

  // 3. If accessing /login
  if (pathname === '/login') {
    if (isAuthenticated) {
      // If already logged in, redirect to posting panel (or admin if admin came to login)
      const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/';
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
    return NextResponse.next();
  }

  // 4. If NOT logged in, block access to any protected route (/, /history, /admin, etc.)
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 5. If accessing /admin, enforce Admin role
  if (pathname.startsWith('/admin')) {
    if (!sessionUser.isAdmin) {
      // Regular team member cannot access Admin panel
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

