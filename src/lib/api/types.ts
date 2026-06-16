export interface ApiResultItem {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: string | null;
  emails: string[];
  linkedinSearch: string | null;
  mapsUrl: string | null;
  businessType: string | null;
  state: string | null;
  country: string | null;
  emailTone: string | null;
  sentId: string | null;
  mailStatus: string | null;
  response: string | null;
  repliedByUs: string | null;
  health: string | null;
  reEngagementSent: string | null;
  schedulingSent: string | null;
  scrapedAt: string | null;
  requestID: string | null;
  createdAt: string | null;
}

export interface ApiResultsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: ApiResultItem[];
}

export interface LeadGenerationRequest {
  requestID: string;
  status: string;
  isRunning: boolean;
  businessType: string;
  state: string;
  country: string;
  numberOfLeads: number;
  emailTone: string;
  query: string;
  inserted: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
}

export interface ApiStatusListResponse {
  success: boolean;
  total: number;
  running: number;
  requests: LeadGenerationRequest[];
}

export interface ApiStatusDetailResponse {
  success: boolean;
  request: LeadGenerationRequest;
}
