import { NextResponse } from 'next/server';
import type { Lead } from '@/data/leads';
import { mergeLeads } from '@/lib/leads/merge';
import { addLead, deleteLeadById, getAllLeads, saveAllLeads } from '@/lib/leads/store';
import { fetchLeadsFromGoogleSheet } from '@/lib/sheets/fetch-leads';
import { computeFunnel, computeKPI } from '@/lib/sheets/kpi';

export const dynamic = 'force-dynamic';

async function syncFromSheetIfConfigured(leads: Lead[]): Promise<Lead[]> {
  if (!process.env.GOOGLE_SHEET_ID) return leads;
  try {
    const fromSheet = await fetchLeadsFromGoogleSheet();
    if (fromSheet.length === 0) return leads;
    const merged = mergeLeads(leads, fromSheet);
    try {
      await saveAllLeads(merged);
    } catch {
      /* serverless: return merged without persisting to disk */
    }
    return merged;
  } catch (err) {
    if (leads.length > 0) return leads;
    throw err;
  }
}

async function loadLeads(syncFromSheet: boolean): Promise<Lead[]> {
  let leads: Lead[] = [];
  try {
    leads = await getAllLeads();
  } catch {
    leads = [];
  }

  if (syncFromSheet || leads.length === 0) {
    return syncFromSheetIfConfigured(leads);
  }

  return leads;
}

function leadsResponse(leads: Lead[]) {
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
  const sync = new URL(req.url).searchParams.get('sync') === '1';
  try {
    const leads = await loadLeads(sync);
    return leadsResponse(leads);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load leads';
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

  try {
    await addLead(lead);
    const leads = await getAllLeads();
    return NextResponse.json({
      ok: true,
      leads,
      kpi: computeKPI(leads),
      funnel: computeFunnel(leads),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save lead';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Lead id is required' }, { status: 400 });
  }

  try {
    const removed = await deleteLeadById(id);
    if (!removed) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    const leads = await getAllLeads();
    return leadsResponse(leads);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete lead';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
