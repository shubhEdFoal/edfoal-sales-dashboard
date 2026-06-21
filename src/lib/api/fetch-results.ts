import { mapApiResultsToLeads } from '@/lib/api/map-result';
import { getResultsApiUrl, scraperApiHeaders } from '@/lib/api/config';
import type { ApiResultsResponse } from '@/lib/api/types';
import type { Lead } from '@/data/leads';

export async function fetchLeadsFromResultsApi(backendCookie?: string | null): Promise<Lead[]> {
  const baseUrl = getResultsApiUrl();

  const res = await fetch(baseUrl, {
    cache: 'no-store',
    headers: scraperApiHeaders(undefined, backendCookie),
  });

  if (!res.ok) {
    throw new Error(`Results API returned ${res.status}`);
  }

  const json = (await res.json()) as ApiResultsResponse;

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error('Results API returned an invalid response');
  }

  return mapApiResultsToLeads(json.data);
}
