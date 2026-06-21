'use client';

import { ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { LeadRequestDetailModal } from '@/components/dashboard/LeadRequestDetailModal';
import { RequestStatusBadge } from '@/components/dashboard/RequestStatusBadge';
import type { LeadGenerationRequest } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface StatusApiResponse {
  success?: boolean;
  total?: number;
  running?: number;
  requests?: LeadGenerationRequest[];
  error?: string;
}

function formatRelativeTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

interface LeadRequestStatusPanelProps {
  refreshKey?: number;
  className?: string;
}

const PANEL_HEIGHT = 'h-[400px]';

export function LeadRequestStatusPanel({
  refreshKey = 0,
  className,
}: LeadRequestStatusPanelProps) {
  const [requests, setRequests] = useState<LeadGenerationRequest[]>([]);
  const [runningCount, setRunningCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const loadStatus = useCallback(async (options?: { silent?: boolean }) => {
    if (options?.silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/status?_=${Date.now()}`, { cache: 'no-store' });
      const data = (await res.json()) as StatusApiResponse;

      if (!res.ok || !data.requests) {
        throw new Error(data.error ?? 'Failed to load generation status');
      }

      setRequests(data.requests);
      setRunningCount(data.running ?? data.requests.filter((r) => r.isRunning).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load generation status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStatus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadStatus, refreshKey]);

  useEffect(() => {
    if (runningCount <= 0) return;

    const interval = setInterval(() => {
      void loadStatus({ silent: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [runningCount, loadStatus]);

  return (
    <>
      <section
        className={cn(
          'widget-card flex flex-col overflow-hidden',
          PANEL_HEIGHT,
          className
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Lead Generation
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Lead Generation Status
              </h2>
              {runningCount > 0 && (
                <span className="rounded-full bg-accent-amber/15 px-2 py-0.5 text-xs font-medium text-accent-amber">
                  {runningCount} running
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadStatus({ silent: true })}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-6">
          {error && (
            <div className="mb-3 shrink-0 rounded-2xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-accent-blue" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-white/45 px-4 py-8 text-center text-sm text-slate-500">
              No lead generation requests yet. Use Generate Lead to start a job.
            </div>
          ) : (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
              {requests.map((request) => (
                <button
                  key={request.requestID}
                  type="button"
                  onClick={() => setSelectedRequestId(request.requestID)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-left shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white/80"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {request.query || `${request.businessType} · ${request.state}`}
                      </p>
                      <RequestStatusBadge
                        status={request.status}
                        isRunning={request.isRunning}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {request.businessType} · {request.state}, {request.country} ·{' '}
                      {request.inserted}/{request.numberOfLeads} leads ·{' '}
                      {formatRelativeTime(request.startedAt)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <LeadRequestDetailModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
      />
    </>
  );
}
