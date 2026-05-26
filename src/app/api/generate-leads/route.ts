import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_WEBHOOK_URL =
  'https://shiiiitu.app.n8n.cloud/form/f84cc525-a95c-4e73-a872-04e0aa85f195';

interface GenerateLeadsBody {
  businessType?: string;
  location?: string;
  count?: number | string;
  tone?: string;
}

export async function POST(req: Request) {
  let body: GenerateLeadsBody;
  try {
    body = (await req.json()) as GenerateLeadsBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const businessType = (body.businessType ?? '').toString().trim();
  const location = (body.location ?? '').toString().trim();
  const tone = (body.tone ?? '').toString().trim();
  const countRaw = body.count;
  const count = typeof countRaw === 'number' ? countRaw : parseInt(String(countRaw ?? ''), 10);

  if (!businessType) {
    return NextResponse.json({ error: 'Business type is required.' }, { status: 400 });
  }
  if (!location) {
    return NextResponse.json({ error: 'Location is required.' }, { status: 400 });
  }
  if (!Number.isFinite(count) || count <= 0) {
    return NextResponse.json(
      { error: 'Number of leads must be a positive number.' },
      { status: 400 }
    );
  }
  if (!tone) {
    return NextResponse.json({ error: 'Outreach tone is required.' }, { status: 400 });
  }

  const webhookUrl = (process.env.N8N_GENERATE_LEADS_URL ?? DEFAULT_WEBHOOK_URL).trim();

  const form = new FormData();
  form.append('field-0', businessType);
  form.append('field-1', location);
  form.append('field-2', String(count));
  form.append('field-3', tone);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      body: form,
      redirect: 'follow',
      cache: 'no-store',
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Lead generator returned ${res.status}.`,
          detail: text.slice(0, 500),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, status: res.status, response: text.slice(0, 2000) });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to call the lead generator.',
      },
      { status: 502 }
    );
  }
}
