import { NextResponse } from 'next/server';
import { DASHBOARD_AUTH_COOKIE, getAuthApiBaseUrl } from '@/lib/auth/session';

interface LoginPayload {
  email?: string;
  password?: string;
}

export async function POST(req: Request) {
  let payload: LoginPayload;

  try {
    payload = (await req.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = payload.email?.trim();
  const password = payload.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${getAuthApiBaseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') ?? 'application/json';
    const body = parseJsonBody(text);

    const response = new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': contentType },
    });

    if (upstream.ok && body?.success !== false) {
      response.cookies.set(DASHBOARD_AUTH_COOKIE, '1', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      for (const cookie of getSetCookies(upstream.headers)) {
        response.headers.append('set-cookie', cookie);
      }
    }

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Unable to reach the authentication server.',
      },
      { status: 502 }
    );
  }
}

function parseJsonBody(text: string): { success?: boolean } | null {
  try {
    return JSON.parse(text) as { success?: boolean };
  } catch {
    return null;
  }
}

function getSetCookies(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  const setCookies = withGetSetCookie.getSetCookie?.();
  if (setCookies?.length) return setCookies;

  const single = headers.get('set-cookie');
  return single ? [single] : [];
}

