import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { Lead } from '@/data/leads';
import { normalizeLead } from '@/lib/leads/normalize';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const REDIS_KEY = 'edfoal:leads';

function useUpstash(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readFromFile(): Promise<Lead[]> {
  try {
    const raw = await readFile(LEADS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

async function writeToFile(leads: Lead[]): Promise<void> {
  await ensureDataDir();
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

async function upstashCommand(command: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Upstash command failed (${res.status})`);
  }
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

async function readFromUpstash(): Promise<Lead[]> {
  const result = await upstashCommand(['GET', REDIS_KEY]);
  if (!result || typeof result !== 'string') return [];
  try {
    const parsed = JSON.parse(result) as unknown;
    return Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch {
    return [];
  }
}

async function writeToUpstash(leads: Lead[]): Promise<void> {
  await upstashCommand(['SET', REDIS_KEY, JSON.stringify(leads)]);
}

async function readAll(): Promise<Lead[]> {
  if (useUpstash()) return readFromUpstash();
  return readFromFile();
}

async function writeAll(leads: Lead[]): Promise<void> {
  if (useUpstash()) {
    await writeToUpstash(leads);
    return;
  }
  await writeToFile(leads);
}

export async function getAllLeads(): Promise<Lead[]> {
  return readAll();
}

export async function saveAllLeads(leads: Lead[]): Promise<Lead[]> {
  await writeAll(leads);
  return leads;
}

export async function addLead(input: Partial<Lead>): Promise<Lead> {
  const lead = normalizeLead(input);
  const leads = await readAll();
  const next = [lead, ...leads.filter((l) => l.id !== lead.id)];
  await writeAll(next);
  return lead;
}

export async function addLeads(inputs: Partial<Lead>[]): Promise<Lead[]> {
  const normalized = inputs.map((l) => normalizeLead(l));
  const leads = await readAll();
  const byId = new Map(leads.map((l) => [l.id, l]));
  for (const lead of normalized) {
    byId.set(lead.id, lead);
  }
  const merged = Array.from(byId.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  await writeAll(merged);
  return normalized;
}

export async function deleteLeadById(id: string): Promise<boolean> {
  const leads = await readAll();
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  await writeAll(next);
  return true;
}
