export const DASHBOARD_AUTH_COOKIE = 'edfoal_dashboard_session';

export function getAuthApiBaseUrl() {
  return process.env.AUTH_API_BASE_URL?.trim() || 'http://localhost:8000';
}

export function getStoredBackendCookie(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  const backendCookies = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter((part) => !part.startsWith(`${DASHBOARD_AUTH_COOKIE}=`));

  return backendCookies.length > 0 ? backendCookies.join('; ') : null;
}
