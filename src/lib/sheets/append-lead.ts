import type { Lead } from '@/data/leads';

export interface AppendLeadResult {
  ok: boolean;
  error?: string;
  lead?: Lead;
}

export async function appendLeadToSheet(lead: Lead): Promise<AppendLeadResult> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      ok: false,
      error:
        'GOOGLE_SHEETS_WEBHOOK_URL is not set. Add the Apps Script web app URL to .env.local and restart the dev server.',
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Apps Script webhook returned ${res.status}.`,
      };
    }

    const text = await res.text();
    try {
      const json = JSON.parse(text) as { ok?: boolean; error?: string };
      if (json.ok === false) {
        return { ok: false, error: json.error ?? 'Sheet write failed.' };
      }
    } catch {
      // Non-JSON response (Apps Script can sometimes return HTML on auth issues).
      if (text.toLowerCase().includes('<html')) {
        return {
          ok: false,
          error:
            'Apps Script is not deployed with "Anyone" access. In deploy settings set Who has access = Anyone.',
        };
      }
    }

    return { ok: true, lead };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Error calling the sheet webhook.',
    };
  }
}
