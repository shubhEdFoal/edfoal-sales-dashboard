'use client';

import { Search } from 'lucide-react';
import type { CampaignHealth, LeadStatus } from '@/data/leads';

export type StatusFilter = LeadStatus | 'ALL';
export type HealthFilter = CampaignHealth | 'ALL';

interface FilterBarProps {
  searchTerm: string;
  statusFilter: StatusFilter;
  healthFilter: HealthFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onHealthChange: (value: HealthFilter) => void;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'SENT', label: 'Sent' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'MEETING_BOOKED', label: 'Meeting Booked' },
  { value: 'NO_RESPONSE', label: 'No Response' },
  { value: 'QUALIFIED', label: 'Qualified' },
];

const healthOptions: { value: HealthFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'GREEN', label: 'Green' },
  { value: 'YELLOW', label: 'Yellow' },
  { value: 'RED', label: 'Red' },
];

export function FilterBar({
  searchTerm,
  statusFilter,
  healthFilter,
  onSearchChange,
  onStatusChange,
  onHealthChange,
}: FilterBarProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search business or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-btn border border-border bg-bg-surface py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
      </div>

      <select
        aria-label="Filter by Status"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        className="rounded-btn border border-border bg-bg-surface px-4 py-2.5 text-sm text-slate-300 focus:border-accent-blue focus:outline-none"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by Health"
        value={healthFilter}
        onChange={(e) => onHealthChange(e.target.value as HealthFilter)}
        className="rounded-btn border border-border bg-bg-surface px-4 py-2.5 text-sm text-slate-300 focus:border-accent-blue focus:outline-none"
      >
        {healthOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

    </section>
  );
}
