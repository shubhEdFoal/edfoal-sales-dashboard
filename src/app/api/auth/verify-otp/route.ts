import { NextResponse } from 'next/server';
import { getAuthApiBaseUrl } from '@/lib/auth/session';

interface VerifyOtpPayload {
  email?: string;
  otp?: string;
}

export async function POST(req: Request) {
  let payload: VerifyOtpPayload;

  try {
    payload = (await req.json()) as VerifyOtpPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = payload.email?.trim();
  const otp = payload.otp?.trim();

  if (!email || !otp) {
    return NextResponse.json(
      { success: false, message: 'Email and OTP are required.' },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${getAuthApiBaseUrl()}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
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
