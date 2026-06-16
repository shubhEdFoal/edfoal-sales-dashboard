const DEFAULT_API_BASE = 'https://lateritious-lackadaisically-jalen.ngrok-free.dev';

export function getScraperApiBase(): string {
  const resultsUrl = process.env.RESULTS_API_URL?.trim();
  if (resultsUrl) {
    try {
      const url = new URL(resultsUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      /* fall through */
    }
  }

  return process.env.SCRAPER_API_BASE_URL?.trim() || DEFAULT_API_BASE;
}

export function getResultsApiUrl(): string {
  return process.env.RESULTS_API_URL?.trim() || `${getScraperApiBase()}/api/results`;
}

export function getStatusApiUrl(): string {
  return process.env.STATUS_API_URL?.trim() || `${getScraperApiBase()}/api/status`;
}

export function getScrapeApiUrl(): string {
  return process.env.SCRAPE_API_URL?.trim() || `${getScraperApiBase()}/api/scrape`;
}

export function scraperApiHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (getScraperApiBase().includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}
