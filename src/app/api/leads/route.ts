import { NextResponse } from 'next/server';
import type { Lead } from '@/data/leads';
import { appendLeadToSheet } from '@/lib/sheets/append-lead';
import { fetchLeadsFromGoogleSheet } from '@/lib/sheets/fetch-leads';
import { computeFunnel, computeKPI } from '@/lib/sheets/kpi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await fetchLeadsFromGoogleSheet();
    return NextResponse.json({
      leads,
      kpi: computeKPI(leads),
      funnel: computeFunnel(leads),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load leads from Google Sheets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Lead object required' }, { status: 400 });
  }

  const lead = body as Lead;
  if (!lead.businessName?.trim() || !lead.email?.trim()) {
    return NextResponse.json(
      { error: 'Business name and email are both required.' },
      { status: 400 }
    );
  }

  const result = await appendLeadToSheet(lead);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lead: result.lead });
}
