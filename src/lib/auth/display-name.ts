export const DASHBOARD_USER_NAME_STORAGE_KEY = 'edfoal_dashboard_user_name';

interface AuthUserLike {
  email?: unknown;
  firstName?: unknown;
  first_name?: unknown;
  fullName?: unknown;
  full_name?: unknown;
  name?: unknown;
}

interface AuthResponseLike extends AuthUserLike {
  profile?: AuthUserLike;
  user?: AuthUserLike;
}

export function getDisplayNameFromAuthResponse(
  data: AuthResponseLike,
  fallbackEmail: string
) {
  return (
    getFirstNonEmptyString(
      data.user?.name,
      data.user?.fullName,
      data.user?.full_name,
      data.user?.firstName,
      data.user?.first_name,
      data.profile?.name,
      data.profile?.fullName,
      data.profile?.full_name,
      data.profile?.firstName,
      data.profile?.first_name,
      data.name,
      data.fullName,
      data.full_name,
      data.firstName,
      data.first_name
    ) ?? deriveDisplayNameFromEmail(getFirstNonEmptyString(data.user?.email, data.email) ?? fallbackEmail)
  );
}

export function deriveDisplayNameFromEmail(email: string) {
  const localPart = email.trim().split('@')[0] ?? '';
  const normalized = localPart.replace(/[._-]+/g, ' ').trim();
  if (!normalized) return 'EdFoal';

  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function getInitialsFromDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'EF';

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getFirstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value !== 'string') continue;

    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  return null;
}
