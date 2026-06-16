import { NextResponse } from 'next/server';
import { fetchLeadGenerationStatusList } from '@/lib/api/fetch-status';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchLeadGenerationStatusList();
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
