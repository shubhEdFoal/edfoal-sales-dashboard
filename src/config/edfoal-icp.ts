/**
 * EdFoal ICP — Ideal Customer Profile for EdFoal (IT company).
 * Used by Generate Lead (auto + manual) so searches target buyers of IT services,
 * not unrelated local businesses (e.g. spas, salons).
 */

export const EDFOAL_ICP = {
  companyName: 'EdFoal',
  companyType: 'IT services & software',

  /** What we sell — shown in UI hints */
  offering:
    'Custom software, web/mobile apps, cloud, automation, and digital transformation',

  /**
   * Company types to prospect (B2B). Sent to n8n as field-0 (search intent).
   * Avoid: Spa, Salon, Restaurant, etc.
   */
  targetCompanyTypes: [
    'SaaS Startup',
    'FinTech Company',
    'E-commerce Brand',
    'EdTech Platform',
    'HealthTech Startup',
    'Digital Marketing Agency',
    'Logistics & Supply Chain Tech',
    'Manufacturing (Industry 4.0)',
    'Professional Services Firm',
    'Media & Entertainment Digital',
    'Real Estate PropTech',
    'HR Tech / Recruitment Platform',
    'Cybersecurity Firm',
    'AI / ML Product Company',
    'D2C Brand (scaling tech)',
  ],

  /** Primary markets — field-1 in n8n */
  targetLocations: [
    'Bangalore',
    'Hyderabad',
    'Pune',
    'Gurgaon',
    'Noida',
    'Mumbai',
    'Chennai',
    'Delhi',
    'Ahmedabad',
    'Kolkata',
  ],

  defaultLeadCount: '5',

  defaultTone: 'Professional' as const,

  /** Suggested values for Target Segment on Add Lead */
  targetSegmentExamples: [
    'SMB SaaS',
    'Mid-market',
    'Enterprise',
    'Series A–B startup',
    'Agency partner',
  ],
} as const;

export type EdfoalOutreachTone =
  | 'Aggressive'
  | 'Friendly'
  | 'Professional'
  | 'Casual';

export const EDFOAL_TONE_OPTIONS: EdfoalOutreachTone[] = [
  'Aggressive',
  'Friendly',
  'Professional',
  'Casual',
];
