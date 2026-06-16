import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { validateCredentials, isAuthConfigured } from '@/lib/auth/credentials';
import { signAuthToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: 'Auth is not configured. Set JWT_SECRET, AUTH_USERNAME, and AUTH_PASSWORD.' },
      { status: 503 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const username = (body.username ?? '').trim();
  const password = body.password ?? '';

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
  }

  if (!(await validateCredentials(username, password))) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const token = await signAuthToken(username);
  const response = NextResponse.json({ ok: true, username });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
