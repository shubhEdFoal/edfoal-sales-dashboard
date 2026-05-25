import type { EmailStyle, Lead } from '@/data/leads';

export interface MetricChainStep {
  key: 'discovered' | 'sent' | 'responded' | 'replied' | 'meeting' | 'qualified';
  label: string;
  count: number;
  conversionFromPrev: number | null;
}

export interface StylePerformance {
  style: EmailStyle;
  total: number;
  replyRate: number;
  meetingRate: number;
  qualifiedRate: number;
}

export interface SegmentPerformance {
  segment: string;
  total: number;
  replyRate: number;
  meetingRate: number;
  qualifiedRate: number;
}

export interface QuadrantStats {
  lagging: {
    qualified: number;
    qualifiedRate: number;
    meetings: number;
  };
  leading: {
    replyRate: number;
    meetingBookingRate: number;
    activeOutreach: number;
  };
  diagnostic: {
    sentToReplied: number;
    repliedToMeeting: number;
    meetingToQualified: number;
  };
  alerts: {
    total: number;
    redHealth: number;
    stalled: number;
    repliedNoMeeting: number;
    shouldNotContinue: number;
  };
}

export type AlertSeverity = 'red' | 'amber' | 'blue';

export interface ActionItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  count: number;
  recommendation: string;
}

export interface AnalyticsData {
  chain: MetricChainStep[];
  quadrant: QuadrantStats;
  styles: StylePerformance[];
  segments: SegmentPerformance[];
  actionItems: ActionItem[];
}

const STALLED_DAY_THRESHOLD = 7;
const EMAIL_STYLES: EmailStyle[] = ['Story-based', 'Professional', 'Casual', 'Value-led'];

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function computeMetricChain(leads: Lead[]): MetricChainStep[] {
  const discovered = leads.length;
  const sent = leads.filter(
    (l) => l.sentId.trim() !== '' || l.status !== 'QUALIFIED'
  ).length;
  const responded = leads.filter((l) => l.responded).length;
  const replied = leads.filter((l) => l.replied).length;
  const meeting = leads.filter((l) => l.status === 'MEETING_BOOKED').length;
  const qualified = leads.filter((l) => l.status === 'QUALIFIED').length;

  const steps: Omit<MetricChainStep, 'conversionFromPrev'>[] = [
    { key: 'discovered', label: 'Discovered', count: discovered },
    { key: 'sent', label: 'Outreach Sent', count: sent },
    { key: 'responded', label: 'Responded', count: responded },
    { key: 'replied', label: 'Replied', count: replied },
    { key: 'meeting', label: 'Meeting', count: meeting },
    { key: 'qualified', label: 'Qualified', count: qualified },
  ];

  return steps.map((step, idx) => {
    if (idx === 0) return { ...step, conversionFromPrev: null };
    const prev = steps[idx - 1];
    return {
      ...step,
      conversionFromPrev: pct(step.count, prev.count),
    };
  });
}

function performanceFor(group: Lead[]) {
  const total = group.length;
  const replied = group.filter((l) => l.replied).length;
  const meeting = group.filter((l) => l.status === 'MEETING_BOOKED').length;
  const qualified = group.filter((l) => l.status === 'QUALIFIED').length;
  return {
    total,
    replyRate: pct(replied, total),
    meetingRate: pct(meeting, total),
    qualifiedRate: pct(qualified, total),
  };
}

export function computeStylePerformance(leads: Lead[]): StylePerformance[] {
  return EMAIL_STYLES.map((style) => {
    const group = leads.filter((l) => l.emailStyle === style);
    return { style, ...performanceFor(group) };
  });
}

