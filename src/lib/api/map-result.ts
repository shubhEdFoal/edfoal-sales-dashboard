import type { CampaignHealth, EmailStyle, Lead, LeadStatus } from '@/data/leads';
import type { ApiResultItem } from '@/lib/api/types';

function stripPrefix(value: string | null | undefined, prefix: RegExp): string {
  if (!value) return '';
  return value.replace(prefix, '').trim();
}

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.includes('@') && !trimmed.endsWith('.png');
}

function pickEmail(emails: string[] | undefined): string {
  if (!emails?.length) return '';
  return emails.find(isValidEmail)?.trim() ?? '';
}

function parseYesNo(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === 'yes' || v === 'true' || v === '1' || v === 'done';
}

function mapEmailTone(tone: string | null | undefined): EmailStyle {
  const normalized = (tone ?? '').trim().toLowerCase();
  if (normalized === 'friendly' || normalized === 'casual') return 'Casual';
  if (normalized === 'aggressive') return 'Story-based';
  if (normalized === 'professional') return 'Professional';
  if (normalized === 'value-led' || normalized === 'value') return 'Value-led';
  return 'Professional';
}

function mapHealth(health: string | null | undefined, hasEmail: boolean): CampaignHealth {
  if (!health) return hasEmail ? 'GREEN' : 'YELLOW';
  const h = health.trim().toLowerCase();
  if (h === 'positive' || h === 'green') return 'GREEN';
  if (h === 'negative' || h === 'red') return 'RED';
  return 'YELLOW';
}

function mapStatus(item: ApiResultItem): LeadStatus {
  const response = (item.response ?? '').trim().toLowerCase();
  if (parseYesNo(item.schedulingSent)) return 'MEETING_BOOKED';
  if (response.includes('meeting')) return 'MEETING_BOOKED';
  if (response.includes('qualif')) return 'QUALIFIED';
  if (response) return 'REPLIED';
  if (item.sentId || item.mailStatus === 'sent') return 'SENT';
  return 'NO_RESPONSE';
}

function parseTimestamp(item: ApiResultItem): string {
  const raw = item.scrapedAt ?? item.createdAt;
  if (!raw) return new Date().toISOString();
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function mapApiResultToLead(item: ApiResultItem): Lead {
  const allEmails = (item.emails ?? []).map((e) => e.trim()).filter(Boolean);
  const email = pickEmail(allEmails);
  const phone = stripPrefix(item.phone, /^Phone:\s*/i);
  let address = stripPrefix(item.address, /^Address:\s*/i);

  const location = [item.state, item.country].filter(Boolean).join(', ');
  if (location && !address.toLowerCase().includes(location.toLowerCase())) {
    address = address ? `${address} (${location})` : location;
  }

  const responded = Boolean((item.response ?? '').trim());
  const replied = parseYesNo(item.repliedByUs);
  const status = mapStatus(item);
  const health = item.health?.trim().toLowerCase();

  return {
    id: String(item.id),
    businessName: item.name?.trim() || 'Untitled',
    email,
    phone,
    website: (item.website ?? '').trim(),
    address,
    status,
    sentId: (item.sentId ?? '').trim(),
    emailStyle: mapEmailTone(item.emailTone),
    responded,
    replied,
    timestamp: parseTimestamp(item),
    campaignHealth: mapHealth(item.health, Boolean(email)),
    shouldContinue: health !== 'negative',
    targetSegment: (item.businessType ?? '').trim(),
    followUpDay: 0,
    allEmails,
    mailStatus: item.mailStatus,
    response: item.response,
    repliedByUs: item.repliedByUs,
    reEngagementSent: item.reEngagementSent,
    schedulingSent: item.schedulingSent,
    requestID: item.requestID,
    linkedinSearch: item.linkedinSearch,
    mapsUrl: item.mapsUrl,
    rating: item.rating?.replace(/\s*stars?\s*/i, '').trim() || null,
    state: item.state,
    country: item.country,
  };
}

export function mapApiResultsToLeads(items: ApiResultItem[]): Lead[] {
  const seen = new Set<string>();
  const leads: Lead[] = [];

  for (const item of items) {
    const lead = mapApiResultToLead(item);
    if (seen.has(lead.id)) continue;
    seen.add(lead.id);
    leads.push(lead);
  }

  return leads.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
