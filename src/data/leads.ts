export type LeadStatus = 'SENT' | 'REPLIED' | 'MEETING_BOOKED' | 'NO_RESPONSE' | 'QUALIFIED';

export type EmailStyle = 'Story-based' | 'Professional' | 'Casual' | 'Value-led';

export type CampaignHealth = 'GREEN' | 'YELLOW' | 'RED';

export interface Lead {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  status: LeadStatus;
  sentId: string;
  emailStyle: EmailStyle;
  responded: boolean;
  replied: boolean;
  timestamp: string;
  campaignHealth: CampaignHealth;
  shouldContinue: boolean;
  targetSegment: string;
  followUpDay: number;
  allEmails?: string[];
  mailStatus?: string | null;
  response?: string | null;
  repliedByUs?: string | null;
  reEngagementSent?: string | null;
  schedulingSent?: string | null;
  requestID?: string | null;
  linkedinSearch?: string | null;
  mapsUrl?: string | null;
  rating?: string | null;
  state?: string | null;
  country?: string | null;
}

