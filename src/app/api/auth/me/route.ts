import { NextResponse } from 'next/server';
import { getAuthRole } from '@/lib/auth/credentials';
import { getAuthFromRequest } from '@/lib/auth/request-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getAuthFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    username: session.sub,
    name: session.sub,
    role: getAuthRole(),
  });
}
