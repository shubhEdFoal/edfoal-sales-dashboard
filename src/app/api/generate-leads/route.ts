import { NextResponse } from 'next/server';
import { getScrapeApiUrl, scraperApiHeaders } from '@/lib/api/config';
import { getStoredBackendCookie } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

interface GenerateLeadsBody {
  businessType?: string;
  state?: string;
  country?: string;
  count?: number | string;
  tone?: string;
}

function mapEmailTone(tone: string): string {
  return tone.trim().toLowerCase();
}

export async function POST(req: Request) {
  let body: GenerateLeadsBody;
  try {
    body = (await req.json()) as GenerateLeadsBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const businessType = (body.businessType ?? '').toString().trim();
  const state = (body.state ?? '').toString().trim();
  const country = (body.country ?? '').toString().trim();
  const tone = (body.tone ?? '').toString().trim();
  const countRaw = body.count;
  const numberOfLeads =
    typeof countRaw === 'number' ? countRaw : parseInt(String(countRaw ?? ''), 10);

  if (!businessType) {
    return NextResponse.json(
      { error: 'Target company type is required — e.g. restaurant, CA firm.' },
      { status: 400 }
    );
  }

  if (!state) {
    return NextResponse.json({ error: 'State / city is required.' }, { status: 400 });
  }

  if (!country) {
    return NextResponse.json({ error: 'Country is required.' }, { status: 400 });
  }

  if (!Number.isFinite(numberOfLeads) || numberOfLeads <= 0) {
    return NextResponse.json(
      { error: 'Number of leads must be a positive number.' },
      { status: 400 }
    );
  }

  if (!tone) {
    return NextResponse.json({ error: 'Outreach tone is required.' }, { status: 400 });
  }

  const payload = {
    businessType,
    state,
    country,
    numberOfLeads,
    emailTone: mapEmailTone(tone),
  };

  try {
    const res = await fetch(getScrapeApiUrl(), {
      method: 'POST',
      headers: scraperApiHeaders(
        { 'Content-Type': 'application/json' },
        getStoredBackendCookie(req)
      ),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      /* non-JSON response */
    }

    if (!res.ok) {
      const message =
        typeof data.error === 'string'
          ? data.error
          : typeof data.message === 'string'
            ? data.message
            : `Scrape API returned ${res.status}.`;
      return NextResponse.json({ error: message, detail: text.slice(0, 500) }, { status: 502 });
    }

    if (data.success === false) {
      const message =
        typeof data.error === 'string'
          ? data.error
          : typeof data.message === 'string'
            ? data.message
            : 'Scrape request failed.';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      requestID: data.requestID ?? null,
      message: data.message ?? 'Scraping started.',
      query: data.query ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to start lead generation.',
      },
      { status: 502 }
    );
  }
}
