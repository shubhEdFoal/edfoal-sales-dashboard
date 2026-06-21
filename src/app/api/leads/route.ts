import { NextResponse } from 'next/server';
import { fetchLeadsFromResultsApi } from '@/lib/api/fetch-results';
import { getStoredBackendCookie } from '@/lib/auth/session';
import { computeFunnel, computeKPI } from '@/lib/sheets/kpi';

export const dynamic = 'force-dynamic';

function leadsResponse(leads: Awaited<ReturnType<typeof fetchLeadsFromResultsApi>>) {
  return NextResponse.json(
    {
      leads,
      kpi: computeKPI(leads),
      funnel: computeFunnel(leads),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function GET(req: Request) {
  try {
    const leads = await fetchLeadsFromResultsApi(getStoredBackendCookie(req));
    return leadsResponse(leads);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load leads';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
