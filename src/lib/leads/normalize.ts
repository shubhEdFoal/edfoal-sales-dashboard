import type { Lead } from '@/data/leads';

export function generateLeadId(): string {
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeLead(input: Partial<Lead> & { businessName?: string; email?: string }): Lead {
  const status = input.status ?? 'SENT';
  const responded =
    input.responded ??
    (status !== 'SENT' && status !== 'NO_RESPONSE');
  const replied =
    input.replied ?? (status === 'REPLIED' || status === 'MEETING_BOOKED');

  return {
    id: input.id?.trim() || generateLeadId(),
    businessName: (input.businessName ?? '').trim() || 'Untitled',
    email: (input.email ?? '').trim(),
    phone: (input.phone ?? '').trim(),
    website: (input.website ?? '').trim(),
    address: (input.address ?? '').trim(),
    status,
    sentId: (input.sentId ?? '').trim(),
    emailStyle: input.emailStyle ?? 'Professional',
    responded,
    replied,
    timestamp: input.timestamp ?? new Date().toISOString(),
    campaignHealth: input.campaignHealth ?? 'YELLOW',
    shouldContinue: input.shouldContinue ?? true,
    targetSegment: (input.targetSegment ?? '').trim(),
    followUpDay: typeof input.followUpDay === 'number' ? input.followUpDay : 0,
  };
}
