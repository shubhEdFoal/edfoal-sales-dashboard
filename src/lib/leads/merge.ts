import type { Lead } from '@/data/leads';

function leadKey(lead: Lead): string {
  const email = lead.email.trim().toLowerCase();
  if (email) return `email:${email}`;
  return `id:${lead.id}`;
}

/** Merge incoming leads into existing (incoming wins on conflict). */
export function mergeLeads(existing: Lead[], incoming: Lead[]): Lead[] {
  const byKey = new Map<string, Lead>();
  for (const lead of existing) {
    byKey.set(leadKey(lead), lead);
  }
  for (const lead of incoming) {
    const key = leadKey(lead);
    const prev = byKey.get(key);
    byKey.set(key, prev ? { ...prev, ...lead, id: prev.id } : lead);
  }
  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
