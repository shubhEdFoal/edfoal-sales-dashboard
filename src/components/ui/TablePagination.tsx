'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  function goTo(nextPage: number) {
    const clamped = Math.max(1, Math.min(nextPage, totalPages));
    if (clamped !== safePage) onPageChange(clamped);
  }

  const pages = getPageNumbers(safePage, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className="text-sm text-slate-400">
        {total === 0 ? (
          'No results'
        ) : (
          <>
            Showing <span className="font-medium text-slate-200">{start}</span>–
            <span className="font-medium text-slate-200">{end}</span> of{' '}
            <span className="font-medium text-slate-200">{total}</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goTo(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:bg-bg-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-500">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              aria-label={`Page ${p}`}
              aria-current={p === safePage ? 'page' : undefined}
              className={cn(
                'flex h-8 min-w-8 items-center justify-center rounded-btn px-2 text-sm transition-colors',
                p === safePage
                  ? 'bg-accent-blue/15 font-medium text-accent-blue'
                  : 'border border-border text-slate-400 hover:bg-bg-deep hover:text-white'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => goTo(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:bg-bg-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}
