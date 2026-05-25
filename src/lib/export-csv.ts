import type { Lead } from '@/data/leads';

const COLUMNS: { header: string; accessor: (lead: Lead) => string | number | boolean }[] = [
  { header: 'ID', accessor: (l) => l.id },
  { header: 'Business Name', accessor: (l) => l.businessName },
  { header: 'Email', accessor: (l) => l.email },
  { header: 'Phone', accessor: (l) => l.phone },
  { header: 'Website', accessor: (l) => l.website },
  { header: 'Address', accessor: (l) => l.address },
  { header: 'Status', accessor: (l) => l.status },
  { header: 'Sent ID', accessor: (l) => l.sentId },
  { header: 'Email Style', accessor: (l) => l.emailStyle },
  { header: 'Responded', accessor: (l) => (l.responded ? 'Yes' : 'No') },
  { header: 'Replied', accessor: (l) => (l.replied ? 'Yes' : 'No') },
  { header: 'Timestamp', accessor: (l) => l.timestamp },
  { header: 'Campaign Health', accessor: (l) => l.campaignHealth },
  { header: 'Should Continue', accessor: (l) => (l.shouldContinue ? 'Yes' : 'No') },
  { header: 'Target Segment', accessor: (l) => l.targetSegment },
  { header: 'Follow-up Day', accessor: (l) => l.followUpDay },
];

function escapeCSVValue(value: string | number | boolean): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSV(leads: Lead[]): string {
  const headerLine = COLUMNS.map((c) => escapeCSVValue(c.header)).join(',');
  const rows = leads.map((lead) =>
    COLUMNS.map((c) => escapeCSVValue(c.accessor(lead))).join(',')
  );
  return [headerLine, ...rows].join('\r\n');
}

function formatDateForFilename(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(
    date.getHours()
  )}${pad(date.getMinutes())}`;
}

export function downloadLeadsCSV(leads: Lead[], filenamePrefix = 'edfoal-leads'): void {
  const csv = buildCSV(leads);
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenamePrefix}_${formatDateForFilename(new Date())}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
