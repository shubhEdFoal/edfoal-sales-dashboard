import { getStatusApiUrl, scraperApiHeaders } from '@/lib/api/config';
import type {
  ApiStatusDetailResponse,
  ApiStatusListResponse,
  LeadGenerationRequest,
} from '@/lib/api/types';

export async function fetchLeadGenerationStatusList(): Promise<{
  total: number;
  running: number;
  requests: LeadGenerationRequest[];
}> {
  return fetchLeadGenerationStatusListWithAuth(null);
}

export async function fetchLeadGenerationStatusListWithAuth(
  backendCookie?: string | null
): Promise<{
  total: number;
  running: number;
  requests: LeadGenerationRequest[];
}> {
  const res = await fetch(getStatusApiUrl(), {
    cache: 'no-store',
    headers: scraperApiHeaders(undefined, backendCookie),
  });

  if (!res.ok) {
    throw new Error(`Status API returned ${res.status}`);
  }

  const json = (await res.json()) as ApiStatusListResponse;

  if (!json.success || !Array.isArray(json.requests)) {
    throw new Error('Status API returned an invalid response');
  }

  return {
    total: json.total ?? json.requests.length,
    running: json.running ?? json.requests.filter((r) => r.isRunning).length,
    requests: json.requests,
  };
}

export async function fetchLeadGenerationRequest(
  requestId: string
): Promise<LeadGenerationRequest> {
  return fetchLeadGenerationRequestWithAuth(requestId, null);
}

export async function fetchLeadGenerationRequestWithAuth(
  requestId: string,
  backendCookie?: string | null
): Promise<LeadGenerationRequest> {
  const base = getStatusApiUrl().replace(/\/$/, '');
  const res = await fetch(`${base}/${encodeURIComponent(requestId)}`, {
    cache: 'no-store',
    headers: scraperApiHeaders(undefined, backendCookie),
  });

  if (!res.ok) {
    throw new Error(`Status API returned ${res.status}`);
  }

  const json = (await res.json()) as ApiStatusDetailResponse;

  if (!json.success || !json.request) {
    throw new Error('Status API returned an invalid response');
  }

  return json.request;
}
