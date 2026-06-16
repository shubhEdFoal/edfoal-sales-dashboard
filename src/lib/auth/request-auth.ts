import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { verifyAuthToken, type AuthTokenPayload } from '@/lib/auth/jwt';

export function extractTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    for (const part of cookieHeader.split(';')) {
      const [name, ...rest] = part.trim().split('=');
      if (name === AUTH_COOKIE_NAME) {
        const value = rest.join('=');
        if (value) return decodeURIComponent(value);
      }
    }
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export async function getAuthFromRequest(
  req: Request
): Promise<AuthTokenPayload | null> {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  return verifyAuthToken(token);
}
