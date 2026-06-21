import { NextResponse } from 'next/server';
import { fetchLeadGenerationStatusListWithAuth } from '@/lib/api/fetch-status';
import { getStoredBackendCookie } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const data = await fetchLeadGenerationStatusListWithAuth(getStoredBackendCookie(req));
    return NextResponse.json(
      { success: true, ...data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load generation status';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