export function computeSegmentPerformance(leads: Lead[]): SegmentPerformance[] {
  const segments = new Map<string, Lead[]>();
  for (const lead of leads) {
    const key = lead.targetSegment?.trim() || 'Unsegmented';
    const existing = segments.get(key) ?? [];
    existing.push(lead);
    segments.set(key, existing);
  }

  return Array.from(segments.entries())
    .map(([segment, group]) => ({ segment, ...performanceFor(group) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
}

export function computeQuadrantStats(leads: Lead[]): QuadrantStats {
  const total = leads.length;
  const sent = leads.filter(
    (l) => l.sentId.trim() !== '' || l.status !== 'QUALIFIED'
  ).length;
  const replied = leads.filter((l) => l.replied).length;
  const meeting = leads.filter((l) => l.status === 'MEETING_BOOKED').length;
  const qualified = leads.filter((l) => l.status === 'QUALIFIED').length;

  const redHealth = leads.filter((l) => l.campaignHealth === 'RED').length;
  const stalled = leads.filter(
    (l) => !l.responded && l.followUpDay >= STALLED_DAY_THRESHOLD && l.shouldContinue
  ).length;
  const repliedNoMeeting = leads.filter(
    (l) => l.replied && l.status !== 'MEETING_BOOKED' && l.status !== 'QUALIFIED'
  ).length;
  const shouldNotContinue = leads.filter(
    (l) => !l.shouldContinue && l.status !== 'QUALIFIED'
  ).length;

  const activeOutreach = leads.filter(
    (l) => l.shouldContinue && l.status !== 'QUALIFIED'
  ).length;

  return {
    lagging: {
      qualified,
      qualifiedRate: safeRate(qualified, total),
      meetings: meeting,
    },
    leading: {
      replyRate: safeRate(replied, sent),
      meetingBookingRate: safeRate(meeting, sent),
      activeOutreach,
    },
    diagnostic: {
      sentToReplied: safeRate(replied, sent),
      repliedToMeeting: safeRate(meeting, replied),
      meetingToQualified: safeRate(qualified, meeting),
    },
    alerts: {
      total: redHealth + stalled + repliedNoMeeting + shouldNotContinue,
      redHealth,
      stalled,
      repliedNoMeeting,
      shouldNotContinue,
    },
  };
}

export function computeActionItems(leads: Lead[]): ActionItem[] {
  const redHealth = leads.filter((l) => l.campaignHealth === 'RED');
  const stalled = leads.filter(
    (l) => !l.responded && l.followUpDay >= STALLED_DAY_THRESHOLD && l.shouldContinue
  );
  const repliedNoMeeting = leads.filter(
    (l) => l.replied && l.status !== 'MEETING_BOOKED' && l.status !== 'QUALIFIED'
  );
  const shouldNotContinue = leads.filter(
    (l) => !l.shouldContinue && l.status !== 'QUALIFIED'
  );

  return [
    {
      id: 'red-health',
      severity: 'red',
      title: 'RED campaign health',
      description: 'Sender reputation risk \u2014 pause outreach immediately.',
      count: redHealth.length,
      recommendation: 'Warm up domain, reduce daily volume, clean bounce list.',
    },
    {
      id: 'replied-no-meeting',
      severity: 'amber',
      title: 'Replied but no meeting booked',
      description: 'Hot leads going cold \u2014 reply within 24 hours.',
      count: repliedNoMeeting.length,
      recommendation: 'Send calendar link with 2 time slots in the next reply.',
    },
    {
      id: 'stalled',
      severity: 'amber',
      title: `Stalled \u2265 ${STALLED_DAY_THRESHOLD} follow-ups`,
      description: 'No response after extended follow-up cadence.',
      count: stalled.length,
      recommendation: 'Switch email style or move to nurture sequence.',
    },
    {
      id: 'should-not-continue',
      severity: 'blue',
      title: 'Marked do-not-continue',
      description: 'Flagged for stop but still active in pipeline.',
      count: shouldNotContinue.length,
      recommendation: 'Move to suppression list to protect deliverability.',
    },
  ];
}

export function computeAnalytics(leads: Lead[]): AnalyticsData {
  return {
    chain: computeMetricChain(leads),
    quadrant: computeQuadrantStats(leads),
    styles: computeStylePerformance(leads),
    segments: computeSegmentPerformance(leads),
    actionItems: computeActionItems(leads),
  };
}
