import type {
  CampaignHealth,
  EmailStyle,
  Lead,
  LeadStatus,
} from '@/data/leads';

const STATUS_VALUES: LeadStatus[] = [
  'SENT',
  'REPLIED',
  'MEETING_BOOKED',
  'NO_RESPONSE',
  'QUALIFIED',
];

const HEALTH_VALUES: CampaignHealth[] = ['GREEN', 'YELLOW', 'RED'];

const EMAIL_STYLES: EmailStyle[] = [
  'Story-based',
  'Professional',
  'Casual',
  'Value-led',
];

const COLUMN_ALIASES: Record<keyof Lead, string[]> = {
  id: ['id', 'lead id', 'lead_id', 'row id'],
  businessName: ['business name', 'business', 'company', 'businessname', 'name'],
  email: ['email', 'email address', 'e-mail'],
  phone: ['phone', 'phone number', 'mobile'],
  website: ['website', 'url', 'site', 'web'],
  address: ['address', 'location'],
  status: ['status', 'lead status'],
  sentId: ['sent id', 'sentid', 'sent_id', 'sent-id', 'message id', 'messageid'],
  emailStyle: ['email style', 'emailstyle', 'style', 'email type'],
  responded: ['responded', 'has responded', 'response'],
  replied: ['replied', 'has replied', 'reply'],
  timestamp: ['timestamp', 'date', 'time', 'sent at', 'created at'],
  campaignHealth: ['campaign health', 'health', 'campaignhealth'],
  shouldContinue: ['should continue', 'shouldcontinue', 'continue'],
  targetSegment: ['target segment', 'segment', 'targetsegment', 'industry'],
  followUpDay: [
    'follow up day',
    'follow-up day',
    'followupday',
    'follow up',
    'followuptiming',
    'follow up timing',
    'follow-up timing',
  ],
};

const HEADER_ROW_MARKERS = new Set([
  'businessname',
  'business name',
  'email',
  'status',
]);

function looksLikeEmailStyle(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  return (
    EMAIL_STYLES.some((s) => s.toLowerCase() === v) ||
    v.includes('story') ||
    v.includes('profession') ||
    v.includes('casual') ||
    v.includes('value')
  );
}

function resolveStatusAndStyle(
  statusRaw: string,
  emailStyleRaw: string
): { status: LeadStatus; emailStyle: EmailStyle } {
  if (looksLikeEmailStyle(statusRaw) && !emailStyleRaw.trim()) {
    return { status: 'SENT', emailStyle: parseEmailStyle(statusRaw) };
  }
  return {
    status: parseStatus(statusRaw),
    emailStyle: emailStyleRaw.trim()
      ? parseEmailStyle(emailStyleRaw)
      : parseEmailStyle(''),
  };
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[_-]+/g, ' ');
}

function pickValue(row: Record<string, string>, field: keyof Lead): string {
  const aliases = COLUMN_ALIASES[field];
  for (const [key, value] of Object.entries(row)) {
    const normalized = normalizeKey(key);
    if (aliases.includes(normalized) && value.trim() !== '') {
      return value.trim();
    }
  }
  return '';
}

function parseBool(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  return (
    v === 'true' ||
    v === 'yes' ||
    v === '1' ||
    v === 'y' ||
    v === 'done' ||
    v === 'replied'
  );
}

/** Sheet column "Response" — Yes / No */
function parseResponse(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  if (v === 'no' || v === 'false' || v === '0' || v === 'n') return false;
  return parseBool(value);
}

/** Sheet column "Replied" — Done / Yes / No */
function parseReplied(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  if (v === 'no' || v === 'false' || v === '0' || v === 'n') return false;
  return parseBool(value);
}

function parseStatus(value: string): LeadStatus {
  const upper = value.trim().toUpperCase().replace(/\s+/g, '_');
  if (STATUS_VALUES.includes(upper as LeadStatus)) {
    return upper as LeadStatus;
  }
  if (upper.includes('MEETING')) return 'MEETING_BOOKED';
  if (upper.includes('REPL')) return 'REPLIED';
  if (upper.includes('QUALIF')) return 'QUALIFIED';
  if (upper.includes('NO') && upper.includes('RESP')) return 'NO_RESPONSE';
  return 'SENT';
}

function parseHealth(value: string): CampaignHealth {
  const upper = value.trim().toUpperCase();
  if (HEALTH_VALUES.includes(upper as CampaignHealth)) {
    return upper as CampaignHealth;
  }
  return 'YELLOW';
}

function parseEmailStyle(value: string): EmailStyle {
  const normalized = value.trim().toLowerCase();
  const match = EMAIL_STYLES.find((s) => s.toLowerCase() === normalized);
  if (match) return match;
  if (normalized.includes('story')) return 'Story-based';
  if (normalized.includes('prof')) return 'Professional';
  if (normalized.includes('casual')) return 'Casual';
  if (normalized.includes('value')) return 'Value-led';
  return 'Professional';
}

function parseFollowUpDay(value: string): number {
  const match = value.match(/\d+/);
  if (match) return parseInt(match[0], 10);
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

function isHeaderRow(row: Record<string, string>): boolean {
  const business = pickValue(row, 'businessName').toLowerCase();
  const email = pickValue(row, 'email').toLowerCase();
  return HEADER_ROW_MARKERS.has(business) || email === 'email';
}

export function mapRowToLead(row: Record<string, string>, index: number): Lead {
  const businessName = pickValue(row, 'businessName');
  const email = pickValue(row, 'email');
  const statusRaw = pickValue(row, 'status');
  const emailStyleRaw = pickValue(row, 'emailStyle');
  const { status, emailStyle } = resolveStatusAndStyle(statusRaw, emailStyleRaw);
  const respondedRaw = pickValue(row, 'responded');
  const repliedRaw = pickValue(row, 'replied');

  const responded =
    respondedRaw !== ''
      ? parseResponse(respondedRaw)
      : status !== 'SENT' && status !== 'NO_RESPONSE';
  const replied =
    repliedRaw !== ''
      ? parseReplied(repliedRaw)
      : status === 'REPLIED' || status === 'MEETING_BOOKED';

  const id = pickValue(row, 'id') || String(index + 1);
  const timestamp = pickValue(row, 'timestamp') || new Date().toISOString();

  return {
    id,
    businessName: businessName || `Lead ${index + 1}`,
    email,
    phone: pickValue(row, 'phone'),
    website: pickValue(row, 'website'),
    address: pickValue(row, 'address'),
    status,
    sentId: pickValue(row, 'sentId'),
    emailStyle,
    responded,
    replied,
    timestamp,
    campaignHealth: parseHealth(pickValue(row, 'campaignHealth')),
    shouldContinue: pickValue(row, 'shouldContinue')
      ? parseBool(pickValue(row, 'shouldContinue'))
      : true,
    targetSegment: pickValue(row, 'targetSegment'),
    followUpDay: parseFollowUpDay(pickValue(row, 'followUpDay')),
  };
}

export function mapRowsToLeads(rows: Record<string, string>[]): Lead[] {
  const seen = new Set<string>();
  const leads: Lead[] = [];

  for (const [index, row] of rows.entries()) {
    if (!Object.values(row).some((v) => v.trim() !== '')) continue;
    if (isHeaderRow(row)) continue;

    const lead = mapRowToLead(row, index);
    const dedupeKey = lead.email.trim().toLowerCase() || lead.id;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    leads.push(lead);
  }

  return leads;
}
