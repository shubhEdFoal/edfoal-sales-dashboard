import { NextResponse } from 'next/server';
import { fetchLeadGenerationRequestWithAuth } from '@/lib/api/fetch-status';
import { getStoredBackendCookie } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ requestId: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  const { requestId } = await context.params;

  if (!requestId?.trim()) {
    return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
  }

  try {
    const request = await fetchLeadGenerationRequestWithAuth(
      requestId.trim(),
      getStoredBackendCookie(req)
    );
    return NextResponse.json(
      { success: true, request },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load request details';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
