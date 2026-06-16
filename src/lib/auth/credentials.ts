import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const AUTH_FILE = path.join(DATA_DIR, 'auth-credentials.json');

interface AuthCredentialsFile {
  password?: string;
}

let fileStoreDisabled = false;

function isServerless(): boolean {
  if (fileStoreDisabled) return true;
  const cwd = process.cwd();
  return (
    process.env.VERCEL === '1' ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.NETLIFY) ||
    cwd.startsWith('/var/task')
  );
}

function useFileStore(): boolean {
  return !isServerless();
}

async function readStoredPassword(): Promise<string | null> {
  if (!useFileStore()) return null;
  try {
    const raw = await readFile(AUTH_FILE, 'utf-8');
    const data = JSON.parse(raw) as AuthCredentialsFile;
    return typeof data.password === 'string' && data.password.length > 0
      ? data.password
      : null;
  } catch {
    return null;
  }
}

export function getAuthRole(): string {
  return process.env.AUTH_ROLE?.trim() || 'Admin';
}

export function getExpectedUsername(): string | null {
  const username = process.env.AUTH_USERNAME?.trim();
  return username || null;
}

export async function getExpectedPassword(): Promise<string | null> {
  const stored = await readStoredPassword();
  if (stored) return stored;
  const envPass = process.env.AUTH_PASSWORD?.trim();
  return envPass || null;
}

export async function updateStoredPassword(newPassword: string): Promise<void> {
  if (!useFileStore()) {
    throw new Error('Password cannot be changed in this environment. Update AUTH_PASSWORD in env.');
  }
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const payload: AuthCredentialsFile = { password: newPassword };
    await writeFile(AUTH_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    fileStoreDisabled = true;
    throw err instanceof Error ? err : new Error('Failed to save password');
  }
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUser = getExpectedUsername();
  const expectedPass = await getExpectedPassword();

  if (!expectedUser || !expectedPass) {
    return false;
  }

  return username === expectedUser && password === expectedPass;
}

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.JWT_SECRET?.trim() &&
      process.env.AUTH_USERNAME?.trim() &&
      process.env.AUTH_PASSWORD?.trim()
  );
}
