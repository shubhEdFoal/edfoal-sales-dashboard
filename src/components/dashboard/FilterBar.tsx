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
    <section className="widget-card flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
        <input
          type="text"
          placeholder="Search business or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-2xl border border-white/60 bg-white/65 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm backdrop-blur placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>

      <select
        aria-label="Filter by Status"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        className="rounded-2xl border border-white/60 bg-white/65 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
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
        className="rounded-2xl border border-white/60 bg-white/65 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
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
