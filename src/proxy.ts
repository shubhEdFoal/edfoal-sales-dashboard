import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DASHBOARD_AUTH_COOKIE } from '@/lib/auth/session';

const PUBLIC_PATHS = new Set(['/login']);
const PUBLIC_API_PREFIXES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/signup',
  '/api/auth/verify-otp',
];
const PUBLIC_FILE_PATTERN = /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/;

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (PUBLIC_FILE_PATTERN.test(pathname)) return true;
  return PUBLIC_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isIngestPath(pathname: string) {
  return pathname === '/api/leads/ingest' || pathname.startsWith('/api/leads/ingest/');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = request.cookies.get(DASHBOARD_AUTH_COOKIE)?.value === '1';

  if (isIngestPath(pathname) || isPublicPath(pathname)) {
    if (pathname === '/login' && isAuthed) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
