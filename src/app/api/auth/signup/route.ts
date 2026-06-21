import { NextResponse } from 'next/server';
import { getAuthApiBaseUrl } from '@/lib/auth/session';

interface SignupPayload {
  name?: string;
  position?: string;
  email?: string;
  password?: string;
}

export async function POST(req: Request) {
  let payload: SignupPayload;

  try {
    payload = (await req.json()) as SignupPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = payload.name?.trim();
  const position = payload.position?.trim();
  const email = payload.email?.trim();
  const password = payload.password;

  if (!name || !position || !email || !password) {
    return NextResponse.json(
      { success: false, message: 'Name, position, email and password are required.' },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${getAuthApiBaseUrl()}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, position, email, password }),
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : 'Unable to reach the authentication server.',
      },
      { status: 502 }
    );
  }
}
