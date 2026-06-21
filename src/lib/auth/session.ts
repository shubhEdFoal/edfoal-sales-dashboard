export const DASHBOARD_AUTH_COOKIE = 'edfoal_dashboard_session';
const DEFAULT_AUTH_API_BASE = 'https://lateritious-lackadaisically-jalen.ngrok-free.dev';

export function getAuthApiBaseUrl() {
  return process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_API_BASE;
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
