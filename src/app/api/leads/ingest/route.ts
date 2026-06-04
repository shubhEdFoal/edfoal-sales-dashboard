import { NextResponse } from 'next/server';
import type { Lead } from '@/data/leads';
import { addLeads } from '@/lib/leads/store';
import { normalizeLead } from '@/lib/leads/normalize';

export const dynamic = 'force-dynamic';

function isLeadLike(value: unknown): value is Partial<Lead> {
  return typeof value === 'object' && value !== null;
}

function extractLeads(body: unknown): Partial<Lead>[] {
  if (Array.isArray(body)) {
    return body.filter(isLeadLike);
  }
  if (!body || typeof body !== 'object') return [];

  const record = body as Record<string, unknown>;
  if (Array.isArray(record.leads)) {
    return record.leads.filter(isLeadLike);
  }
  if (isLeadLike(body)) {
    return [body];
  }
  return [];
}

export async function POST(req: Request) {
  const secret = process.env.N8N_INGEST_SECRET;
  if (secret) {
    const provided =
      req.headers.get('x-ingest-secret') ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const raw = extractLeads(body);
  if (raw.length === 0) {
    return NextResponse.json(
      { error: 'Provide a lead object or { leads: [...] }' },
      { status: 400 }
    );
  }

  const normalized = raw.map((item) => normalizeLead(item));
  const invalid = normalized.find((l) => !l.email && !l.businessName);
  if (invalid) {
    return NextResponse.json(
      { error: 'Each lead needs at least a business name or email.' },
      { status: 400 }
    );
  }

  try {
    const saved = await addLeads(normalized);
    return NextResponse.json({ ok: true, count: saved.length, leads: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ingest failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
