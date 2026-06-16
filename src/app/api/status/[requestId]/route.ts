import { NextResponse } from 'next/server';
import { fetchLeadGenerationRequest } from '@/lib/api/fetch-status';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ requestId: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const { requestId } = await context.params;

  if (!requestId?.trim()) {
    return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
  }

  try {
    const request = await fetchLeadGenerationRequest(requestId.trim());
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
