import { NextResponse } from 'next/server';
import {
  getExpectedUsername,
  updateStoredPassword,
  validateCredentials,
} from '@/lib/auth/credentials';
import { getAuthFromRequest } from '@/lib/auth/request-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getAuthFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const currentPassword = body.currentPassword ?? '';
  const newPassword = body.newPassword ?? '';
  const confirmPassword = body.confirmPassword ?? '';

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: 'Current password, new password, and confirmation are required.' },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: 'New password must be at least 6 characters.' },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
  }

  const username = getExpectedUsername();
  if (!username || session.sub !== username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const valid = await validateCredentials(username, currentPassword);
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  try {
    await updateStoredPassword(newPassword);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update password.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
