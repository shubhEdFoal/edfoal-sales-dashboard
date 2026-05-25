import { mapRowsToLeads } from '@/lib/sheets/map-row';
import { parseCSV } from '@/lib/sheets/parse-csv';
import type { Lead } from '@/data/leads';

export async function fetchLeadsFromGoogleSheet(): Promise<Lead[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error(
      'GOOGLE_SHEET_ID is not set. Add it to .env.local (see .env.example).'
    );
  }

  const gid = process.env.GOOGLE_SHEET_GID ?? '0';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      'Sheet is private. Share → General access → Anyone with the link → Viewer.'
    );
  }

  if (!res.ok) {
    throw new Error(`Google Sheets fetch failed (${res.status})`);
  }

  const text = await res.text();

  if (text.includes('<!DOCTYPE html') || text.includes('login')) {
    throw new Error(
      'Sheet is private. Share → General access → Anyone with the link → Viewer.'
    );
  }

  const rows = parseCSV(text);
  return mapRowsToLeads(rows);
}
